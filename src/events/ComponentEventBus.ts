/**
 * ComponentEventBus 组件事件总线
 *
 * 统一管理所有组件事件的发送和监听，使用同一个 eventScope，
 * 解决发送方和监听方 eventScope 不一致导致事件无法路由的问题。
 *
 * 核心设计：
 * - 单例模式，全局唯一，拥有独立的 eventScope
 * - componentEmit：源组件通过此方法发送组件事件，自动携带 sourceId
 * - componentOn：监听方通过此方法注册组件监听，按 sourceId + eventName 匹配
 * - 所有组件事件收发都经过同一个 eventScope，scopeId 统一
 * - 监听方通过返回的 off 函数管理生命周期（通常配合 onCleanup）
 *
 * 事件名编码规则：
 * - 内部事件名格式为 `component:${sourceId}:${eventName}`
 * - 外部调用方只需传 sourceId 和 eventName，编码由内部处理
 *
 * 与其他事件总线的关系：
 * - EntityEventBus：实体数据操作事件（entity:{entityKey}:{event}）
 * - OverlayEventBus：浮层组件事件（overlay:{overlayKey}:{action}）
 * - DragEventBus：拖拽状态事件（drag:{dragKey}:{action}）
 * - FileEventBus：文件操作事件（file:{fileKey}:{action}）
 * - RouteEventBus：路由导航事件（route:{routeKey}:{event}）
 * - SystemEventBus：系统级事件（system:{event}）
 * - ComponentEventBus：组件间通信事件（component:{eventKey}:{event}）
 *
 * @example
 * ```ts
 * // 源组件发送组件事件
 * const bus = ComponentEventBus.getInstance();
 * bus.componentEmit(ctx);
 *
 * // 监听方注册组件监听
 * const off = bus.componentOn('myGrid', 'selectionchange', (data) => {
 *     console.log('选择变化:', data);
 * });
 *
 * // 清理
 * off();
 * ```
 */

import { globalEventBus } from './GlobalEventBus';
import type { IEventScope } from './types';
import type { EventContext } from '@/context';
import { ILogger, Logger } from '@qimenjs/logger';

/**
 * 将 sourceId 和 eventName 编码为内部组件事件名
 */
function encodeComponentEvent(sourceId: string, eventName: string): string {
    return `component:${sourceId}:${eventName}`;
}

export class ComponentEventBus {
    private static instance: ComponentEventBus;

    /** 组件事件专用的独立 eventScope，所有组件事件收发都经过此 scope */
    private readonly componentScope: IEventScope;

    private readonly logger: ILogger;

    private constructor() {
        this.componentScope = globalEventBus.createEventScope();
        this.logger = Logger.for('component-event-bus');
        this.logger.debug?.('[ComponentEventBus] initialized, scopeId =', this.componentScope.getScopeId());
    }

    /**
     * 获取 ComponentEventBus 单例
     */
    static getInstance(): ComponentEventBus {
        if (!ComponentEventBus.instance) {
            ComponentEventBus.instance = new ComponentEventBus();
        }
        return ComponentEventBus.instance;
    }

    /**
     * 获取组件事件作用域的 scopeId
     */
    getScopeId(): string {
        return this.componentScope.getScopeId();
    }

    /**
     * 发送组件事件（只接收 EventContext）
     *
     * 事件总线统一约定：只接收 EventContext，由发送方构建。
     * 从 ctx.source 提取 sourceId（即 eventKey），从 ctx.type 提取 eventName。
     *
     * @param ctx - 预构建的 EventContext
     */
    componentEmit(ctx: EventContext): void {
        const sourceId = ctx.source;
        const eventName = ctx.type!;
        const componentEvent = encodeComponentEvent(sourceId, eventName);
        this.logger.debug?.(
            '[ComponentEventBus] componentEmit, sourceId =',
            sourceId,
            'eventName =',
            eventName,
            'componentEvent =',
            componentEvent
        );
        this.componentScope.emit(componentEvent, ctx);
    }

    /**
     * 注册组件事件监听
     *
     * 监听方调用此方法注册对指定源组件事件的监听。
     * 所有监听都注册在组件事件的统一 eventScope 上，确保与 componentEmit 使用同一个 scopeId。
     *
     * @param sourceId - 事件源标识（组件的 eventKey）
     * @param eventName - 事件名称
     * @param handler - 事件处理函数
     * @returns 返回取消监听的函数
     */
    componentOn(sourceId: string, eventName: string, handler: (data: any) => void): () => void {
        const componentEvent = encodeComponentEvent(sourceId, eventName);
        this.logger.debug?.(
            '[ComponentEventBus] componentOn, sourceId =',
            sourceId,
            'eventName =',
            eventName,
            'componentEvent =',
            componentEvent
        );
        return this.componentScope.on(componentEvent, (ctx: any) => {
            // EventScope.on 的 handler 接收 EventContext，提取 data 传给业务 handler
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    /**
     * 注册一次性组件事件监听
     *
     * 与 componentOn 类似，但 handler 只触发一次后自动取消。
     *
     * @param sourceId - 事件源标识（组件的 eventKey）
     * @param eventName - 事件名称
     * @param handler - 事件处理函数
     */
    componentOnce(sourceId: string, eventName: string, handler: (data: any) => void): void {
        const componentEvent = encodeComponentEvent(sourceId, eventName);
        this.componentScope.once(componentEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    /**
     * 销毁组件事件总线（通常不需要调用，生命周期与应用一致）
     */
    dispose(): void {
        this.componentScope.dispose();
        this.logger.debug?.('[ComponentEventBus] disposed');
    }
}

export const componentEventBus = ComponentEventBus.getInstance();