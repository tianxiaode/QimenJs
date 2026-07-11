/**
 * TemplateComponent — 模板组件基类
 *
 * 通过 ComposableBase.with() 合并标准能力到原型上，
 * 再添加组件特有职责：
 * - el：根 DOM 元素
 * - meta：组件元数据
 * - setProp：通用属性设置
 * - initialize(layout)：统一初始化流程（由 InitAbility 提供）
 * - buildNodeMap()：模板节点扫描（由 NodeMapAbility 提供）
 *
 * 两条模板路径：
 *
 * 1. withTemplate(template) — 基础组件路径（代码定义）
 *    - 类定义时预编译：提取节点数据、生成内容属性、预编译事件模板
 *    - 实例化时纯克隆：cloneNode + 填 node 引用，零字符串处理开销
 *    - 不依赖 TemplateRegistrar
 *    - 适用：Button、Input 等基础组件
 *
 * 2. TemplateRegistrar 路径（JSON 定义 / 嵌套模板）
 *    - 运行时从注册表按 type/template ID 查找模板
 *    - 首次实例化时编译优化：querySelectorAll + 预编译事件模板 + 生成内容属性
 *    - 后续实例化复用：indexPath + 填 node 引用
 *    - 适用：JSON 配置驱动的动态组件、data-template 嵌套模板
 *
 * @example
 * ```typescript
 * // 路径 1：基础组件
 * export let Button = class extends TemplateComponent.withTemplate(BUTTON_TEMPLATE) {
 *     onClick() { ... }
 * };
 *
 * // 路径 2：JSON 定义（自动走 TemplateRegistrar）
 * const button = new TemplateComponent();
 * button.initialize({ type: 'button', ... });
 * ```
 */

import { ComposableBase, type AbilityDefinition } from '@/composable';
import { EventAbility, DomEventsAbility } from '@/system-abilities';
import { PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility, StyleAbility } from './abilities';
import { AccessibilityAbility } from './abilities/AccessibilityAbility';
import { AnimationAbility } from './abilities/AnimationAbility';
import { EntityCoreAbility } from './abilities/EntityCoreAbility';
import { PermissionAbility } from './abilities/PermissionAbility';
import { EventBridgeAbility } from './abilities/EventBridgeAbility';
import { ThemeAbility } from './abilities/ThemeAbility';
import { InitAbility } from './abilities/InitAbility';
import { NodeMapAbility } from './abilities/NodeMapAbility';
import { OverlayAbility } from './abilities/OverlayAbility';
import { TemplateRegistrar } from '@qimenjs/template';
import { RegistryHub } from '@/registry/RegistryHub';
import type { LayoutNode } from '@/layout/LayoutNode';
import { ComponentManager } from './ComponentManager';
import { mergePropAliases, applyPropAliases } from './abilities/PropAlias';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';
import type { NodeMetadata, NodeIndexPath, NodeTemplateMeta, EventMap, InternalEventBinding } from './types';

/**
 * 预编译的内部事件模板 — 不含 node 引用，实例化时填入
 */
export interface InternalEventTemplate {
    event: string;
    handler: string;
    once?: boolean;
    delegate?: boolean;
    delegateTarget?: string;
    /** 对应 nodeMap 中的 group:name key，用于查找 node */
    nodeKey: string;
}

/**
 * 预编译的外部事件模板 — 不含 node 引用，实例化时填入
 */
export interface ExternalEventTemplate {
    /** eventMap external 的 key（如 "button:click"） */
    emitKey: string;
    /** 对应 nodeMap 中的 group:name key，用于查找 node */
    nodeKey: string;
}

/**
 * 标准能力声明
 * 子类可在此基础上追加能力
 */
export const TEMPLATE_COMPONENT_ABILITIES: readonly AbilityDefinition[] = [
    EventAbility, DomEventsAbility,
    PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility, StyleAbility,
    AccessibilityAbility, AnimationAbility, EntityCoreAbility, PermissionAbility,
    EventBridgeAbility, ThemeAbility,
    InitAbility, NodeMapAbility, OverlayAbility,
];

/**
 * TemplateComponent — 继承自带标准能力的 ComposableBase
 */
export class TemplateComponent extends ComposableBase.with(TEMPLATE_COMPONENT_ABILITIES) {
    /**
     * 是否为多区域组件
     *
     * - false（默认）：单区域，属性名/方法名用 name（如 icon, onField）
     * - true：多区域，属性名/方法名用 group + Name（如 dialogHeader, onDialogClose）
     */
    static isMultiArea: boolean = false;

    /** 根元素标签名，子类可 override */
    tag: string = 'div';

    /** 组件类型 */
    type!: string;

    /**
     * 模板ID — 指定组件使用的 HTML 模板
     *
     * 默认用 type 从 TemplateRegistrar 查找模板。
     * 当同一组件类型需要不同模板时，通过 template 覆盖。
     */
    template?: string;

    /** 根 DOM 元素 */
    el!: HTMLElement;

    /** 组件元数据 */
    meta: Record<string, any> = {};

    /** 组件属性存储 */
    props: Record<string, any> = {};

    /** 脏属性集合 */
    dirtySet: Set<string> = new Set();

    /**
     * 初始化阶段标记
     *
     * initialize() 执行期间为 true，此时 setProp 只存值不触发 markDirty/flush。
     */
    _initializing: boolean = false;

    /**
     * 模板节点元信息缓存，按冒号前缀分层
     *
     * 结构：nodeMap[group][name] = NodeMetadata
     */
    nodeMap: Record<string, Record<string, NodeMetadata>> = {};

    /**
     * 事件映射 — 内部事件 + 外部事件
     */
    eventMap: EventMap = { internal: [], external: {} };

    // ─── 元素初始化 ──

    /**
     * 创建根 DOM 元素 + 注入模板 + buildNodeMap
     *
     * 模板查找优先级：this.template > this.type
     *
     * @deprecated 建议使用 withTemplate 预编译强类，不再依赖 TemplateRegistrar 查找模板。
     * withTemplate 强类的 initElement 已覆写为纯克隆流程，不经过此方法。
     * 此路径仅保留向后兼容，供未迁移的组件使用。
     */
    initElement(): void {
        this.el = document.createElement(this.tag);

        const templateRegistrar = RegistryHub.get<TemplateRegistrar>('template');
        if (templateRegistrar) {
            const templateId = this.template || this.type;
            try {
                const fragment = templateRegistrar.getFragment(templateId);
                this.el.appendChild(fragment);
                this.buildNodeMap();
            } catch {
                // 没有注册模板，跳过
            }
        }
    }

    // ─── dirty 追踪 + 延时刷新 ──

    markDirty(key: string): void {
        this.dirtySet.add(key);
        this.debounce('TemplateComponent:flush', () => this.flush(), 0);
    }

    flush(): void {
        if (this.dirtySet.size === 0) return;

        this.flushStyle();
        this.flushPositionPx();
        this.flushPositionRaw();
        this.flushPositionBool();
        this.flushAccessibility();

        this.dirtySet.clear();
    }

    // ─── 通用属性 ──

    /**
     * 统一属性设置入口
     *
     * 初始化阶段只存值不触发 markDirty/flush。
     */
    setProp(key: string, value: any): void {
        this.props[key] = value;
        if (!this._initializing) {
            this.markDirty(key);
        }
    }

    // ─── 销毁 ──

    override dispose(): void {
        ComponentManager.getInstance().unregister(this);

        this.el?.remove();

        this.meta = {};
        this.props = {};
        this.dirtySet.clear();
        this.nodeMap = {};
        this.eventMap = { internal: [], external: {} };
        this._initializing = false;

        super.dispose();
    }

    // ─── withTemplate 模板预编译工厂 ──

    /**
     * 模板预编译工厂方法 — 基础组件路径
     *
     * 接收 HTML 模板字符串，在类定义时预编译提取节点数据，
     * 生成带内容属性和事件模板的强类返回。
     *
     * 与 TemplateRegistrar 路径的区分：
     * - 本路径：类定义时预编译，实例化时纯克隆，不依赖注册表
     * - TemplateRegistrar：运行时查找模板，首次实例化时编译优化
     *
     * 模板替换：在已有强类上再次调用 withTemplate，
     * 新类继承旧类的自定义方法（如 onClick），但使用新模板。
     *
     * @param templateHtml - HTML 模板字符串
     * @returns 模板组件强类
     *
     * @example
     * ```typescript
     * // 定义基础组件
     * export let Button = class extends ComponentBase.withTemplate(BUTTON_TEMPLATE) {
     *     onClick() { ... }
     * };
     *
     * // 替换模板 — 新类继承 onClick，使用新模板
     * Button = Button.withTemplate(CUSTOM_BUTTON_TEMPLATE);
     * ```
     */
    static withTemplate(templateHtml: string): any {
        // 预编译：创建临时 DOM 解析模板，提取节点数据
        const compiled = precompileTemplate(templateHtml, (this as any).isMultiArea ?? false);

        // 创建模板组件强类
        const TemplateComponent = class extends (this as any) {
            constructor(props?: Record<string, any>) {
                super(props);

                // withTemplate 强类：构造时自动完成全部初始化
                // 不需要再调 initialize()
                this._initWithTemplate(props);
            }

            /** 预编译的模板 HTML */
            static readonly _templateHtml: string = templateHtml;

            /** 预编译的节点索引路径 */
            static readonly _indexPath: NodeIndexPath = compiled.indexPath;

            /** 预编译的模板元数据 */
            static readonly _templateMetas: Record<string, NodeTemplateMeta> = compiled.templateMetas;

            /** 预编译的内部事件模板（不含 node 引用） */
            static readonly _internalEventTemplates: InternalEventTemplate[] = compiled.internalEventTemplates;

            /** 预编译的外部事件模板（不含 node 引用） */
            static readonly _externalEventTemplates: ExternalEventTemplate[] = compiled.externalEventTemplates;

            /** 预编译的内容属性名列表 */
            static readonly _contentPropNames: string[] = compiled.contentPropNames;

            /** 模板元素缓存（类级别共享） */
            static _templateCache: HTMLTemplateElement | null = null;

            /**
             * 获取模板缓存，首次调用时创建
             */
            static _getTemplateCache(): HTMLTemplateElement {
                if (!this._templateCache) {
                    const tpl = document.createElement('template');
                    tpl.innerHTML = this._templateHtml;
                    this._templateCache = tpl;
                }
                return this._templateCache;
            }

            /**
             * 克隆模板 DocumentFragment
             */
            static _cloneFragment(): DocumentFragment {
                return this._getTemplateCache().content.cloneNode(true) as DocumentFragment;
            }

            /**
             * 创建新实例（克隆方式）
             *
             * 跳过注册表查找和 querySelectorAll，
             * 直接用预编译数据 + cloneNode 创建实例。
             */
            static create(props?: Record<string, any>): any {
                const instance = new (this as any)(props);
                return instance;
            }

            // ── withTemplate 自动初始化 ──

            /**
             * withTemplate 强类自动初始化
             *
             * 构造时自动完成：内容填充、事件绑定、能力初始化、注册。
             * 不需要再调 initialize()。
             *
             * 对于一次性配置组件（HomePage、Row），props 就是全部配置。
             * 对于可配置组件（Button），子类构造函数可继续设置额外属性。
             */
            _initWithTemplate(props?: Record<string, any>): void {
                this._initializing = true;

                try {
                    // ── 1. 创建 el + 克隆模板 + buildNodeMap ──
                    this.initElement();

                    // ── 2. 配置初始化（abilities、extraFns、entity、eventBridge、meta） ──
                    if (props?.abilities) this.setupAbilities(props.abilities);
                    if (props?.extraFns) {
                        for (const [key, fn] of Object.entries(props.extraFns)) {
                            Object.defineProperty(this, key, {
                                value: (fn as Function).bind(this),
                                writable: true, configurable: true, enumerable: true,
                            });
                        }
                    }
                    if (props?.entity) {
                        const manager = new props.entity();
                        this.mgr = manager;
                        this.onCleanup(() => manager.dispose());
                    }
                    if (props?.eventBridge) {
                        this.setEventBridge(props.eventBridge);
                        queueMicrotask(() => {
                            if (typeof this.initEventBridge === 'function') this.initEventBridge();
                        });
                    }
                    if (props?.meta) this.meta = { ...props.meta };

                    // ── 3. 内容填充 + i18n ──
                    this.initContentFromProps(props || {});
                    const ctor = this.constructor as any;
                    if (ctor.abilities) {
                        const aliasMap = mergePropAliases(ctor.abilities);
                        if (Object.keys(aliasMap).length > 0) {
                            applyPropAliases(this, props || {}, aliasMap);
                        }
                    }
                    this.initI18nFromTemplate();
                    this.setupI18nListener();

                    // ── 4. 事件绑定 ──
                    this.bindInternalEvents();
                    this.bindExternalEvents({ handlers: props?.handlers, bridges: props?.bridges } as any);
                    if (props?.handlers) this.bindHandlers(props.handlers);
                    if (props?.stateTriggers) this.bindStateTriggers(props.stateTriggers);

                    // ── 5. 调用能力的 __init__ 方法 ──
                    this.callInitMethods();

                    // ── 6. 注册到 ComponentManager ──
                    if (props?.id) this.id = props.id;
                    ComponentManager.getInstance().register(this as any);
                } finally {
                    this._initializing = false;
                    this.flush();
                }
            }

            // ── 覆写 initElement：纯克隆流程，不依赖 TemplateRegistrar ──

            /**
             * 创建根 DOM 元素 + 克隆预编译模板 + 构建 nodeMap
             *
             * withTemplate 强类自带模板，不需要 template/type 属性查找注册表。
             * 流程：createElement → cloneFragment → buildNodeMapFromCompiled
             */
            initElement(): void {
                this.el = document.createElement(this.tag);

                const ctor = this.constructor as any;
                const fragment = ctor._cloneFragment();
                this.el.appendChild(fragment);
                this._buildNodeMapFromCompiled();
            }

            /**
             * 从预编译数据构建 nodeMap + eventMap
             *
             * 用索引表 + children 直接定位节点，跳过 querySelectorAll。
             * eventMap 用预编译模板填入 node 引用，跳过 handler 名推导和 eventAttr 解析。
             */
            _buildNodeMapFromCompiled(): void {
                const ctor = this.constructor as any;
                const indexPath: NodeIndexPath = ctor._indexPath;
                const templateMetas: Record<string, NodeTemplateMeta> = ctor._templateMetas;

                // 构建 nodeMap
                for (const [key, path] of Object.entries(indexPath)) {
                    const meta = templateMetas[key];
                    if (!meta) continue;

                    const el = this._findByPath(path);
                    if (!el) continue;

                    const node: NodeMetadata = {
                        el, raw: meta.raw, group: meta.group, name: meta.name,
                        delegateTarget: meta.delegateTarget, jsonRef: meta.jsonRef,
                        jsonMode: meta.jsonMode, templateRef: meta.templateRef,
                        i18nKey: meta.i18nKey,
                    };

                    if (!this.nodeMap[meta.group]) this.nodeMap[meta.group] = {};
                    this.nodeMap[meta.group][meta.name] = node;
                }

                // 用预编译模板构建 eventMap（只填 node 引用，不重复推导）
                this.eventMap = this._buildEventMapFromTemplates();
            }

            /**
             * 用索引路径从 el 开始定位元素
             */
            _findByPath(path: number[]): HTMLElement | null {
                let current: Element = this.el;
                for (const idx of path) {
                    if (!current.children[idx]) return null;
                    current = current.children[idx];
                }
                return current as HTMLElement;
            }

            /**
             * 从预编译事件模板构建 eventMap
             *
             * 只需遍历模板填入 node 引用，不再重复推导 handler 名和解析 eventAttr。
             */
            _buildEventMapFromTemplates(): EventMap {
                const ctor = this.constructor as any;
                const internalTemplates: InternalEventTemplate[] = ctor._internalEventTemplates;
                const externalTemplates: ExternalEventTemplate[] = ctor._externalEventTemplates;

                const internalEvents: InternalEventBinding[] = [];
                const externalEvents: Record<string, NodeMetadata> = {};

                // 填充内部事件
                for (const tpl of internalTemplates) {
                    const [group, name] = tpl.nodeKey.split(':');
                    const node = this.nodeMap[group]?.[name];
                    if (!node) continue;

                    internalEvents.push({
                        event: tpl.event,
                        handler: tpl.handler,
                        once: tpl.once,
                        delegate: tpl.delegate,
                        delegateTarget: tpl.delegateTarget,
                        node,
                    });
                }

                // 填充外部事件
                for (const tpl of externalTemplates) {
                    const [group, name] = tpl.nodeKey.split(':');
                    const node = this.nodeMap[group]?.[name];
                    if (!node) continue;

                    externalEvents[tpl.emitKey] = node;
                }

                return { internal: internalEvents, external: externalEvents };
            }
        };

        // 在强类原型上生成内容 getter/setter（只做一次）
        buildContentPropertiesOnClass(TemplateComponent, compiled.templateMetas, (this as any).isMultiArea ?? false);

        return TemplateComponent;
    }
}

// ─── 预编译辅助函数 ───

/**
 * 预编译模板：解析 HTML 提取节点数据 + 预编译事件模板
 */
function precompileTemplate(
    templateHtml: string,
    isMultiArea: boolean,
): {
    indexPath: NodeIndexPath;
    templateMetas: Record<string, NodeTemplateMeta>;
    internalEventTemplates: InternalEventTemplate[];
    externalEventTemplates: ExternalEventTemplate[];
    contentPropNames: string[];
} {
    const tpl = document.createElement('template');
    tpl.innerHTML = templateHtml;

    const root = tpl.content.firstElementChild as HTMLElement || tpl.content as any;
    const els = Array.from((root as HTMLElement).querySelectorAll('[data-content]'));

    const indexPath: NodeIndexPath = {};
    const templateMetas: Record<string, NodeTemplateMeta> = {};
    const contentPropNames: string[] = [];
    const internalEventTemplates: InternalEventTemplate[] = [];
    const externalEventTemplates: ExternalEventTemplate[] = [];

    for (const el of els) {
        const htmlEl = el as HTMLElement;
        const value = htmlEl.getAttribute('data-content')!;

        const colonIndex = value.indexOf(':');
        const group = colonIndex === -1 ? value : value.slice(0, colonIndex);
        const name = colonIndex === -1 ? '_' : value.slice(colonIndex + 1);
        const key = `${group}:${name}`;

        const delegateTarget = htmlEl.getAttribute('data-target') || undefined;
        const jsonRef = htmlEl.getAttribute('data-json') || undefined;
        const jsonModeAttr = htmlEl.getAttribute('data-json-mode');
        const jsonMode = jsonModeAttr === 'child' ? 'child' as const : jsonRef ? 'replace' as const : undefined;
        const templateRef = htmlEl.getAttribute('data-template') || undefined;
        const mode = inferContentMode(htmlEl);
        const i18nKey = htmlEl.getAttribute('data-i18n') || undefined;
        const eventAttr = htmlEl.getAttribute('data-event') || undefined;
        const emitAttr = htmlEl.getAttribute('data-emit') || undefined;

        templateMetas[key] = {
            raw: value, group, name, delegateTarget, jsonRef, jsonMode,
            templateRef, mode, eventAttr, emitAttr, i18nKey,
        };

        // 计算节点路径（相对于模板根元素）
        indexPath[key] = computeNodePathForTemplate(tpl.content as any, htmlEl);

        // 推导内容属性名
        const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
        const propName = isMultiArea
            ? `${group}${capitalName}`
            : name === '_' ? group : name;
        contentPropNames.push(propName);

        // 预编译内部事件模板（推导 handler 名 + 解析 eventAttr，只做一次）
        if (eventAttr) {
            const handlerName = isMultiArea
                ? `on${group.charAt(0).toUpperCase() + group.slice(1)}${capitalName}`
                : `on${name === '_' ? group.charAt(0).toUpperCase() + group.slice(1) : capitalName}`;

            const parsed = parseEventAttrCompiled(eventAttr);
            for (const { event, once, delegate } of parsed) {
                internalEventTemplates.push({
                    event,
                    handler: handlerName,
                    once,
                    delegate,
                    delegateTarget,
                    nodeKey: key,
                });
            }
        }

        // 预编译外部事件模板
        if (emitAttr) {
            const parsed = parseEventAttrCompiled(emitAttr);
            for (const { event } of parsed) {
                externalEventTemplates.push({
                    emitKey: `${name}:${event}`,
                    nodeKey: key,
                });
            }
        }
    }

    return { indexPath, templateMetas, internalEventTemplates, externalEventTemplates, contentPropNames };
}

/**
 * 根据元素标签推导内容操作模式
 */
function inferContentMode(el: HTMLElement): 'value' | 'src' | 'html' {
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return 'value';
    if (tag === 'img') return 'src';
    return 'html';
}

/**
 * 计算节点在模板 DOM 树中的位置路径
 */
function computeNodePathForTemplate(root: HTMLElement, target: HTMLElement): number[] {
    const path: number[] = [];
    let current: Element | null = target;
    while (current && current !== root) {
        const parent: Element | null = current.parentElement;
        if (!parent) break;
        const idx = Array.from(parent.children).indexOf(current);
        if (idx === -1) break;
        path.unshift(idx);
        current = parent;
    }
    return path;
}

/**
 * 解析事件属性值
 */
function parseEventAttrCompiled(eventAttr: string): Array<{ event: string; once?: boolean; delegate?: boolean }> {
    const results: Array<{ event: string; once?: boolean; delegate?: boolean }> = [];
    const parts = eventAttr.split(',').map(s => s.trim()).filter(Boolean);

    for (const part of parts) {
        let event: string;
        let once = false;
        let delegate = false;

        const questionIndex = part.indexOf('?');
        if (questionIndex !== -1) {
            event = part.slice(0, questionIndex).trim();
            const modifiers = part.slice(questionIndex + 1).split('&');
            for (const mod of modifiers) {
                if (mod === 'once') once = true;
                if (mod === 'delegate') delegate = true;
            }
        } else {
            event = part.trim();
        }

        results.push({ event, once, delegate });
    }

    return results;
}

/**
 * 在强类原型上生成内容 getter/setter
 */
function buildContentPropertiesOnClass(
    TemplateComponent: any,
    templateMetas: Record<string, NodeTemplateMeta>,
    isMultiArea: boolean,
): void {
    const proto = TemplateComponent.prototype;

    for (const [, meta] of Object.entries(templateMetas)) {
        const capitalName = meta.name.charAt(0).toUpperCase() + meta.name.slice(1);

        const propName = isMultiArea
            ? `${meta.group}${capitalName}`
            : meta.name === '_' ? meta.group : meta.name;

        const hiddenPropName = `${propName}Hidden`;
        const { group, name, mode } = meta;

        Object.defineProperty(proto, propName, {
            get: function (this: any) {
                const el = this.nodeMap[group]?.[name]?.el;
                if (!el) return '';
                if (mode === 'value') return (el as HTMLInputElement).value;
                if (mode === 'src') return (el as HTMLImageElement).src;
                return el.innerHTML;
            },
            set: function (this: any, v: string) {
                const el = this.nodeMap[group]?.[name]?.el;
                if (!el) return;
                const resolved = v.startsWith(I18N_PREFIX)
                    ? translateI18nKey(v.slice(I18N_PREFIX.length))
                    : v;
                applyValueToEl(el, resolved, mode);
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(proto, hiddenPropName, {
            get: function (this: any) {
                return this.nodeMap[group]?.[name]?.el?.hidden ?? false;
            },
            set: function (this: any, v: boolean) {
                const el = this.nodeMap[group]?.[name]?.el;
                if (el) el.hidden = v;
            },
            configurable: true,
            enumerable: true,
        });
    }

    proto._contentPropNames = Object.keys(templateMetas).map(key => {
        const meta = templateMetas[key];
        const capitalName = meta.name.charAt(0).toUpperCase() + meta.name.slice(1);
        return isMultiArea
            ? `${meta.group}${capitalName}`
            : meta.name === '_' ? meta.group : meta.name;
    });
}

/**
 * 翻译 i18n key
 */
function translateI18nKey(i18nKey: string): string {
    const i18n = getI18nManager();
    if (!i18n) return i18nKey;
    return i18n.t(i18nKey) || i18nKey;
}

/**
 * 将翻译值写入 DOM 元素
 */
function applyValueToEl(el: HTMLElement, value: string, mode: 'value' | 'src' | 'html'): void {
    if (mode === 'value') { (el as HTMLInputElement).value = value; }
    else if (mode === 'src') { (el as HTMLImageElement).src = value; }
    else { el.innerHTML = value; }
}
