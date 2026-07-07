/**
 * @qimenjs/component-core
 *
 * 组件核心层 - 基类、注册管理器、基础能力
 */

// 组件基类
export { ComponentBase } from './ComponentBase';

// 注册管理器
export { ComponentRegistrar, type ComponentDefinition } from './ComponentRegistrar';
export { ComponentManager, getCmp } from './ComponentManager';
export { ComponentEventRegistry } from './ComponentEventRegistry';

// 基础能力
export { ThemeAbility } from './abilities/ThemeAbility';
export { StyleAbility } from './abilities/StyleAbility';
export { EventBridgeAbility } from './abilities/EventBridgeAbility';
export type { EventBridgeConfig, PaginationBridgeConfig, CrudBridgeConfig, SelectionBridgeConfig, CustomBridgeConfig } from './abilities/EventBridgeAbility';

// 能力协议
export { mergePropAliases, applyPropAliases, initAbilitiesFromProps } from './abilities/PropAlias';
export type { PropAliasMap } from './abilities/PropAlias';
