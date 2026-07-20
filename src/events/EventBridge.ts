/**
 * EventBridge 事件桥单例
 *
 * 统一管理所有桥接事件的发送和监听，使用同一个 eventScope，
 * 解决发送方和监听方 eventScope 不一致导致事件无法路由的问题。
 *
 * 核心设计：
 * - 单例模式，全局唯一，拥有独立的 eventScope
 * - bridgeEmit：源组件通过此方法发送桥接事件，自动携带 sourceId
 * - bridgeOn：监听方通过此方法注册桥接监听，按 sourceId + eventName 匹配
 * - 所有桥接事件收发都经过同一个 eventScope，scopeId 统一
 * - 监听方通过返回的 off 函数管理生命周期（通常配合 onCleanup）
 *
 * 事件名编码规则：
 * - 内部事件名格式为 `bridge:${sourceId}:${eventName}`
 * - 外部调用方只需传 sourceId 和 eventName，编码由内部处理
 *
 * @example
 * ```ts
 * // 源组件发送桥接事件
 * const bridge = EventBridge.getInstance();
 * bridge.bridgeEmit('myGrid', 'selectionchange', { selected: [...] });
 *
 * // 监听方注册桥接监听
 * const off = bridge.bridgeOn('myGrid', 'selectionchange', (data) => {
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
 * 将 sourceId 和 eventName 编码为内部桥接事件名
 */
function encodeBridgeEvent(sourceId: string, eventName: string): string {
    return `bridge:${sourceId}:${eventName}`;
}

export class EventBridge {
    private static instance: EventBridge;

    /** 桥接专用的独立 eventScope，所有桥接事件收发都经过此 scope */
    private readonly bridgeScope: IEventScope;

    private readonly logger: ILogger;

    private constructor() {
        this.bridgeScope = globalEventBus.createEventScope();
        this.logger = Logger.for('event-bridge');
        this.logger.debug?.('[EventBridge] initialized, scopeId =', this.bridgeScope.getScopeId());
    }

    /**
     * 获取 EventBridge 单例
     */
    static getInstance(): EventBridge {
        if (!EventBridge.instance) {
            EventBridge.instance = new EventBridge();
        }
        return EventBridge.instance;
    }

    /**
     * 获取桥接作用域的 scopeId
     */
    getScopeId(): string {
        return this.bridgeScope.getScopeId();
    }

    /**
     * 发送桥接事件（只接收 EventContext）
     *
     * 事件总线统一约定：只接收 EventContext，由发送方构建。
     * 从 ctx.source 提取 sourceId，从 ctx.type 提取 eventName。
     *
     * @param ctx - 预构建的 EventContext
     */
    bridgeEmit(ctx: EventContext): void {
        const sourceId = ctx.source;
        const eventName = ctx.type!;
        const bridgeEvent = encodeBridgeEvent(sourceId, eventName);
        this.logger.debug?.(
            '[EventBridge] bridgeEmit, sourceId =',
            sourceId,
            'eventName =',
            eventName,
            'bridgeEvent =',
            bridgeEvent
        );
        this.bridgeScope.emit(bridgeEvent, ctx);
    }

    /**
     * 注册桥接事件监听
     *
     * 监听方调用此方法注册对指定源组件事件的监听。
     * 所有监听都注册在桥接的统一 eventScope 上，确保与 bridgeEmit 使用同一个 scopeId。
     *
     * @param sourceId - 事件源标识（组件 id 或 'router'）
     * @param eventName - 事件名称
     * @param handler - 事件处理函数
     * @returns 返回取消监听的函数
     */
    bridgeOn(sourceId: string, eventName: string, handler: (data: any) => void): () => void {
        const bridgeEvent = encodeBridgeEvent(sourceId, eventName);
        this.logger.debug?.(
            '[EventBridge] bridgeOn, sourceId =',
            sourceId,
            'eventName =',
            eventName,
            'bridgeEvent =',
            bridgeEvent
        );
        return this.bridgeScope.on(bridgeEvent, (ctx: any) => {
            // EventScope.on 的 handler 接收 EventContext，提取 data 传给业务 handler
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    /**
     * 注册一次性桥接事件监听
     *
     * 与 bridgeOn 类似，但 handler 只触发一次后自动取消。
     *
     * @param sourceId - 事件源标识
     * @param eventName - 事件名称
     * @param handler - 事件处理函数
     */
    bridgeOnce(sourceId: string, eventName: string, handler: (data: any) => void): void {
        const bridgeEvent = encodeBridgeEvent(sourceId, eventName);
        this.bridgeScope.once(bridgeEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    /**
     * 销毁桥接（通常不需要调用，桥接生命周期与应用一致）
     */
    dispose(): void {
        this.bridgeScope.dispose();
        this.logger.debug?.('[EventBridge] disposed');
    }
}
