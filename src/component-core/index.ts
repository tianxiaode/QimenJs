/**
 * @qimenjs/component-core
 *
 * 组件核心层 - 基类、注册管理器、基础能力
 */

// 组件基类
export { ComponentBase, COMPONENT_BASE_ABILITIES } from './ComponentBase';
export type { NodeMetadata, InternalEventBinding, ExternalEventMap, EventMap, NodeIndexPath, NodeTemplateMeta } from './types';

// 注册管理器
export { ComponentRegistrar, type ComponentDefinition } from './ComponentRegistrar';
export { ComponentManager, getCmp } from './ComponentManager';
export { ComponentEventRegistry } from './ComponentEventRegistry';

// 组件类型常量
export { ComponentTypes, type ComponentTypeValue } from './ComponentTypes';

// 基础能力
export { AccessibilityAbility } from './abilities/AccessibilityAbility';
export { AnimationAbility } from './abilities/AnimationAbility';
export { EntityCoreAbility } from './abilities/EntityCoreAbility';
export { PermissionAbility } from './abilities/PermissionAbility';
export { EventBridgeAbility } from './abilities/EventBridgeAbility';
export type { EventBridgeConfig, PaginationBridgeConfig, CrudBridgeConfig, SelectionBridgeConfig, SearchBridgeConfig, CustomBridgeConfig } from './abilities/EventBridgeAbility';
export { ThemeAbility } from './abilities/ThemeAbility';
export { StyleAbility } from './abilities/StyleAbility';
export { InitAbility } from './abilities/InitAbility';
export { NodeMapAbility } from './abilities/NodeMapAbility';
export { OverlayAbility } from './abilities/OverlayAbility';
export { PositionPxAbility } from './abilities/PositionPxAbility';
export { PositionRawAbility } from './abilities/PositionRawAbility';
export { PositionBoolAbility } from './abilities/PositionBoolAbility';
export { PositionDirectAbility } from './abilities/PositionDirectAbility';

// 能力协议
export { mergePropAliases, applyPropAliases, initAbilitiesFromProps } from './abilities/PropAlias';
export type { PropAliasMap } from './abilities/PropAlias';

// 浮层定位
export { positionOverlay } from './abilities/positionOverlay';
export type { Placement } from './abilities/positionOverlay';
