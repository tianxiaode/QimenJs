/**
 * TemplateComponent — 模板组件基类
 *
 * 通过 ComposableBase.with() 合并标准能力到原型上，
 * 再添加组件特有职责：
 * - el：根 DOM 元素
 * - meta：组件元数据
 * - setProp：通用属性设置
 * - markDirty/flush：脏属性追踪 + 延时刷新
 * - dispose：销毁清理
 *
 * withTemplate(templateHtml) — 模板预编译工厂，创建带模板的强类。
 * 模板实例方法（_initWithTemplate 等）由 TemplateAbility 提供，已包含在 TEMPLATE_COMPONENT_ABILITIES 中。
 */

import { ComposableBase, type AbilityDefinition } from '@/composable';
import { createForgedClass } from '@/composable/forge';
import {
    EventAbility,
    DomEventsAbility,
    EventBridgeAbility as SystemEventBridgeAbility,
    EntityEventBusAbility,
    OverlayEventBusAbility,
} from '@/system-abilities';
import { AnimationAbility } from './abilities/AnimationAbility';

import { EventBridgeConfigAbility } from './abilities/EventBridgeAbility';
import { InitAbility } from './abilities/InitAbility';
import { NodeMapAbility } from './abilities/NodeMapAbility';

import { TemplateAbility } from './abilities/TemplateAbility';
import { LayoutAbility } from './abilities/LayoutAbility';
import { ComponentRegistrar } from './ComponentRegistrar';
import type { NodeMetadata, EventMap } from './types';
import type { NodeIndexPath, NodeTemplateMeta } from './types';
import type { ContentInfo, DomEventBinding } from './template-compiler';
import type { ComponentTemplate } from './template-types';
import { BODY_SPECIAL_KEYS, validateBodyKey } from './body-keys';
import { precompileTemplate, compileTemplate } from './template-compiler';
import type { CompiledTemplateResult } from './template-json';
import { buildContentProperties } from './content-properties';

/**
 * 标准能力声明
 *
 * 只保留有行为逻辑的能力，纯赋值能力已移除（v2 由 props/content 直接驱动）。
 *
 * 保留（有行为）：
 * - EventAbility / DomEventsAbility / SystemEventBridgeAbility / EntityEventBusAbility — 事件系统
 * - AnimationAbility — 动画控制

 * - EventBridgeConfigAbility — 桥接配置
 * - InitAbility — 初始化流程
 * - NodeMapAbility — i18n 刷新

 * - TemplateAbility — 模板渲染
 *
 * 已移除（纯赋值，v2 由 props/content 直接驱动）：
 * - PositionPxAbility / PositionRawAbility / PositionBoolAbility / PositionDirectAbility
 * - StyleAbility / AccessibilityAbility / PermissionAbility / ThemeAbility
 * - ColorVariantAbility
 *
 * 保留（语义快捷方式）：
 * - LayoutAbility — layout: 'hbox' → layout-hbox className
 */
export const TEMPLATE_COMPONENT_ABILITIES: readonly AbilityDefinition[] = [
    EventAbility,
    DomEventsAbility,
    SystemEventBridgeAbility,
    EntityEventBusAbility,
    OverlayEventBusAbility,
    AnimationAbility,

    EventBridgeConfigAbility,
    InitAbility,
    NodeMapAbility,

    TemplateAbility,
    LayoutAbility,
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
     * 仅用于 withTemplate 强类，由 _initWithTemplate 读取。
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
     * 模板节点元信息缓存，一级结构
     *
     * 结构：nodeMap[name] = NodeMetadata
     * name 来自 TplNode 的 name 或 content 属性
     */
    nodeMap: Record<string, NodeMetadata> = {};

    /**
     * 事件映射 — 内部事件 + 外部事件
     */
    eventMap: EventMap = { internal: [], external: {} };

    // ─── 元素初始化 ──

    /**
     * 创建根 DOM 元素
     *
     * withTemplate 强类会覆写此方法为纯克隆流程（_initElementFromTemplate），
     * 不经过此方法。此方法仅用于非模板组件（纯容器等）。
     */
    initElement(): void {
        this.el = document.createElement(this.tag);
    }

    // ─── dirty 追踪 + 延时刷新 ──

    markDirty(key: string): void {
        this.dirtySet.add(key);
        this.debounce('TemplateComponent:flush', () => this.flush(), 0);
    }

    flush(): void {
        if (this.dirtySet.size === 0) return;

        this.flushLayout();

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
        ComponentRegistrar.getInstance().unregisterInstance(this);

        // 遍历 nodeMap 递归销毁子组件（在清空 nodeMap 之前）
        if (typeof this._disposeChildComponents === 'function') {
            this._disposeChildComponents();
        }

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
     * 模板预编译工厂方法
     *
     * 支持三种模板格式：
     * 1. HTML 字符串 — 直接使用（旧链路：precompileTemplate）
     * 2. 旧版 JsonTemplateNode[] — 向后兼容，自动转换（旧链路）
     * 3. 新版 ComponentTemplate — 包含 tpl 根节点 + body 属性/方法
     *    新链路：compileTemplate 一步到位，跳过 HTML data-* 属性
     *
     * @param template - HTML 字符串 / 旧版 JSON 模板数组 / 新版 ComponentTemplate
     * @returns 模板组件强类
     */
    /**
     * 模板预编译工厂方法（延迟编译模式）
     *
     * withTemplate 只记录模板定义，不立即编译。
     * 首次 new 时才编译模板、设置静态属性、复制 body 到原型。
     *
     * 优势：
     * - 多次 withTemplate 只记录，最后一次生效，无需清理
     * - 派生类用自己的模板，父模板从未编译，无冲突
     * - 首次 new 后缓存编译结果，后续 new 零开销
     *
     * @param template - HTML 字符串 / ComponentTemplate
     * @returns 延迟编译的模板组件类
     */
    static withTemplate(this: any, template: string | ComponentTemplate): any {
        const LazyClass = class extends this {
            static _pendingTemplate: string | ComponentTemplate = template;
            static _templateCompiled: boolean = false;

            constructor(props?: Record<string, any>) {
                super(props);

                if (!this._templateInitialized) {
                    const ctor = this.constructor as any;

                    if (!ctor._templateCompiled) {
                        ctor._compilePendingTemplate();
                    }

                    if (ctor._propsDef) {
                        const userProps = (props as any)?.props;
                        const userChildProps = (props as any)?.childProps;
                        const userBody = (props as any)?.body;
                        const isStructured =
                            userProps !== undefined ||
                            userChildProps !== undefined ||
                            userBody !== undefined;
                        const flatProps = isStructured ? userProps : props;
                        const mergedProps = ctor._propsDef
                            ? { ...ctor._propsDef, ...flatProps }
                            : flatProps;
                        if (userChildProps) mergedProps.childProps = userChildProps;
                        if (userBody) Object.assign(mergedProps, userBody);
                        this._initWithTemplate(mergedProps);
                    } else {
                        const mergedProps = ctor.defaults ? { ...ctor.defaults, ...props } : props;
                        this._initWithTemplate(mergedProps);
                    }

                    if (ctor.type) this.type = ctor.type;

                    if (!ctor._propsDef && ctor.defaults) {
                        for (const [key, value] of Object.entries(ctor.defaults)) {
                            (this as any)[key] = value;
                        }
                        if (props) {
                            for (const [key, value] of Object.entries(props)) {
                                if (key in (ctor.defaults || {})) {
                                    (this as any)[key] = value;
                                }
                            }
                        }
                    }

                    this._templateInitialized = true;
                }
            }

            _templateInitialized: boolean = false;

            static _compilePendingTemplate(): void {
                const template = this._pendingTemplate;
                if (!template) return;

                let jsonComponentMap: Record<string, new (props?: Record<string, any>) => any> = {};
                let body: Record<string, any> | undefined;
                let templateHtml: string;
                let propsDef: Record<string, any> | undefined;
                let compiled: any;

                if (typeof template === 'string') {
                    templateHtml = template;
                    compiled = {
                        ...precompileTemplate(templateHtml, this.isMultiArea ?? false),
                        domEventBindings: [],
                    };
                } else {
                    const result = compileTemplate(template, this.isMultiArea ?? false);
                    templateHtml = result.html;
                    jsonComponentMap = result.componentMap;
                    body = template.body;
                    propsDef = result.propsDef;

                    const tpl = document.createElement('template');
                    tpl.innerHTML = templateHtml;

                    compiled = {
                        indexPath: result.indexPath,
                        templateMetas: result.templateMetas,
                        contentPropNames: result.contentPropNames,
                        contentInfos: result.contentInfos,
                        domEventBindings: result.domEventBindings,
                        rootClassName: result.rootClassName,
                        rootStyle: result.rootStyle,
                        templateCache: tpl,
                        exposeNames: result.exposeNames,
                    };
                }

                this._templateHtml = templateHtml;
                this._indexPath = compiled.indexPath;
                this._templateMetas = compiled.templateMetas;
                this._domEventBindings = compiled.domEventBindings ?? [];
                this._contentPropNames = compiled.contentPropNames;
                this._contentInfos = compiled.contentInfos;
                this._jsonComponentMap = jsonComponentMap;
                this._templateBody = body;
                this._propsDef = propsDef;
                this._expose = compiled.exposeNames ?? [];
                this._rootClassName = compiled.rootClassName;
                this._rootStyle = compiled.rootStyle;
                this._templateCache = compiled.templateCache;

                buildContentProperties(this, compiled.contentInfos);

                if (body) {
                    const proto = this.prototype;
                    for (const [key, value] of Object.entries(body)) {
                        validateBodyKey(key);
                        const def = BODY_SPECIAL_KEYS[key];

                        if (def?.category === 'static') {
                            const targetKey = def.alias ?? key;
                            const staticKey = key === 'forwards' ? '_forwards' : targetKey;
                            (this as any)[staticKey] = value;
                        } else if (typeof value === 'function') {
                            proto[key] = value;
                        } else {
                            if (!this.defaults) this.defaults = {};
                            this.defaults[key] = value;
                        }
                    }
                }

                if (this.defaults) {
                    const proto = this.prototype;
                    for (const key of Object.keys(this.defaults)) {
                        if (key === 'type') continue;
                        const existing = Object.getOwnPropertyDescriptor(proto, key);
                        if (existing && (existing.get || existing.set)) continue;

                        const privateKey = `__${key}`;
                        Object.defineProperty(proto, key, {
                            get(this: any) {
                                return this[privateKey];
                            },
                            set(this: any, value: any) {
                                this[privateKey] = value;
                                if (typeof this._applyState === 'function') this._applyState();
                            },
                            configurable: true,
                            enumerable: true,
                        });
                    }
                }

                this._templateCompiled = true;
            }

            static _getTemplateCache(): HTMLTemplateElement {
                return this._templateCache!;
            }

            static _cloneFragment(): DocumentFragment {
                return this._getTemplateCache().content.cloneNode(true) as DocumentFragment;
            }

            static create(props?: Record<string, any>): any {
                const instance = new (this as any)(props);
                return instance;
            }
        };

        (LazyClass as any).with = function <Additional extends readonly AbilityDefinition[]>(
            ...additionalAbilities: Additional
        ): any {
            let flat: readonly AbilityDefinition[];
            if (additionalAbilities.length === 1 && Array.isArray(additionalAbilities[0])) {
                flat = additionalAbilities[0] as readonly AbilityDefinition[];
            } else {
                flat = additionalAbilities;
            }
            return createForgedClass(this, flat);
        };

        return LazyClass;
    }
}
