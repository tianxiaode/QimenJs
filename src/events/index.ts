/**
 * @qimenjs/event
 *
 * 核心事件系统 - 提供环境无关的事件订阅、发布、作用域管理功能
 */

// 导出类型定义
export * from './types';

// 导出实现
export * from './EventBus';
export * from './EventScope';
export * from './GlobalEventBus';
export * from './EventSourceRegistrar';
export * from './EventFlowRegistrar';
export * from './StateTrigger';
export { I18nEventBridge, i18nEventBridge, type I18nEventBridgeConfig } from './I18nEventBridge';

// 导出实体事件常量
export * from './entity-events';

// 导出组件能力事件常量
export * from './component-events';

// 重新导出 EventContext 和 EventContextBuilder（来自 context 包）
export type { EventContext, EventChainLink, EventMetadata } from '@/context';
export { EventContextBuilder } from '@/context';
