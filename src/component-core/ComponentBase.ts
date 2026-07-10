/**
 * ComponentBase — 组件基类
 *
 * 通过 ComposableBase.with() 合并标准能力到原型上，
 * 再添加组件特有职责：
 * - el：根 DOM 元素
 * - meta：组件元数据
 * - setProp：通用属性设置
 * - initialize(layout)：统一初始化流程（由 InitAbility 提供）
 * - buildNodeMap()：模板节点扫描（由 NodeMapAbility 提供）
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

/**
 * 标准能力声明
 * 子类可在此基础上追加能力
 */
export const COMPONENT_BASE_ABILITIES: readonly AbilityDefinition[] = [
    EventAbility, DomEventsAbility,
    PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility, StyleAbility,
    AccessibilityAbility, AnimationAbility, EntityCoreAbility, PermissionAbility,
    EventBridgeAbility, ThemeAbility,
    InitAbility, NodeMapAbility, OverlayAbility,
];

/**
 * ComponentBase — 继承自带标准能力的 ComposableBase
 */
export class ComponentBase extends ComposableBase.with(COMPONENT_BASE_ABILITIES) {
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
    nodeMap: Record<string, Record<string, import('./types').NodeMetadata>> = {};

    /**
     * 事件映射 — 内部事件 + 外部事件
     */
    eventMap: import('./types').EventMap = { internal: [], external: {} };

    // ─── 元素初始化 ──

    /**
     * 创建根 DOM 元素 + 注入模板 + buildNodeMap
     *
     * 模板查找优先级：this.template > this.type
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
        this.debounce('ComponentBase:flush', () => this.flush(), 0);
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
}
