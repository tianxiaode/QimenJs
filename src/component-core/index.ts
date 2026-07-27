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
export type { CompileResult } from './types/compile-engine-types';
export { VOID_TAGS } from './constants/compile-constants';
export { findByPath } from './engine/utils/dom-path';

// 事件引擎
export { DelegatedEventEngine } from './engine/DelegatedEventEngine';

// 运行时引擎
export { RuntimeEngine, executeOverrideQueue } from './engine/RuntimeEngine';

// 初始化管线
export {
    MOUNT_PHASE,
    FILL_PHASE,
    INSTANTIATE_PHASE,
    FINALIZE_PHASE,
    runPhase,
} from './engine/pipeline';
export { executeOverrideQueue as pipelineOverrideQueue } from './engine/pipeline';

// 模板注册器
export { TemplateRegistrar } from './engine/TemplateRegistrar';
export type { TemplateEntry, CompiledProduct } from './types/template-registrar';

// 节点属性引擎
export { ChildNodePropsEngine } from './engine/ChildNodePropsEngine';

// 模板常量
export {
    ALIGN_MAP,
    PACK_MAP,
    CONTENT_MODE_MAP,
    COMMON_NODE_PROPS,
    RESERVED_KEYS,
    ANIMATION_PRESETS,
} from './constants/template-constants';
export type { ContentPropDef, AnimationOptions } from './types/template-constants';

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
export type { ComponentProps, InitContext } from './types/init-context';
export type { INodeMapManager } from './types/node-map-manager-types';

// 初始化 TemplateRegistrar 到 RegistryHub
import { TemplateRegistrar } from './engine/TemplateRegistrar';
import { RegistryHub } from '@qimenjs/registry';
RegistryHub.use(TemplateRegistrar.getInstance());
