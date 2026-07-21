/**
 * @qimenjs/component-core
 *
 * 组件核心层 - 基类、注册管理器、基础能力、模板编译
 */

// 组件基类
export { TemplateComponent, TEMPLATE_COMPONENT_ABILITIES } from './TemplateComponent';

// 注册管理器
export { ComponentRegistrar } from './ComponentRegistrar';

// 组件类型常量
export { ComponentTypes } from './ComponentTypes';

// 基础能力
export { EventForwardAbility } from './abilities/EventForwardAbility';
export { NodePropAbility } from './abilities/NodePropAbility';
export { CommonPropsAbility } from './abilities/CommonPropsAbility';
export { AnimationAbility } from './abilities/AnimationAbility';

export { LifecycleAbility } from './abilities/LifecycleAbility';

// 模板编译工具
export { findByPath, compilePendingTemplate } from './utils/template-compiler';
export { initFromTemplate } from './utils/template-init';
export { applyChildNodeProps, buildChildNodePropDescs } from './utils/child-node-props';
export { copyPrototypeMethods } from './utils/class-copy';
export { createTemplateClass, createReplaceClass } from './utils/template-factory';

// 模板常量
export {
    VOID_TAGS,
    ALIGN_MAP,
    PACK_MAP,
    CONTENT_MODE_MAP,
    COMMON_NODE_PROPS,
    RESERVED_KEYS,
    ANIMATION_PRESETS,
} from './utils/template-constants';
export type { ContentPropDef, AnimationOptions } from './utils/template-constants';

// 类型
export type {
    NodeMetadata,
    NodeIndexPath,
    CompiledTemplateResult,
    CompiledComponentTemplate,
} from './types/compiled-types';
export type { ComponentTemplate } from './types/component-template';
export type {
    TplNode,
    FlexConfig,
    GridConfig,
    DomEventDecl,
    HiddenMode,
} from './types/tpl-node-types';
export type {
    BodyDef,
    AnimationDecl,
    FloatDecl,
    DragDecl,
    FloatsConfig,
    DragsConfig,
    ListenItem,
    LifecycleHooks,
} from './types/tpl-body';
export type { BodyKeyDef } from './types/tpl-body-def';
export type { NodePropDef, NodePropMap, DEFAULT_NODE_PROP_MAP } from './types/common-props';

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
