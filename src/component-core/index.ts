/**
 * @qimenjs/component-core
 *
 * 组件核心层 - 基类、注册管理器、基础能力、编译引擎
 */

// 组件基类
export { Component, COMPONENT_ABILITIES, TEMPLATE_COMPONENT_ABILITIES } from './Component';

// 注册管理器
export { ComponentRegistrar } from './ComponentRegistrar';

// 节点结构管理器
export { NodeMapManager } from './NodeMapManager';

// 基础能力
export { NodePropAbility } from './abilities/NodePropAbility';
export { CommonPropsAbility } from './abilities/CommonPropsAbility';
export { AnimationAbility } from './abilities';
export { LifecycleAbility } from './abilities/LifecycleAbility';

// 编译引擎
export { CompileEngine } from './engine/CompileEngine';
export type { CompileResult } from './engine/types/compile-engine-types';
export { VOID_TAGS } from './engine/constants/compile-constants';
export { findByPath } from './engine/utils/dom-path';

// 事件引擎
export { EventEngine, DelegatedEventEngine } from './engine/EventEngine';

// 运行时引擎
export { RuntimeEngine, executeOverrideQueue } from './engine/RuntimeEngine';

// 模板注册器
export { TemplateRegistrar } from './engine/TemplateRegistrar';
export type { TemplateEntry, CompiledProduct } from './types/template-registrar';

// 节点属性工具
export { applyChildNodeProps, buildChildNodePropDescs } from './engine/ChildNodeProps';

// 模板常量
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
export type {
    NodeMetadata,
    NodeIndexPath,
    CompiledTemplateResult,
    CompiledTemplateCache,
} from './types/compiled-types';
export type { ComponentTemplate } from './types/component-template';
export type {
    TplNode,
    TplFragment,
    FlexConfig,
    GridConfig,
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
    ItemTypeEvents,
    TplEvents,
    DelegatedEventRule,
} from './types/tpl-events';

// 初始化 TemplateRegistrar 到 RegistryHub
import { TemplateRegistrar } from './engine/TemplateRegistrar';
import { RegistryHub } from '@qimenjs/registry';
RegistryHub.use(TemplateRegistrar.getInstance());
