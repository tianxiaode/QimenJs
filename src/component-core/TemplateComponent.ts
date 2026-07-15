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
import { EventAbility, DomEventsAbility, EventBridgeAbility as SystemEventBridgeAbility } from '@/system-abilities';
import { PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility, StyleAbility } from './abilities';
import { AccessibilityAbility } from './abilities/AccessibilityAbility';
import { AnimationAbility } from './abilities/AnimationAbility';
import { EntityCoreAbility } from './abilities/EntityCoreAbility';
import { PermissionAbility } from './abilities/PermissionAbility';
import { EventBridgeConfigAbility } from './abilities/EventBridgeAbility';
import { ThemeAbility } from './abilities/ThemeAbility';
import { InitAbility } from './abilities/InitAbility';
import { NodeMapAbility } from './abilities/NodeMapAbility';
import { OverlayAbility } from './abilities/OverlayAbility';
import { OverlayHostAbility } from './abilities/OverlayHostAbility';
import { TooltipAbility } from './abilities/TooltipAbility';
import { BadgeAbility } from './abilities/BadgeAbility';
import { DragAbility } from './abilities/DragAbility';
import { DropAbility } from './abilities/DropAbility';
import { TemplateAbility } from './abilities/TemplateAbility';
import { ColorVariantAbility } from './abilities/ColorVariantAbility';
import { LayoutAbility } from './abilities/LayoutAbility';
import { ComponentRegistrar } from './ComponentRegistrar';
import type { NodeMetadata, EventMap } from './types';
import type { NodeIndexPath, NodeTemplateMeta } from './types';
import type { ContentInfo, DomEventBinding } from './template-compiler';
import type { ComponentTemplate } from './template-types';
import { precompileTemplate, compileTemplate } from './template-compiler';
import type { CompiledTemplateResult } from './template-json';
import { buildContentProperties } from './content-properties';

/**
 * 标准能力声明
 * 子类可在此基础上追加能力
 */
export const TEMPLATE_COMPONENT_ABILITIES: readonly AbilityDefinition[] = [
    EventAbility, DomEventsAbility, SystemEventBridgeAbility,
    PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility, StyleAbility,
    AccessibilityAbility, AnimationAbility, EntityCoreAbility, PermissionAbility,
    EventBridgeConfigAbility, ThemeAbility,
    InitAbility, NodeMapAbility, OverlayAbility, OverlayHostAbility, TooltipAbility, BadgeAbility,
    DragAbility, DropAbility,
    TemplateAbility, LayoutAbility, ColorVariantAbility
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

        this.flushStyle();
        this.flushColorVariant();
        this.flushPositionPx();
        this.flushPositionRaw();
        this.flushPositionBool();
        this.flushAccessibility();
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
    static withTemplate(this: any, template: string | ComponentTemplate): any {
        let jsonComponentMap: Record<string, new (props?: Record<string, any>) => any> = {};
        let body: Record<string, any> | undefined;
        let templateHtml: string;
        let compiled: {
            indexPath: NodeIndexPath;
            templateMetas: Record<string, NodeTemplateMeta>;
            contentPropNames: string[];
            contentInfos: ContentInfo[];
            domEventBindings: DomEventBinding[];
            rootClassName?: string;
            rootStyle?: string;
            templateCache: HTMLTemplateElement;
        };

        if (typeof template === 'string') {
            // ── HTML 字符串 ──
            templateHtml = template;
            compiled = {
                ...precompileTemplate(templateHtml, this.isMultiArea ?? false),
                domEventBindings: [],
            };

        } else {
            // ── ComponentTemplate ──
            const result = compileTemplate(template, this.isMultiArea ?? false);
            templateHtml = result.html;
            jsonComponentMap = result.componentMap;
            body = template.body;

            // 构建 templateCache
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
            };
        }

        // 创建模板组件强类
        const TemplateClass = class extends this {
            constructor(props?: Record<string, any>) {
                super(props);

                const ctor = this.constructor as any;
                const mergedProps = ctor.defaults
                    ? { ...ctor.defaults, ...props }
                    : props;

                this._initWithTemplate(mergedProps);

                if (ctor.type) this.type = ctor.type;

                // 将 defaults 中的属性赋值到实例（通过 setter 触发 _applyState）
                if (ctor.defaults) {
                    for (const [key, value] of Object.entries(ctor.defaults)) {
                        (this as any)[key] = value;
                    }
                }

                // 如果 props 中有覆盖 defaults 的值，也赋值到实例
                if (props) {
                    for (const [key, value] of Object.entries(props)) {
                        if (key in (ctor.defaults || {})) {
                            (this as any)[key] = value;
                        }
                    }
                }
            }

            /** 预编译的模板 HTML */
            static readonly _templateHtml: string = templateHtml;

            /** 预编译的节点索引路径 */
            static readonly _indexPath: NodeIndexPath = compiled.indexPath;

            /** 预编译的模板元数据 */
            static readonly _templateMetas: Record<string, NodeTemplateMeta> = compiled.templateMetas;

            /** 预编译的合并 DOM 事件绑定（同一 DOM 事件只绑定一次） */
            static readonly _domEventBindings: DomEventBinding[] = compiled.domEventBindings ?? [];

            /** 预编译的内容属性名列表 */
            static readonly _contentPropNames: string[] = compiled.contentPropNames;

            /** 预编译的内容节点信息数组 — 运行时直接遍历，无需遍历整个 nodeMap */
            static readonly _contentInfos: ContentInfo[] = compiled.contentInfos;

            /** 预编译的组件类映射 */
            static readonly _jsonComponentMap: Record<string, new (props?: Record<string, any>) => any> = jsonComponentMap;

            /** 模板 body 定义（属性和方法，复制到组件实例） */
            static readonly _templateBody: Record<string, any> | undefined = body;

            /** 对外暴露节点名列表 — 编译时从 autoExpose!==false 的 content 节点自动收集 */
            static readonly _expose: string[] = compiled.exposeNames;

            /** 根节点 className — 应用到组件 el 上 */
            static readonly _rootClassName: string | undefined = compiled.rootClassName;

            /** 根节点 style — 应用到组件 el 上 */
            static readonly _rootStyle: string | undefined = compiled.rootStyle;

            /** 模板元素缓存 */
            static _templateCache: HTMLTemplateElement | null = compiled.templateCache;

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

        // 在强类原型上生成内容 getter/setter
        buildContentProperties(TemplateClass, compiled.contentInfos);

        // 将 body 中的方法/属性复制到原型
        if (body) {
            const proto = TemplateClass.prototype;
            for (const [key, value] of Object.entries(body)) {
                if (key === 'type') {
                    // type 特殊处理：设为静态属性，构造函数通过 ctor.type 读取
                    (TemplateClass as any).type = value;
                } else if (typeof value === 'function') {
                    proto[key] = value;
                } else {
                    // 非函数属性作为默认值，存到 static defaults
                    if (!TemplateClass.defaults) TemplateClass.defaults = {};
                    TemplateClass.defaults[key] = value;
                }
            }
        }

        // 为 defaults 中的属性生成 getter/setter（setter 在值变化时调用 _applyState）
        if (TemplateClass.defaults) {
            const proto = TemplateClass.prototype;
            for (const key of Object.keys(TemplateClass.defaults)) {
                if (key === 'type') continue;
                // 跳过已有 getter/setter 的属性（如 content 属性）
                const existing = Object.getOwnPropertyDescriptor(proto, key);
                if (existing && (existing.get || existing.set)) continue;

                const privateKey = `__${key}`;
                Object.defineProperty(proto, key, {
                    get(this: any) { return this[privateKey]; },
                    set(this: any, value: any) {
                        this[privateKey] = value;
                        if (typeof this._applyState === 'function') this._applyState();
                    },
                    configurable: true,
                    enumerable: true,
                });
            }
        }

        // 挂载 .with() 静态方法
        (TemplateClass as any).with = function<Additional extends readonly AbilityDefinition[]>(
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

        return TemplateClass;
    }
}
