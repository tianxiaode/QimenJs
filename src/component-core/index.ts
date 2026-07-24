/**
 * @qimenjs/component-core
 *
 * 组件核心层 - 基类、注册管理器、基础能力、模板编译
 */

// 组件基类
export { TemplateComponent, TEMPLATE_COMPONENT_ABILITIES } from './TemplateComponent';

// 工厂层基类（withTemplate / replace 创建内部类）
export { Component } from './Component';

// 注册管理器
export { ComponentRegistrar } from './ComponentRegistrar';

// 组件类型常量
export { ComponentTypes } from './ComponentTypes';

// 节点结构管理器
export { NodeMapManager } from './NodeMapManager';

// 基础能力

export { NodePropAbility } from './abilities/NodePropAbility';
export { CommonPropsAbility } from './abilities/CommonPropsAbility';
export { AnimationAbility } from './abilities';

export { LifecycleAbility } from './abilities/LifecycleAbility';

// 模板编译工具
export { findByPath, compilePendingTemplate } from './engine/TemplateCompiler';
export { applyChildNodeProps, buildChildNodePropDescs } from './engine/ChildNodeProps';
export { createInnerClass, createDerivedInnerClass } from './engine/TemplateFactory';

// 构建引擎
export { TemplateCompiler } from './engine/TemplateCompiler';
export type { CompileResult } from './engine/TemplateCompiler';
export { TemplateDeriver } from './engine/TemplateDeriver';
export { BodyMerger } from './engine/BodyMerger';
export { DelegatedEventEngine } from './engine/DelegatedEventEngine';
export { RuntimeEngine, executeOverrideQueue } from './engine/RuntimeEngine';

// 模板常量
export { VOID_TAGS } from './engine/TemplateCompiler';
export {
    ALIGN_MAP,
    PACK_MAP,
    CONTENT_MODE_MAP,
    COMMON_NODE_PROPS,
    RESERVED_KEYS,
    ANIMATION_PRESETS,
} from './engine/TemplateConstants';
export type { ContentPropDef, AnimationOptions } from './engine/TemplateConstants';

// 类型
export type { NodeMetadata, NodeIndexPath, CompiledTemplateResult } from './types/compiled-types';
export type { ComponentTemplate } from './types/component-template';
export type {
    TplNode,
    TplFragment,
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
export type {
    TplEventAction,
    NodeEventDecl,
    TplEvents,
    DelegatedEventRule,
} from './types/tpl-events';

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
