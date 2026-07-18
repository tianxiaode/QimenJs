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
import type { NodeMetadata, EventMap } from './types/index';
import type { ComponentTemplate } from './types/template';
import { BODY_SPECIAL_KEYS, validateBodyKey } from './body-keys';
import { compileTemplate } from './template-json';
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
        if (typeof this.onBeforeDispose === 'function') {
            this.onBeforeDispose();
        }

        ComponentRegistrar.getInstance().unregisterInstance(this);

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

        if (typeof this.onDisposed === 'function') {
            this.onDisposed();
        }
    }

    // ─── withTemplate 模板预编译工厂 ──

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
     * @param template - ComponentTemplate
     * @returns 延迟编译的模板组件类
     */
    static withTemplate(this: any, template: ComponentTemplate): any {
        const LazyClass = class extends this {
            static _pendingTemplate: ComponentTemplate = template;
            static _templateCompiled: boolean = false;

            constructor(props?: Record<string, any>) {
                super(props);

                if (!this._templateInitialized) {
                    const ctor = this.constructor as any;

                    if (typeof this.onBeforeInit === 'function') {
                        this.onBeforeInit(props);
                    }

                    if (!ctor._templateCompiled) {
                        ctor._compilePendingTemplate();
                    }

                    if (ctor._compiledTemplate?.propsDef) {
                        const userProps = (props as any)?.props;
                        const userChildProps = (props as any)?.childProps;
                        const userBody = (props as any)?.body;
                        const isStructured =
                            userProps !== undefined ||
                            userChildProps !== undefined ||
                            userBody !== undefined;
                        const flatProps = isStructured ? userProps : props;
                        const mergedProps = ctor._compiledTemplate.propsDef
                            ? { ...ctor._compiledTemplate.propsDef, ...flatProps }
                            : flatProps;
                        if (userChildProps) mergedProps.childProps = userChildProps;
                        if (userBody) Object.assign(mergedProps, userBody);
                        this._initWithTemplate(mergedProps);
                    } else {
                        const mergedProps = ctor.defaults ? { ...ctor.defaults, ...props } : props;
                        this._initWithTemplate(mergedProps);
                    }

                    if (ctor.type) this.type = ctor.type;

                    if (!ctor._compiledTemplate?.propsDef && ctor.defaults) {
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

                    if (typeof this.onAfterInit === 'function') {
                        this.onAfterInit(props);
                    }
                }
            }

            _templateInitialized: boolean = false;

            static _compilePendingTemplate(): void {
                const template = this._pendingTemplate;
                if (!template) return;

                const result = compileTemplate(template);

                const tpl = document.createElement('template');
                tpl.innerHTML = result.html;

                this._compiledTemplate = {
                    ...result,
                    templateCache: tpl,
                    body: template.body,
                };

                buildContentProperties(this, result.contentInfos);

                const body = template.body;
                if (body) {
                    const proto = this.prototype;
                    const descs = Object.getOwnPropertyDescriptors(body);
                    for (const [key, desc] of Object.entries(descs)) {
                        validateBodyKey(key);
                        const def = BODY_SPECIAL_KEYS[key];

                        if (def?.category === 'static') {
                            const targetKey = def.alias ?? key;
                            const staticKey = key === 'forwards' ? '_forwards' : targetKey;
                            (this as any)[staticKey] = desc.value;
                        } else if (desc.get || desc.set) {
                            Object.defineProperty(proto, key, desc);
                        } else if (typeof desc.value === 'function') {
                            proto[key] = desc.value;
                        } else {
                            if (!this.defaults) this.defaults = {};
                            this.defaults[key] = desc.value;
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
                return this._compiledTemplate.templateCache;
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

    /**
     * 替换工厂方法 — 基于当前组件创建预配置子类
     *
     * 直接继承父类 + 原型复制，不走 withTemplate。
     * 子类通过继承获得父组件所有方法，无需 forwards。
     *
     * @param options.type - 组件类型标识
     * @param options.cls - 根元素追加的 CSS 类名
     * @param options.itemsCls - items 容器的 CSS 类名（ItemGroup 专用）
     * @param options.config - 传递给父类 onAfterInit 的默认配置
     * @param options.body - 追加到原型的属性和方法
     */
    static replace(
        this: any,
        options: {
            type?: string;
            cls?: string;
            itemsCls?: string;
            config?: Record<string, any>;
            body?: Record<string, any>;
        }
    ): any {
        const ParentClass = this;
        const { type, cls, itemsCls, config, body } = options;

        const ReplaceClass = class extends ParentClass {
            constructor(props?: Record<string, any>) {
                super(config ? { ...config, ...props } : props);

                if (type) this.type = type;
                if (cls) this.el?.classList.add(...cls.split(/\s+/).filter(Boolean));
                if (itemsCls) {
                    const containerEl = this.nodeMap?.itemContainer?.el;
                    if (containerEl)
                        containerEl.classList.add(...itemsCls.split(/\s+/).filter(Boolean));
                }
            }
        };

        if (body) {
            const proto = ReplaceClass.prototype;
            const descs = Object.getOwnPropertyDescriptors(body);
            for (const [key, desc] of Object.entries(descs)) {
                if (key === 'type') continue;
                Object.defineProperty(proto, key, desc);
            }
        }

        return ReplaceClass;
    }
}
