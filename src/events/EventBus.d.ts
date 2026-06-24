import { BusAction, EventHandler, EventLogAction, IEventScope } from './types';
import { ILogger, LogLevel } from '@orbitjs/logger';
/**
 * 事件总线 - 用于管理事件订阅、发布和取消订阅的核心类
 *
 * EventBus 提供了一个基于事件驱动的通信机制，允许不同组件之间解耦合地进行通信。
 * 它支持多种事件处理模式，包括一次性订阅、取消订阅等功能。
 *
 * @template Events 事件映射类型，定义了事件名称和载荷类型的对应关系
 *
 * @example
 * ```ts
 * // 定义事件类型
 * type MyEvents = {
 *   'user:login': { userId: string };
 *   'user:logout': void;
 * };
 *
 * // 创建事件总线实例
 * const bus = new EventBus<MyEvents>();
 *
 * // 订阅事件
 * const unsubscribe = bus.on('user:login', (payload) => {
 *   console.log('用户登录:', payload.userId);
 * });
 *
 * // 发布事件
 * bus.emit('user:login', { userId: '123' });
 *
 * // 取消订阅
 * unsubscribe();
 * ```
 */
export declare class EventBus {
    private readonly logger?;
    private readonly busId;
    private readonly listeners;
    /**
     * 构造函数
     *
     * @param logger - 可选的日志记录器，用于记录事件总线的操作日志
     */
    constructor(logger?: ILogger | undefined);
    /**
     * 记录事件总线相关的日志
     *
     * @param level - 日志级别
     * @param action - 操作动作
     * @param data - 附加数据
     */
    logBus(level: LogLevel, action: BusAction, data?: Record<string, any>): void;
    /**
     * 记录事件相关的日志
     *
     * @param level - 日志级别
     * @param action - 事件操作动作
     * @param event - 事件名称
     * @param data - 附加数据
     */
    logEvent(level: LogLevel, action: EventLogAction, event: string, data?: Record<string, any>): void;
    /**
     * 订阅事件
     *
     * 添加一个事件处理器，该处理器会在每次事件被触发时被调用。
     *
     * @param event - 事件名称
     * @param handler - 事件处理器函数
     * @returns 返回一个取消订阅的函数
     */
    on(event: string, handler: EventHandler): () => void;
    /**
     * 一次性订阅事件
     *
     * 添加一个事件处理器，该处理器只会在事件第一次被触发时调用，之后自动取消订阅。
     *
     * @param event - 事件名称
     * @param handler - 事件处理器函数
     */
    once(event: string, handler: EventHandler): void;
    /**
     * 触发事件
     *
     * 将事件数据传递给所有订阅了该事件的处理器。
     *
     * @param event - 事件名称
     * @param data - 事件数据载荷
     * @param source - 事件源（可选）
     * @param scopeId - 作用域ID（可选，默认为'NO_SCOPE'）
     */
    emit(event: string, data?: any, source?: any, scopeId?: string): void;
    /**
     * 清理事件订阅
     *
     * @param event 可选参数，如果指定则只清理该事件的订阅，否则清理所有事件订阅
     */
    clear(event?: string): void;
    /**
     * 创建事件作用域
     *
     * 用于管理一组相关事件的生命周期
     *
     * @returns 返回一个EventScope实例
     */
    createScope(): IEventScope;
    /**
     * 获取事件总线的唯一标识符
     *
     * @returns 返回事件总线的ID
     */
    getBusId(): string;
}
//# sourceMappingURL=EventBus.d.ts.map