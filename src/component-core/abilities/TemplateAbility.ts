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
import type { NodeIndexPath, NodeTemplateMeta, NodeMetadata } from '../types';
import type { DomEventBinding } from '../template-compiler';
import { findByPath } from '../template-compiler';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { mergePropAliases, applyPropAliases } from './PropAlias';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';

export const TemplateAbility: AbilityDefinition = {
    /**
     * withTemplate 强类自动初始化
     *
     * 构造时自动完成：内容填充、事件绑定、能力初始化、注册。
     *
     * 配置来源（优先级从低到高）：
     * 1. static 属性（children、bridges 等）— 类定义时确定
     * 2. props 参数 — 实例化时传入，可覆盖 static
     */
    _initWithTemplate(props?: Record<string, any>): void {
        this._initializing = true;

        // 保存 props 到实例
        if (props) this.props = { ...this.props, ...props };

        // 合并配置：static 属性为基础，props 可覆盖
        const ctor = this.constructor as any;
        const cfg: Record<string, any> = {
            bridges: ctor.bridges ? [...ctor.bridges] : undefined,
            abilities: ctor.abilities,
            entity: ctor.entity,
            eventBridge: ctor.eventBridge,
            meta: ctor.meta,
            ...props,
        };

        this.logger?.debug?.('[Template] _initWithTemplate, type =', ctor.type, 'bridges =', cfg.bridges?.length ?? 0, 'eventBridge =', !!cfg.eventBridge);

        try {
            // ── 1. 创建 el + 克隆模板 + buildNodeMap ──
            this._initElementFromTemplate();

            // ── 2. 配置初始化（abilities、extraFns、entity、eventBridge、meta） ──
            if (cfg.abilities) this.setupAbilities(cfg.abilities);
            if (cfg.extraFns) {
                for (const [key, fn] of Object.entries(cfg.extraFns)) {
                    Object.defineProperty(this, key, {
                        value: (fn as Function).bind(this),
                        writable: true, configurable: true, enumerable: true,
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

            // ── 3.6 从 props 中提前设置 eventKey（bindDomEventBindings/bindBridgeEvents 依赖） ──
            if (cfg.eventKey !== undefined) {
                (this as any).eventKey = cfg.eventKey;
            }

            // ── 4. 事件绑定 ──
            // 4.1 统一 DOM 事件绑定（合并 handler/emits/bridges，一次 this.bind 搞定）
            this.bindDomEventBindings();
            // 4.2 子组件桥接事件（DOM 节点的桥接已在 bindDomEventBindings 中处理）
            this.bindBridgeEvents();
            // 4.3 外部事件绑定（旧链路兼容）
            this.bindExternalEvents({ bridges: cfg.bridges } as any);
            const listenConfig = this._extractBridgesOn(cfg.bridges);
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

        // 应用根节点的 className/style
        if (ctor._rootClassName) {
            this.el.className = ctor._rootClassName;
        }
        if (ctor._rootStyle) {
            this.el.setAttribute('style', ctor._rootStyle);
        }

        this._buildNodeMapFromCompiled();
    },

    /**
     * 从预编译数据构建 nodeMap + eventMap
     */
    _buildNodeMapFromCompiled(): void {
        const ctor = this.constructor as any;
        const indexPath: NodeIndexPath = ctor._indexPath;
        const templateMetas: Record<string, NodeTemplateMeta> = ctor._templateMetas;
        const jsonComponentMap: Record<string, new (props?: Record<string, any>) => any> = ctor._jsonComponentMap || {};

        // 构建 nodeMap
        for (const [key, path] of Object.entries(indexPath)) {
            const meta = templateMetas[key];
            if (!meta) continue;

            const el = findByPath(this.el, path);
            if (!el) continue;

            const node: NodeMetadata = {
                el, raw: meta.raw, group: meta.group, name: meta.name,
                delegateTarget: meta.delegateTarget, jsonRef: meta.jsonRef,
                jsonMode: meta.jsonMode, templateRef: meta.templateRef,
                i18nKey: meta.i18nKey, props: meta.props,
            };

            // 如果模板声明了 data-hidden，设置 el.hidden 初始状态
            if (meta.hidden) {
                el.hidden = true;
            }

            // 如果有组件类映射，填充 componentClass
            if (meta.jsonRef && jsonComponentMap[meta.name]) {
                node.componentClass = jsonComponentMap[meta.name];
            }

            if (!this.nodeMap[meta.group]) this.nodeMap[meta.group] = {};
            this.nodeMap[meta.group][meta.name] = node;
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
    _renderChildComponents(): void {
        const ctor = this.constructor as any;
        const propsDef: Record<string, any> | undefined = ctor._propsDef;

        // v2 模式：propsDef 存在时启用
        if (propsDef) {
            this._renderChildComponentsV2();
            return;
        }

        // v1 旧模式
        this._renderChildComponentsV1();
    },

    /**
     * v1 旧模式渲染子组件
     *
     * 直接用 node.props（从 tpl 子节点定义的 props 字段取值），
     * 不再查 static children。
     */
    _renderChildComponentsV1(): void {
        for (const group of Object.values(this.nodeMap) as Record<string, NodeMetadata>[]) {
            for (const node of Object.values(group) as NodeMetadata[]) {
                if (!node.componentClass) continue;

                const ComponentClass = node.componentClass;
                const childProps = node.props;

                this.logger?.debug?.('[Template] _renderChildComponentsV1, name =', node.name, 'componentClass =', ComponentClass?.name || (ComponentClass as any)?.type, 'childProps =', childProps ? Object.keys(childProps) : []);

                // 创建子组件实例（withTemplate 强类，new 即完整实例）
                const child = new ComponentClass(childProps);

                // 设置父引用
                (child as any).parent = this;

                // 根据 jsonMode 挂载，并记录 DOM 位置索引
                this._mountChildComponent(node, child);
            }
        }
    },

    /**
                (child as any).parent = this;

                // 根据 jsonMode 挂载，并记录 DOM 位置索引
                this._mountChildComponent(node, child);
            }
        }
    },

    /**
     * v2 新模式渲染子组件 — props.childProps 驱动
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
    _renderChildComponentsV2(): void {
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
            if (nodeConfig && typeof nodeConfig === 'object' && !nodeConfig.props && !nodeConfig.childProps && !nodeConfig.body) {
                Object.assign(ctorProps, nodeConfig);
            }

            this.logger?.debug?.('[Template] _renderChildComponentsV2, key =', nodeKey, 'componentClass =', ComponentClass?.name || (ComponentClass as any)?.type, 'ctorProps =', Object.keys(ctorProps));

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
        for (const group of Object.values(this.nodeMap) as Record<string, NodeMetadata>[]) {
            // 先按 name 精确匹配
            if (group[contentKey]) return group[contentKey];
        }
        return null;
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
        for (const group of Object.values(this.nodeMap) as Record<string, NodeMetadata>[]) {
            for (const node of Object.values(group) as NodeMetadata[]) {
                if (node.component && typeof node.component.dispose === 'function') {
                    node.component.dispose();
                    node.component = null;
                }
            }
        }
    },

    /**
     * 绑定桥接事件（子组件专用，旧链路兼容）
     *
     * DOM 节点的桥接事件已由 bindDomEventBindings 统一处理，
     * 子组件的桥接事件也由 bindDomEventBindings 统一处理。
     * 此方法保留为空，供旧链路兼容调用。
     */
    bindBridgeEvents(): void {
        // 已由 bindDomEventBindings 统一处理，此方法保留为空
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
        const bindings: DomEventBinding[] = ctor._domEventBindings;
        if (!bindings || bindings.length === 0) return;

        const eventKey = this.eventKey;

        this.logger?.debug?.('[Template] bindDomEventBindings, count =', bindings.length, 'type =', ctor.type, 'scopeId =', this.eventScope?.getScopeId?.());

        for (const binding of bindings) {
            const { event, nodeKey, handler, once, delegate, delegateTarget, debounce, throttle, emits, bridges } = binding;

            const [group, name] = nodeKey.split(':');
            const node = this.nodeMap[group]?.[name];
            if (!node) continue;

            if (node.component) {
                // ── 子组件路径：监听子组件事件，转发 emits/bridges ──
                // 子组件不需要 handler（子组件自己内部处理 DOM 事件并 emit）
                this._bindComponentEvent(node.component, event, { once, emits, bridges, eventKey });
            } else {
                // ── DOM 节点路径：this.bind() → 手势适配器 → this.on('dom:xxx') ──
                this._bindDomEvent(node, event, { handler, once, delegate, delegateTarget, debounce, throttle, emits, bridges, eventKey });
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
            eventKey?: string;
        },
    ): void {
        const el = node.el;
        if (!el) return;

        const { handler, once, delegate, delegateTarget, debounce, throttle, emits, bridges, eventKey } = options;
        const domEvent = `${DOM_EVENT_PREFIX}${event}`;

        this.logger?.debug?.('[Template] _bindDomEvent, event =', event, 'domEvent =', domEvent, 'handler =', handler, 'emits =', emits, 'bridges =', bridges);

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
            eventKey?: string;
        },
    ): void {
        const { once, emits, bridges, eventKey } = options;

        this.logger?.debug?.('[Template] _bindComponentEvent, event =', event, 'emits =', emits, 'bridges =', bridges);

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
};
