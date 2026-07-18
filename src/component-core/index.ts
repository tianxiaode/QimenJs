/**
 * @qimenjs/component-core
 *
 * 组件核心层 - 基类、注册管理器、基础能力
 */

// 组件基类
export { TemplateComponent, TEMPLATE_COMPONENT_ABILITIES } from './TemplateComponent';
export type {
    NodeMetadata,
    InternalEventBinding,
    ExternalEventMap,
    EventMap,
    NodeIndexPath,
    NodeTemplateMeta,
} from './types/index';

// 注册管理器
export { ComponentRegistrar, getCmp } from './ComponentRegistrar';
export { ComponentEventRegistry } from './ComponentEventRegistry';

// 组件类型常量
export { ComponentTypes } from './ComponentTypes';
export type { ComponentTypeValue } from './types/component-types';

// 基础能力（仅保留有行为逻辑 + 语义快捷方式）
export { AnimationAbility, type AnimationKey } from './abilities/AnimationAbility';

export {
    EventBridgeConfigAbility,
    type EventBridgeConfig,
    type PaginationBridgeConfig,
    type CrudBridgeConfig,
    type SelectionBridgeConfig,
    type SearchBridgeConfig,
    type CustomBridgeConfig,
} from './abilities/EventBridgeAbility';
export { InitAbility } from './abilities/InitAbility';
export {
    LayoutAbility,
    LAYOUT_FIT,
    LAYOUT_HBOX,
    LAYOUT_VBOX,
    LAYOUT_GRID,
    LAYOUT_CENTER,
    type LayoutType,
} from './abilities/LayoutAbility';
export { NodeMapAbility } from './abilities/NodeMapAbility';
export { ElementEventAbility } from './abilities/ElementEventAbility';

export { TemplateAbility } from './abilities/TemplateAbility';

// 能力协议
export { mergePropAliases, applyPropAliases, initAbilitiesFromProps } from './abilities/PropAlias';
export type { PropAliasMap } from './abilities/PropAlias';

// 模板编译工具
export { findByPath, computeNodePath, inferContentMode, parseEventAttr } from './template-compiler';

// 模板常量（Area, Name, Slot, Event）
export { Area, Name, Slot, Event } from './template-constants';
export type { AreaType, NameType, SlotType, EventType } from './types/template-constants';

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

// 通用属性定义
export {
    COMMON_PROPS,
    RESOLVERS,
    resolvePx,
    resolveMarginPadding,
    resolveBorder,
    childPropName,
    componentChildPropName,
} from './common-props';
export type {
    CommonPropDef,
    MarginPadding,
    Border,
    BorderSide,
    PropTarget,
} from './types/common-props';

// Layout 类型（从 @qimenjs/layout 迁移）
export type {
    HandlerConfig,
    EventListen,
    BridgesConfig,
    ListensConfig,
    OverlayDecl,
    OverlaysConfig,
    LifecycleHooks,
    LayoutMeta,
    TooltipProps,
    AnimationProps,
    DragDecl,
    DragsConfig,
    EntityProps,
    ArrowProps,
    ExpandableProps,
    ExpandableConfig,
} from './types/layout';
export { ANIMATION_KEYS, DRAG_DECL_KEYS, TOOLTIP_KEYS, EXPANDABLE_KEYS } from './layout-types';

export {
    BODY_SPECIAL_KEYS,
    BODY_SPECIAL_KEY_SET,
    isBodySpecialKey,
    validateBodyKey,
} from './body-keys';
export type { BodyKeyDef, BodyKeyCategory } from './types/body-keys';

// Re-export Placement from overlay
export type { Placement } from '@/overlay/dispatch';
