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
import { TemplateAbility } from './abilities/TemplateAbility';
import { ComponentRegistrar } from './ComponentRegistrar';
import type { NodeMetadata, EventMap } from './types';
import type { NodeIndexPath, NodeTemplateMeta } from './types';
import type { InternalEventTemplate, ExternalEventTemplate, JsonTemplateNode } from './template-compiler';
import { precompileTemplate, jsonTemplateToHtml } from './template-compiler';
import { buildContentProperties } from './content-properties';

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
    TemplateAbility,
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
        ComponentRegistrar.getInstance().unregisterInstance(this);

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
     * 接收 HTML 模板字符串或 JSON 模板数组，在类定义时预编译提取节点数据，
     * 生成带内容属性和事件模板的强类返回。
     *
     * JSON 模板会自动转换为 HTML 字符串，再走原有 precompileTemplate 流程。
     *
     * 实例方法（_initWithTemplate、_initElementFromTemplate、_buildNodeMapFromCompiled）
     * 由 TemplateAbility 提供，已包含在 TEMPLATE_COMPONENT_ABILITIES 中。
     *
     * 模板替换：在已有强类上再次调用 withTemplate，
     * 新类继承旧类的自定义方法（如 onClick），但使用新模板。
     *
     * @param template - HTML 模板字符串或 JSON 模板数组
     * @returns 模板组件强类
     */
    static withTemplate(this: any, template: string | JsonTemplateNode[]): any {
        // JSON 模板 → HTML 字符串，再走原流程
        const templateHtml = typeof template === 'string'
            ? template
            : jsonTemplateToHtml(template);

        // 预编译：创建临时 DOM 解析模板，提取节点数据
        const compiled = precompileTemplate(templateHtml, this.isMultiArea ?? false);

        // 创建模板组件强类
        // TemplateAbility 已在 TEMPLATE_COMPONENT_ABILITIES 中，基类原型已有 _initWithTemplate 等方法
        const TemplateClass = class extends this {
            constructor(props?: Record<string, any>) {
                super(props);

                // withTemplate 强类：构造时自动完成全部初始化
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
             */
            static create(props?: Record<string, any>): any {
                const instance = new (this as any)(props);
                return instance;
            }
        };

        // 在强类原型上生成内容 getter/setter（只做一次）
        buildContentProperties(TemplateClass, compiled.templateMetas, this.isMultiArea ?? false);

        return TemplateClass;
    }
}
