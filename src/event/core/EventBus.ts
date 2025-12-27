import { BusAction, EventHandler, EventLogAction } from './types';
import { EventScope } from './EventScope';
import { ILogger, LogLevel } from '@orbitjs/logger';
import { string } from '@orbitjs/utils';

/**
 * 事件总线 - 用于管理事件订阅、发布和取消订阅的核心类
 *
 * @template Events 事件映射类型，定义了事件名称和载荷类型的对应关系
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
export class EventBus{
    private readonly busId = string.getId();
    private readonly listeners = new Map<string, Set<EventHandler>>();

    constructor(private readonly logger?: ILogger) {}

    // --- 内置日志方法 ---
    logBus(level: LogLevel, action: BusAction, data?: Record<string, any>) {
        if (!this.logger) return;
        this.logger[level](`[event.bus] ${action}`, { busId: this.busId, ...data });
    }

    logEvent(level: LogLevel, action: EventLogAction, event: string, data?: Record<string, any>) {
        if (!this.logger) return;
        this.logger[level](`[event] ${action}`, { busId: this.busId, event, ...data });
    }

    // --- 事件订阅/触发 ---
    on(event: string, handler: EventHandler): () => void {
        let set = this.listeners.get(event);
        if (!set) {
            set = new Set();
            this.listeners.set(event, set);
        }
        set.add(handler);

        return () => {
            set?.delete(handler);
            if (set?.size === 0) this.listeners.delete(event);
        };
    }

    off(event: string, handler: EventHandler): void {
        const set = this.listeners.get(event);
        if (!set || !set.has(handler)) {
            this.logBus('debug', 'off', { event: String(event), found: false });
            return;
        }

        set.delete(handler);
        if (set.size === 0) this.listeners.delete(event);

        this.logBus('debug', 'off', { event: String(event), found: true });
    }

    once(event: string, handler: EventHandler): void {
        const off = this.on(event, payload => {
            off();
            handler(payload);
        });
    }

    emit(event: string, payload?: any): void {
        const handlers = this.listeners.get(event);

        if (!handlers || handlers.size === 0) {
            this.logBus('debug', 'emit_no_listeners', { event: String(event) });
            return;
        }

        this.logEvent('debug', 'emit', String(event), { handlerCount: handlers.size });

        handlers.forEach(handler => {
            try {
                handler(payload);
            } catch (err) {
                this.logEvent('error', 'handler_error', String(event), { error: err });
            }
        });
    }

    /**
     * 清理事件订阅
     * 
     * @param event 可选参数，如果指定则只清理该事件的订阅，否则清理所有事件订阅
     */
    clear(event?: string): void {
        if (event) this.listeners.delete(event);
        else this.listeners.clear();

        this.logBus('warn', 'clear', { event: event ? String(event) : 'all' });
    }

    /**
     * 创建事件作用域
     * 
     * 用于管理一组相关事件的生命周期
     * 
     * @returns 返回一个EventScope实例
     */
    createScope(): EventScope {
        return new EventScope(this, this.logger);
    }

    /**
     * 获取事件总线的唯一标识符
     * 
     * @returns 返回事件总线的ID
     */
    getBusId(): string {
        return this.busId;
    }
}