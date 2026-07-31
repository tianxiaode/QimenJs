/**
 * @qimenjs/component-core
 *
 * 组件核心层 - 基类、注册管理器、基础能力、编译引擎
 */

// 组件基类
export { Component } from './Component';
export { ItemContainer, itemsToTpl } from './ItemContainer';
export type { ItemDecl, ItemContainerStaticConfig } from './ItemContainer';
export { COMPONENT_ABILITIES } from './Component-abilities';

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

// 事件引擎（新三引擎 + EventForwarder）
export { EventForwarder } from './engine/EventForwarder';
export { DomEventsEngine } from './engine/DomEventsEngine';
export { ChildEventsEngine } from './engine/ChildEventsEngine';
export { ListensEngine } from './engine/ListensEngine';

// 初始化管线
export {
    MOUNT_PHASE,
    INSTANTIATE_PHASE,
    FINALIZE_PHASE,
    runPhase,
} from './engine/pipeline';

// 模板注册器
export { ComponentRegistrar } from './engine';
export type { ComponentEntry as TemplateEntry, CompiledProduct } from './types/template-registrar';

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
export type { ComponentTemplate, BodyDef, LifecycleHooks } from './types/component-template';
export type {
    TplNode,
    TplFragment,
    FlexConfig,
    GridConfig,
    HiddenMode,
    AnimationDecl,
    FloatDecl,
    DragDecl,
    ListenItem,
} from './types/tpl-node-types';
export type { DomEventsMap } from './types/tpl-events';
export type { NodePropDef, NodePropMap, DEFAULT_NODE_PROP_MAP } from './types/common-props';
export type { DelegatedEventRule, DomEventConfig, TplEventAction } from './types/tpl-events';
export type {
    ComponentProps,
    InitContext,
    BadgeQuickConfig,
    TooltipQuickConfig,
} from './types/init-context';
export type { INodeMapManager } from './types/node-map-manager-types';

export type { Placement } from '@/overlay/dispatch/positionOverlay';

// 初始化 ComponentRegistrar 到 RegistryHub
import { ComponentRegistrar } from './engine';
import { RegistryHub } from '@qimenjs/registry';
RegistryHub.use(ComponentRegistrar.getInstance());
