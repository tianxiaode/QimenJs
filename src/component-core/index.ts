/**
 * @qimenjs/component-core
 *
 * 组件核心层 - 基类、注册管理器、基础能力
 */

// 组件基类
export { TemplateComponent, TEMPLATE_COMPONENT_ABILITIES } from './TemplateComponent';
export type { NodeMetadata, InternalEventBinding, ExternalEventMap, EventMap, NodeIndexPath, NodeTemplateMeta } from './types';

// 注册管理器
export { ComponentRegistrar, type ComponentDefinition, getCmp } from './ComponentRegistrar';
export { ComponentEventRegistry } from './ComponentEventRegistry';

// 组件类型常量
export { ComponentTypes, type ComponentTypeValue } from './ComponentTypes';

// 基础能力
export { AccessibilityAbility, type AriaKey } from './abilities/AccessibilityAbility';
export { AnimationAbility, type AnimationKey } from './abilities/AnimationAbility';
export { EntityCoreAbility, type EntityManager } from './abilities/EntityCoreAbility';
export { PermissionAbility } from './abilities/PermissionAbility';
export { EventBridgeConfigAbility, type EventBridgeConfig, type PaginationBridgeConfig, type CrudBridgeConfig, type SelectionBridgeConfig, type SearchBridgeConfig, type CustomBridgeConfig } from './abilities/EventBridgeAbility';
export { ThemeAbility } from './abilities/ThemeAbility';
export { StyleAbility } from './abilities/StyleAbility';
export { InitAbility } from './abilities/InitAbility';
export { NodeMapAbility } from './abilities/NodeMapAbility';
export { OverlayAbility, type OverlayConfig, type OverlayResult } from './abilities/OverlayAbility';
export { OverlayHostAbility, type OverlayHostConfig } from './abilities/OverlayHostAbility';
export { TooltipAbility, type TooltipKey, type TooltipOverlayConfig } from './abilities/TooltipAbility';
export { PositionPxAbility } from './abilities/PositionPxAbility';
export { PositionRawAbility } from './abilities/PositionRawAbility';
export { PositionBoolAbility } from './abilities/PositionBoolAbility';
export { PositionDirectAbility } from './abilities/PositionDirectAbility';
export { ElementEventAbility } from './abilities/ElementEventAbility';
export { TemplateAbility } from './abilities/TemplateAbility';
export type { ChildComponentConfig } from './abilities/TemplateAbility';

// 能力协议
export { mergePropAliases, applyPropAliases, initAbilitiesFromProps } from './abilities/PropAlias';
export type { PropAliasMap } from './abilities/PropAlias';

// 浮层定位
export { positionOverlay } from './abilities/positionOverlay';
export type { Placement } from './abilities/positionOverlay';

// 模板编译
export { precompileTemplate, precompileEventTemplates, buildEventMapFromTemplates, findByPath, computeNodePath, inferContentMode, parseEventAttr, parseBridgeEventAttr } from './template-compiler';
export type { InternalEventTemplate, ExternalEventTemplate, BridgeEventTemplate, CompiledTemplate } from './template-compiler';

// JSON 模板
export type { JsonTemplateNode, JsonTemplateResult } from './template-json';
export { jsonTemplateToHtml } from './template-json';

// 新模板类型
export type { TplNode, ComponentTemplate, DomEventDecl } from './template-types';
export { convertTemplate, type TemplateConvertResult, type TplNodeMeta } from './template-json';

// 模板常量（Area, Name, Slot, Event）
export { Area, Name, Slot, Event } from './template-constants';
export type { AreaType, NameType, SlotType, EventType } from './template-constants';

// 模板预设
export {
    BUTTON_TEMPLATE,
    INPUT_TEMPLATE,
    INPUT_TOP_TEMPLATE,
    SELECT_TEMPLATE,
    TOOLBAR_TEMPLATE,
    ICON_TEMPLATE,
    TEXT_TEMPLATE,
    TABLE_TEMPLATE,
    DIALOG_TEMPLATE,
    TIPS_TEMPLATE,
    DROPDOWN_TEMPLATE,
    POPOVER_TEMPLATE,
    TOAST_TEMPLATE,
    TOAST_NOTIFICATION_TEMPLATE,
    MSGBOX_TEMPLATE,
    BADGE_TEMPLATE,
    MENU_ITEM_TEMPLATE,
    MENU_TEMPLATE,
    PANEL_TEMPLATE,
    ITEMGROUP_TEMPLATE,
    NAVITEM_TEMPLATE,
    COMPONENT_TEMPLATES,
} from './template-presets';

// 内容属性
export { buildContentProperties, translateI18nKey, applyValueToEl } from './content-properties';
