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
export { EventBridge } from './EventBridge';
export { EntityEventBus, entityEventBus } from './EntityEventBus';
export { OverlayEventBus, overlayEventBus } from './OverlayEventBus';
export { DragEventBus, dragEventBus, type DragState, type DragAction } from './DragEventBus';
export {
    SystemEventBus,
    systemEventBus,
    SYSTEM_EVENTS,
    type SystemEventName,
} from './SystemEventBus';
export { WindowEventBridge, windowEventBridge } from './WindowEventBridge';
export { I18nEventBridge, i18nEventBridge } from './I18nEventBridge';

// 导出实体事件常量
export * from './entity-events';

// 导出浮层事件常量
export * from './overlay-events';

// 导出拖拽事件常量
export * from './drag-events';

// 导出组件能力事件常量
export * from './component-events';

// 重新导出 EventContext 和 EventContextBuilder（来自 context 包）
export type { EventContext, EventChainLink, EventMetadata } from '@/context';
export { EventContextBuilder } from '@/context';
