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
 * 详见 withTemplate.ts。
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
import { ComponentManager } from './ComponentManager';
import type { NodeMetadata, EventMap } from './types';
import { withTemplate } from './withTemplate';

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
     * 详见 withTemplate.ts
     */
    static withTemplate = withTemplate;
}
