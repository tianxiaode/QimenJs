/**
 * @qimenjs/component-core
 *
 * 组件核心层 - 基类、注册管理器、基础能力
 */

// 组件基类
export { TemplateComponent, TEMPLATE_COMPONENT_ABILITIES } from './TemplateComponent';
/** @deprecated 使用 TemplateComponent */
export { TemplateComponent as ComponentBase } from './TemplateComponent';
/** @deprecated 使用 TEMPLATE_COMPONENT_ABILITIES */
export { TEMPLATE_COMPONENT_ABILITIES as COMPONENT_BASE_ABILITIES } from './TemplateComponent';
export type { NodeMetadata, InternalEventBinding, ExternalEventMap, EventMap, NodeIndexPath, NodeTemplateMeta } from './types';

// 注册管理器
export { ComponentRegistrar, type ComponentDefinition } from './ComponentRegistrar';
export { ComponentManager, getCmp } from './ComponentManager';
export { ComponentEventRegistry } from './ComponentEventRegistry';

// 组件类型常量
export { ComponentTypes, type ComponentTypeValue } from './ComponentTypes';

// 基础能力
export { AccessibilityAbility, type AriaKey } from './abilities/AccessibilityAbility';
export { AnimationAbility, type AnimationKey } from './abilities/AnimationAbility';
export { EntityCoreAbility, type EntityManager } from './abilities/EntityCoreAbility';
export { PermissionAbility } from './abilities/PermissionAbility';
export { EventBridgeAbility, type EventBridgeConfig, type PaginationBridgeConfig, type CrudBridgeConfig, type SelectionBridgeConfig, type SearchBridgeConfig, type CustomBridgeConfig } from './abilities/EventBridgeAbility';
export { ThemeAbility } from './abilities/ThemeAbility';
export { StyleAbility } from './abilities/StyleAbility';
export { InitAbility } from './abilities/InitAbility';
export { NodeMapAbility } from './abilities/NodeMapAbility';
export { OverlayAbility, type OverlayConfig, type OverlayResult, type TooltipKey } from './abilities/OverlayAbility';
export { PositionPxAbility } from './abilities/PositionPxAbility';
export { PositionRawAbility } from './abilities/PositionRawAbility';
export { PositionBoolAbility } from './abilities/PositionBoolAbility';
export { PositionDirectAbility } from './abilities/PositionDirectAbility';
export { ElementEventAbility } from './abilities/ElementEventAbility';

// 能力协议
export { mergePropAliases, applyPropAliases, initAbilitiesFromProps } from './abilities/PropAlias';
export type { PropAliasMap } from './abilities/PropAlias';

// 浮层定位
export { positionOverlay } from './abilities/positionOverlay';
export type { Placement } from './abilities/positionOverlay';
