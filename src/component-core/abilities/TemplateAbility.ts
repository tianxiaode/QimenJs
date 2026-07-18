/**
 * TemplateAbility — 模板组件能力
 *
 * 将 withTemplate 的实例方法提取为能力定义，
 * 通过 ComposableBase.with() 合并到原型上。
 *
 * 职责：
 * - _initWithTemplate：withTemplate 强类自动初始化
 * - _initElementFromTemplate：创建 el + 克隆模板 + buildNodeMap
 * - _buildNodeMapFromCompiled：从预编译数据构建 nodeMap + eventMap
 * - _renderChildComponents：渲染 data-json 占位节点的子组件实体
 *
 * 子组件渲染流程：
 * 1. 模板中用 data-json 声明占位节点，data-json-mode 声明挂载模式
 * 2. JSON 模式的 json 字段可直接传组件类引用，withTemplate 预编译时提取到 _jsonComponentMap
 * 3. static children 提供差异化配置（props），key 对应 data-content 的 name
 * 4. _renderChildComponents() 遍历 nodeMap 中有 componentClass 的节点，
 *    从 static children 查找对应 props，创建子组件实例
 * 5. 根据 jsonMode 替换或挂载占位节点，记录 parentNode/nodeIndex 用于后续替换
 * 6. 更新 nodeMap 中的 el、component、componentClass 字段
 * 7. 后续 bindExternalEvents 绑定到子组件实体的 el 上，事件从宿主的 eventScope 发出
 *
 * 子组件销毁：
 * - 不使用 onCleanup 注册子组件销毁（无法取消，替换时会累积）
 * - 由 TemplateComponent.dispose 统一调用 _disposeChildComponents 遍历 nodeMap 销毁
 * - 替换组件时只需更新 nodeMap 引用，旧组件手动 dispose
 *
 * 节点替换和递归销毁由 ChildSlotAbility 提供（独立能力，按需组合）
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import type { NodeIndexPath, NodeTemplateMeta, NodeMetadata } from '../types/index';
import type { DomEventBinding } from '../types/template';
import type { CompiledComponentTemplate } from '../types/template-json';
import { findByPath } from '../template-compiler';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { mergePropAliases, applyPropAliases } from './PropAlias';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import { EntityEventBus } from '@/events';

export const TemplateAbility: AbilityDefinition = {
    /**
     * withTemplate 强类自动初始化
     *
     * 构造时自动完成：内容填充、事件绑定、能力初始化、注册。
     *
     * 配置来源（优先级从低到高）：
     * 1. static 属性（children、listens 等）— 类定义时确定
     * 2. props 参数 — 实例化时传入，可覆盖 static
     */
    _initWithTemplate(props?: Record<string, any>): void {
        this._initializing = true;

        // 保存 props 到实例
        if (props) this.props = { ...this.props, ...props };

        // 合并配置：static 属性为基础，props 可覆盖
        const ctor = this.constructor as any;
        const cfg: Record<string, any> = {
            listens: ctor.listens ? [...ctor.listens] : undefined,
            abilities: ctor.abilities,
            entity: ctor.entity,
            eventBridge: ctor.eventBridge,
            meta: ctor.meta,
            ...props,
        };

        this.logger?.debug?.(
            '[Template] _initWithTemplate, type =',
            ctor.type,
            'listens =',
            cfg.listens?.length ?? 0,
            'eventBridge =',
            !!cfg.eventBridge
        );

        try {
            // ── 1. 创建 el + 克隆模板 + buildNodeMap ──
            this._initElementFromTemplate();

            // ── 2. 配置初始化（abilities、extraFns、entity、eventBridge、meta） ──
            if (cfg.abilities) this.setupAbilities(cfg.abilities);
            if (cfg.extraFns) {
                for (const [key, fn] of Object.entries(cfg.extraFns)) {
                    Object.defineProperty(this, key, {
                        value: (fn as Function).bind(this),
                        writable: true,
                        configurable: true,
                        enumerable: true,
                    });
                }
            }
            if (cfg.entity) {
                const manager = new cfg.entity();
                this.mgr = manager;
                this.onCleanup(() => manager.dispose());
            }
            if (cfg.eventBridge) {
                this.setEventBridge(cfg.eventBridge);
                queueMicrotask(() => {
                    if (typeof this.initEventBridge === 'function') this.initEventBridge();
                });
            }
            if (cfg.meta) this.meta = { ...cfg.meta };

            // ── 3. 内容填充 + i18n ──
            this.initContentFromProps(cfg);
            if (ctor.abilities) {
                const aliasMap = mergePropAliases(ctor.abilities);
                if (Object.keys(aliasMap).length > 0) {
                    applyPropAliases(this, cfg, aliasMap);
                }
            }
            this.initI18nFromTemplate();
            this.setupI18nListener();

            // ── 3.5 渲染子组件（data-json 占位节点 → 组件实体） ──
            this._renderChildComponents();

            // ── 3.6 设置 forwards 透传（body.forwards → nodeMap 路径解析 → 属性/方法代理） ──
            this._setupForwards();

            // ── 3.6 从 props 中提前设置 eventKey（bindDomEventBindings 依赖） ──
            if (cfg.eventKey !== undefined) {
                (this as any).eventKey = cfg.eventKey;
            }

            // ── 4. 事件绑定 ──
            // 4.1 统一 DOM 事件绑定（合并 handler/emits/bridges，一次 this.bind 搞定）
            this.bindDomEventBindings();
            // 4.2 外部事件绑定
            this.bindExternalEvents({ listens: cfg.listens } as any);
            const listenConfig = this._extractListensOn(cfg.listens);
            if (listenConfig) this.bindEventListen(listenConfig);

            // ── 5. 调用能力的 __init__ 方法 ──
            this.callInitMethods();

            // ── 6. 注册到 ComponentRegistrar ──
            if (props?.id) this.id = props.id;
            ComponentRegistrar.getInstance().registerInstance(this as any);
        } finally {
            this._initializing = false;
            this.flush();
        }
    },

    /**
     * 创建根 DOM 元素 + 克隆预编译模板 + 构建 nodeMap
     */
    _initElementFromTemplate(): void {
        this.el = document.createElement(this.tag);

        const ctor = this.constructor as any;
        const fragment = ctor._cloneFragment();
        this.el.appendChild(fragment);

        const compiled: CompiledComponentTemplate = ctor._compiledTemplate;

        if (compiled.rootClassName) this.el.className = compiled.rootClassName;
        applyStyle(
            this.el,
            compiled.rootStyle,
            compiled.rootLayout,
            compiled.rootGap,
            compiled.rootAlign,
            compiled.rootPack,
            compiled.rootWrap
        );

        this._buildNodeMapFromCompiled();
    },

    /**
     * 从预编译数据构建 nodeMap + eventMap
     */
    _buildNodeMapFromCompiled(): void {
        const ctor = this.constructor as any;
        const compiled: CompiledComponentTemplate = ctor._compiledTemplate;
        const indexPath: NodeIndexPath = compiled.indexPath;
        const templateMetas: Record<string, NodeTemplateMeta> = compiled.templateMetas;
        const jsonComponentMap: Record<string, new (props?: Record<string, any>) => any> =
            compiled.componentMap || {};

        // 构建 nodeMap
        for (const [key, path] of Object.entries(indexPath)) {
            const meta = templateMetas[key];
            if (!meta) continue;

            const el = findByPath(this.el, path);
            if (!el) continue;

            const node: NodeMetadata = {
                el,
                name: meta.name,
                delegateTarget: meta.delegateTarget,
                jsonRef: meta.jsonRef,
                jsonMode: meta.jsonMode,
                templateRef: meta.templateRef,
                i18nKey: meta.i18nKey,
                props: meta.props,
            };

            if (meta.className) el.className = meta.className;
            applyStyle(el, meta.style, meta.layout, meta.gap, meta.align, meta.pack, meta.wrap);
            if (meta.attrs) {
                for (const [k, v] of Object.entries(meta.attrs)) {
                    el.setAttribute(k, v);
                }
            }
            if (meta.text) el.textContent = meta.text;
            if (meta.hidden) el.hidden = true;

            // 如果有组件类映射，填充 componentClass
            if (meta.jsonRef && jsonComponentMap[meta.name]) {
                node.componentClass = jsonComponentMap[meta.name];
            }

            this.nodeMap[meta.name] = node;
        }

        // 构建 eventMap（从预编译的 domEventBindings 构建）
        // eventMap.internal 和 eventMap.external 由 bindDomEventBindings 在运行时使用
        // 此处只初始化空结构
        this.eventMap = { internal: [], external: {} };
    },

    /**
     * 渲染子组件实体
     *
     * 支持两种模式：
     *
     * v1（旧）：遍历 nodeMap 中有 componentClass 的节点，
     * 从 static children 查找差异化 props，创建子组件实例。
     *
     * v2（新）：从 _contentDef 获取子节点配置，
     * 递归渲染时把 content 对应部分传给子节点构造器。
     * 每层只传一层，自然层层到达，不需要透传。
     *
     * @param children - 子组件差异化配置（v1: static children），可选
     */

    /**
     * 渲染子组件 — props.childProps 驱动
     *
     * childProps 是使用方传入的子节点配置，key 对应 tpl children 的 name。
     * 每个子节点的值结构：{ props, body, childProps }，天然递归。
     *
     * 流程：
     * 1. 从 this.props.childProps 取使用方传入的配置
     * 2. 遍历 childProps 的 key，在 nodeMap 中找对应子节点
     * 3. DOM 节点：直接设 el 属性（className/innerHTML/style）
     * 4. 组件节点：把 props + body + childProps 传给子组件构造器（递归）
     *
     * @example
     * ```ts
     * // AppShell 使用 Button
     * { type: ButtonComponent, props: {
     *     childProps: {
     *         icon: { props: { className: 'fa-bars' } },
     *         text: { props: { innerHTML: '保存' } },
     *     }
     * } }
     *
     * // 三层递归：工具栏 → 按钮 → 图标
     * { type: ToolbarComponent, props: {
     *     childProps: {
     *         darkBtn: {
     *             props: { className: 'ghost' },
     *             childProps: {
     *                 icon: { props: { className: 'fa-moon' } },
     *             },
     *         },
     *     }
     * } }
     * ```
     */
    _renderChildComponents(): void {
        const userChildProps = this.props?.childProps as Record<string, any> | undefined;
        if (!userChildProps || Object.keys(userChildProps).length === 0) return;

        for (const [nodeKey, nodeConfig] of Object.entries(userChildProps)) {
            // 在 nodeMap 中查找对应的子节点
            const node = this._findNodeByContentKey(nodeKey);
            if (!node) continue;

            // DOM 节点：直接设置属性
            if (!node.componentClass) {
                if (nodeConfig && typeof nodeConfig === 'object') {
                    // nodeConfig.props 里的属性设到 el 上
                    const elProps = nodeConfig.props || nodeConfig;
                    for (const [propKey, propVal] of Object.entries(elProps)) {
                        if (propKey === 'innerHTML' && node.el) {
                            node.el.innerHTML = propVal;
                        } else if (propKey === 'className' && node.el) {
                            node.el.className = propVal;
                        } else if (propKey === 'style' && node.el) {
                            if (typeof propVal === 'string') {
                                node.el.setAttribute('style', propVal);
                            } else {
                                Object.assign(node.el.style, propVal);
                            }
                        }
                    }
                }
                continue;
            }

            // 组件节点：构建子组件构造参数
            const ComponentClass = node.componentClass;
            const ctorProps: Record<string, any> = {};

            // nodeConfig.props → 子组件的 props
            if (nodeConfig?.props) {
                Object.assign(ctorProps, nodeConfig.props);
            }
            // nodeConfig.childProps → 递归传递
            if (nodeConfig?.childProps && Object.keys(nodeConfig.childProps).length > 0) {
                ctorProps.childProps = nodeConfig.childProps;
            }
            // nodeConfig.body → 子组件的 body
            if (nodeConfig?.body) {
                Object.assign(ctorProps, nodeConfig.body);
            }
            // 简写：nodeConfig 没有 props/body/childProps 层，直接当 props 传
            if (
                nodeConfig &&
                typeof nodeConfig === 'object' &&
                !nodeConfig.props &&
                !nodeConfig.childProps &&
                !nodeConfig.body
            ) {
                Object.assign(ctorProps, nodeConfig);
            }

            this.logger?.debug?.(
                '[Template] _renderChildComponents, key =',
                nodeKey,
                'componentClass =',
                ComponentClass?.name || (ComponentClass as any)?.type,
                'ctorProps =',
                Object.keys(ctorProps)
            );

            // 创建子组件实例
            const child = new ComponentClass(ctorProps);

            // 设置父引用
            (child as any).parent = this;

            // 挂载
            this._mountChildComponent(node, child);
        }
    },

    /**
     * 根据 contentKey 在 nodeMap 中查找子节点
     *
     * contentKey 对应 tpl.children 中的 name 或 content 属性
     */
    _findNodeByContentKey(contentKey: string): NodeMetadata | null {
        return this.nodeMap[contentKey] ?? null;
    },

    /**
     * 挂载子组件到 DOM
     *
     * 根据 jsonMode 替换或挂载占位节点，记录 DOM 位置索引，
     * 并更新 nodeMap 中的 el、component 字段。
     */
    _mountChildComponent(node: NodeMetadata, child: any): void {
        // 根据 jsonMode 挂载，并记录 DOM 位置索引
        const jsonMode = node.jsonMode ?? 'replace';
        if (jsonMode === 'replace') {
            // replace 模式：记录位置索引，用于后续替换
            const parentEl = node.el.parentElement;
            if (parentEl) {
                node.parentNode = parentEl;
                node.nodeIndex = Array.from(parentEl.childNodes).indexOf(node.el);
            }
            // 子组件 el 替换占位节点
            node.el.replaceWith(child.el);
        } else {
            // child 模式：子组件 el 挂载到占位节点内，位置固定
            node.parentNode = null;
            node.el.appendChild(child.el);
        }

        // 更新 nodeMap：el 指向子组件实体的 el，component 存实例引用
        node.el = child.el;
        node.component = child;
    },

    /**
     * 遍历 nodeMap 递归销毁子组件
     */
    _disposeChildComponents(): void {
        for (const node of Object.values(this.nodeMap) as NodeMetadata[]) {
            if (node.component && typeof node.component.dispose === 'function') {
                node.component.dispose();
                node.component = null;
            }
        }
    },

    /**

     * 绑定合并后的 DOM 事件
     *
     * 使用编译时从 DomEventDecl 生成的 DomEventBinding 结构，
     * 区分两条执行路径：
     *
     * 1. DOM 节点：this.bind(el, event) → 手势适配器 → this.on('dom:xxx', callback)
     *    callback 中统一处理 handler / emits / bridges
     *
     * 2. 子组件：childComponent.on(event, callback)
     *    callback 中统一处理 emits / bridges
     *    子组件不需要 handler（子组件自己内部处理 DOM 事件）
     *
     * 优势：
     * - 同一 DOM 事件只绑定一次 this.bind()
     * - 统一处理三种事件用途，代码更清晰
     * - 天然解决 EventBus 无 scopeId 隔离导致的跨组件事件泄漏问题
     */
    bindDomEventBindings(): void {
        const ctor = this.constructor as any;
        const compiled: CompiledComponentTemplate = ctor._compiledTemplate;
        const bindings: DomEventBinding[] = compiled.domEventBindings;
        if (!bindings || bindings.length === 0) return;

        const eventKey = this.eventKey;

        this.logger?.debug?.(
            '[Template] bindDomEventBindings, count =',
            bindings.length,
            'type =',
            ctor.type,
            'scopeId =',
            this.eventScope?.getScopeId?.()
        );

        for (const binding of bindings) {
            const {
                event,
                nodeKey,
                handler,
                once,
                delegate,
                delegateTarget,
                debounce,
                throttle,
                emits,
                bridges,
                entities,
            } = binding;

            const node = this.nodeMap[nodeKey];
            if (!node) continue;

            if (node.component) {
                this._bindComponentEvent(node.component, event, {
                    once,
                    emits,
                    bridges,
                    entities,
                    eventKey,
                });
            } else {
                this._bindDomEvent(node, event, {
                    handler,
                    once,
                    delegate,
                    delegateTarget,
                    debounce,
                    throttle,
                    emits,
                    bridges,
                    entities,
                    eventKey,
                });
            }
        }
    },

    /**
     * 绑定 DOM 节点事件
     *
     * 通过 this.bind() 绑定 DOM 事件（走手势适配器），
     * 在回调中统一处理 handler / emits / bridges。
     */
    _bindDomEvent(
        node: NodeMetadata,
        event: string,
        options: {
            handler?: string;
            once?: boolean;
            delegate?: boolean;
            delegateTarget?: string;
            debounce?: number;
            throttle?: number;
            emits?: string[];
            bridges?: { targetEvent: string; once?: boolean }[];
            entities?: string;
            eventKey?: string;
        }
    ): void {
        const el = node.el;
        if (!el) return;

        const {
            handler,
            once,
            delegate,
            delegateTarget,
            debounce,
            throttle,
            emits,
            bridges,
            entities,
            eventKey,
        } = options;
        const domEvent = `${DOM_EVENT_PREFIX}${event}`;

        this.logger?.debug?.(
            '[Template] _bindDomEvent, event =',
            event,
            'domEvent =',
            domEvent,
            'handler =',
            handler,
            'emits =',
            emits,
            'bridges =',
            bridges
        );

        // 构建 bind 选项
        const bindOptions: any = {};
        if (debounce && debounce > 0) bindOptions.debounce = debounce;
        if (throttle && throttle > 0) bindOptions.throttle = throttle;

        // 一次 this.bind() 绑定 DOM 事件
        if (delegate) {
            this.bind(el, event as any, { ...bindOptions, selector: delegateTarget });
        } else {
            this.bind(el, event as any, bindOptions);
        }

        // 统一回调：一次 this.on() 处理 handler + emits + bridges
        const callback = (ctx: any) => {
            const domEvt = this._extractDomEvent(ctx);

            // 1. 内部 handler
            if (handler && typeof (this as any)[handler] === 'function') {
                if (delegate && delegateTarget) {
                    const target = (domEvt?.target as HTMLElement)?.closest(delegateTarget);
                    if (target) (this as any)[handler](domEvt, target);
                } else {
                    (this as any)[handler](domEvt, el);
                }
            }

            // 2. 转发为组件事件（emits）
            if (emits?.length) {
                for (const emitName of emits) {
                    this.emit(emitName, domEvt);
                }
            }

            // 3. 桥接转发（bridges）
            if (bridges?.length && eventKey) {
                for (const bridge of bridges) {
                    this.bridgeEmit(eventKey, bridge.targetEvent, domEvt);
                }
            }

            // 4. 实体操作（entities）
            if (entities && this.entityKey) {
                EntityEventBus.getInstance().entityEmit(this.entityKey, entities, domEvt);
            }
        };

        if (once) {
            this.once(domEvent, callback);
        } else {
            this.on(domEvent, callback);
        }
    },

    /**
     * 绑定子组件事件
     *
     * 通过 childComponent.on() 监听子组件事件，
     * 在回调中统一处理 emits / bridges。
     * 子组件不需要 handler（子组件自己内部处理 DOM 事件并 emit）。
     */
    _bindComponentEvent(
        component: any,
        event: string,
        options: {
            once?: boolean;
            emits?: string[];
            bridges?: { targetEvent: string; once?: boolean }[];
            entities?: string;
            eventKey?: string;
        }
    ): void {
        const { once, emits, bridges, entities, eventKey } = options;

        this.logger?.debug?.(
            '[Template] _bindComponentEvent, event =',
            event,
            'emits =',
            emits,
            'bridges =',
            bridges
        );

        const callback = (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;

            // 1. 转发为组件事件（emits）
            if (emits?.length) {
                for (const emitName of emits) {
                    this.emit(emitName, data);
                }
            }

            // 2. 桥接转发（bridges）
            if (bridges?.length && eventKey) {
                for (const bridge of bridges) {
                    this.bridgeEmit(eventKey, bridge.targetEvent, data);
                }
            }

            // 3. 实体操作（entities）
            if (entities && this.entityKey) {
                EntityEventBus.getInstance().entityEmit(this.entityKey, entities, data);
            }
        };

        if (once) {
            component.once?.(event, callback);
        } else {
            const off = component.on?.(event, callback);
            if (typeof off === 'function') {
                this.onCleanup(off);
            }
        }
    },

    // ─── forwards 透传 ───

    /**
     * 设置 body.forwards 透传
     *
     * forwards 定义在 body 上，是属性/方法透传的统一入口：
     * - 属性级透传：{ title: 'header.title' } → dialog.title 代理到 headerComponent.title
     * - 组件级透传：{ icon: 'icon' } → dialog.icon 返回 iconComponent + 自动属性 + 方法代理
     * - 深层透传：{ icon: 'header.icon' } → 沿 nodeMap 逐级解析
     *
     * 路径解析规则：
     * - 'icon' → this.nodeMap.icon.component
     * - 'header.title' → this.nodeMap.header.component.title（属性级）
     * - 'header.icon' → this.nodeMap.header.component.nodeMap.icon.component（深层组件级）
     */
    _setupForwards(): void {
        const ctor = this.constructor as any;
        const forwards: Record<string, any> | undefined = ctor._forwards;
        if (!forwards) return;

        for (const [localName, config] of Object.entries(forwards)) {
            if (typeof config === 'string') {
                const resolved = this._resolveForwardPath(config);
                if (!resolved) {
                    this.logger?.warn?.('[Template] _setupForwards: path not resolved:', config);
                    continue;
                }
                const { target, propName } = resolved;
                if (propName) {
                    this._setupPropertyForward(localName, target, propName);
                } else {
                    this._setupComponentForward(localName, target);
                }
            } else if (config && typeof config === 'object') {
                const resolved = this._resolveForwardPath(config.path);
                if (!resolved) {
                    this.logger?.warn?.(
                        '[Template] _setupForwards: path not resolved:',
                        config.path
                    );
                    continue;
                }
                const { target, propName } = resolved;
                if (propName) {
                    this._setupPropertyForward(localName, target, propName);
                } else {
                    this._setupComponentForward(localName, target, config.methods);
                }
            }
        }
    },

    /**
     * 解析 forwards 路径
     *
     * 路径格式：'header.title' 或 'icon' 或 'header.icon'
     * 沿 nodeMap 逐级查找，最后一段可能是组件名或属性名
     */
    _resolveForwardPath(path: string): { target: any; propName?: string } | null {
        const parts = path.split('.');
        let current: any = this;
        let lastComponent: any = null;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const node = current.nodeMap?.[part];

            if (node?.component) {
                lastComponent = node.component;
                current = node.component;
            } else if (i === parts.length - 1 && lastComponent) {
                return { target: lastComponent, propName: part };
            } else {
                return null;
            }
        }

        return lastComponent ? { target: lastComponent } : null;
    },

    /**
     * 属性级透传：dialog.title → headerComponent.title
     *
     * 在父组件上生成 getter/setter，代理到目标组件的指定属性
     */
    _setupPropertyForward(localName: string, target: any, propName: string): void {
        Object.defineProperty(this, localName, {
            get() {
                return target[propName];
            },
            set(v: any) {
                target[propName] = v;
            },
            configurable: true,
            enumerable: true,
        });
    },

    /**
     * 组件级透传：dialog.icon → iconComponent
     *
     * 1. 生成 accessor：dialog.icon → iconComponent
     * 2. 生成自动属性透传：dialog.iconClassName → iconComponent.el.className 等
     * 3. 代理目标组件的公共方法
     */
    _setupComponentForward(
        localName: string,
        target: any,
        methods?: string[] | Record<string, string>
    ): void {
        Object.defineProperty(this, localName, {
            get() {
                return target;
            },
            configurable: true,
            enumerable: true,
        });

        this._forwardAutoProps(target, localName);
        this._proxyComponentMethods(target, localName, methods);
    },

    /**
     * 自动属性透传（与 TplNode.forward: true 相同逻辑）
     *
     * 生成 iconClassName → iconComponent.el.className
     * 生成 iconStyle → iconComponent.el.style
     * 生成 iconSize → iconComponent.size
     */
    _forwardAutoProps(target: any, localName: string): void {
        const elProps = ['className', 'style'];
        const compProps = ['size'];

        for (const prop of [...elProps, ...compProps]) {
            const isElProp = elProps.includes(prop);
            const attrName = `${localName}${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;

            if (attrName in this) continue;

            if (isElProp) {
                Object.defineProperty(this, attrName, {
                    get() {
                        return target.el?.[prop] ?? '';
                    },
                    set(v: any) {
                        if (target.el) target.el[prop] = v;
                    },
                    configurable: true,
                    enumerable: true,
                });
            } else {
                Object.defineProperty(this, attrName, {
                    get() {
                        return target[prop] ?? '';
                    },
                    set(v: any) {
                        target[prop] = v;
                    },
                    configurable: true,
                    enumerable: true,
                });
            }
        }
    },

    /**
     * 代理目标组件的公共方法到父组件
     *
     * 遍历目标组件直接原型上的方法（不含 _ 前缀、constructor、
     * 已存在于父组件的方法），在父组件上创建同名代理方法。
     */
    _proxyComponentMethods(
        target: any,
        localName: string,
        methods?: string[] | Record<string, string>
    ): void {
        if (!methods) return;

        const methodMap: Record<string, string> = Array.isArray(methods)
            ? Object.fromEntries(methods.map(m => [m, m]))
            : methods;

        for (const [localMethod, targetMethod] of Object.entries(methodMap)) {
            if (localMethod in this) continue;

            (this as any)[localMethod] = function (this: any, ...args: any[]) {
                const component = this[localName];
                if (component && typeof component[targetMethod] === 'function') {
                    return component[targetMethod](...args);
                }
            };
        }
    },
};

const ALIGN_MAP: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
};

const PACK_MAP: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
};

function applyStyle(
    el: HTMLElement,
    style?: string | Record<string, any>,
    layout?: 'hbox' | 'vbox' | 'fit' | 'grid' | 'center',
    gap?: number | string,
    align?: string,
    pack?: string,
    wrap?: boolean
): void {
    const css: Record<string, string> = {};

    if (layout) {
        switch (layout) {
            case 'hbox':
                css.display = 'flex';
                css['flex-direction'] = 'row';
                break;
            case 'vbox':
                css.display = 'flex';
                css['flex-direction'] = 'column';
                break;
            case 'fit':
                css.position = 'relative';
                break;
            case 'grid':
                css.display = 'flex';
                css['flex-direction'] = 'row';
                css['flex-wrap'] = 'wrap';
                break;
            case 'center':
                css.display = 'flex';
                css['align-items'] = 'center';
                css['justify-content'] = 'center';
                break;
        }
        if (gap !== undefined) css.gap = typeof gap === 'number' ? `${gap}px` : gap;
        if (align && ALIGN_MAP[align]) css['align-items'] = ALIGN_MAP[align];
        if (pack && PACK_MAP[pack]) css['justify-content'] = PACK_MAP[pack];
        if (wrap !== undefined && layout !== 'grid') css['flex-wrap'] = wrap ? 'wrap' : 'nowrap';
    }

    if (typeof style === 'object') Object.assign(css, style);

    const keys = Object.keys(css);
    if (keys.length === 0 && typeof style !== 'string') return;

    const objStr = keys
        .map(k => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${css[k]}`)
        .join(';');
    el.setAttribute('style', typeof style === 'string' ? `${objStr};${style}` : objStr);
}
