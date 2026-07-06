import { BusAction, EventHandler, EventLogAction, IEventScope } from './types';
import { EventScope } from './EventScope';
import type { EventContext } from '@/context';
import { ILogger, LogLevel } from '@qimenjs/logger';
import { string } from '@qimenjs/utils';

/**
 * 一级深度清理：将对象属性中的引用类型替换为空值
 *
 * - 对象属性 → {}
 * - 数组属性 → []
 * - 原始值保持不变
 *
 * 用于 EventContext.data 的自动清理，防止事件处理后数据被意外引用。
 *
 * @param obj - 要清理的对象
 */
export function deepNullify(obj: any): void {
    if (obj === null || obj === undefined || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
        obj.length = 0;
    } else {
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (val !== null && typeof val === 'object') {
                obj[key] = Array.isArray(val) ? [] : {};
            }
        }
    }
}

/**
 * 事件总线 - 用于管理事件订阅、发布和取消订阅的核心类
 *
 * EventBus 提供了一个基于事件驱动的通信机制，允许不同组件之间解耦合地进行通信。
 * 它支持多种事件处理模式，包括一次性订阅、取消订阅、引用计数、异步 handler 等功能。
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
 *   console.log('用户登录:', payload.data.userId);
 * });
 *
 * // 发布事件
 * bus.emit('user:login', { userId: '123' });
 *
 * // 取消订阅
 * unsubscribe();
 * ```
 */
export class EventBus {
    private readonly busId = string.getId();
    private readonly listeners = new Map<string, Set<EventHandler>>();

    /**
     * 构造函数
     *
     * @param logger - 可选的日志记录器，用于记录事件总线的操作日志
     */
    constructor(private readonly logger?: ILogger) {}

    // --- 内置日志方法 ---

    /**
     * 记录事件总线相关的日志
     *
     * @param level - 日志级别
     * @param action - 操作动作
     * @param data - 附加数据
     */
    logBus(level: LogLevel, action: BusAction, data?: Record<string, any>) {
        if (!this.logger) return;
        this.logger[level](`[event.bus] ${action}`, { busId: this.busId, ...data });
    }

    /**
     * 记录事件相关的日志
     *
     * @param level - 日志级别
     * @param action - 事件操作动作
     * @param event - 事件名称
     * @param data - 附加数据
     */
    logEvent(level: LogLevel, action: EventLogAction, event: string, data?: Record<string, any>) {
        if (!this.logger) return;
        this.logger[level](`[event] ${action}`, { busId: this.busId, event, ...data });
    }

    // --- 事件订阅/触发 ---

    /**
     * 订阅事件
     *
     * 添加一个事件处理器，该处理器会在每次事件被触发时被调用。
     *
     * @param event - 事件名称
     * @param handler - 事件处理器函数
     * @returns 返回一个取消订阅的函数
     */
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

    /**
     * 一次性订阅事件
     *
     * 添加一个事件处理器，该处理器只会在事件第一次被触发时调用，之后自动取消订阅。
     *
     * @param event - 事件名称
     * @param handler - 事件处理器函数
     */
    once(event: string, handler: EventHandler): void {
        const off = this.on(event, payload => {
            off();
            handler(payload);
        });
    }

    /**
     * 触发事件（传统方式）
     *
     * @param event - 事件名称
     * @param data - 事件数据载荷
     * @param source - 事件源（可选）
     * @param scopeId - 作用域ID（可选，默认为'NO_SCOPE'）
     */
    emit(event: string, data?: any, source?: any, scopeId?: string): void;

    /**
     * 触发事件（使用预构建的 EventContext）
     *
     * 当调用方已经构建了完整的 EventContext（如 emitUI）时使用此重载。
     * 直接使用传入的 context，不再内部构建。
     *
     * @param event - 事件名称
     * @param context - 预构建的 EventContext
     */
    emit(event: string, context: EventContext): void;

    /**
     * 触发事件（实现）
     *
     * 将事件数据传递给所有订阅了该事件的处理器。
     * 支持引用计数和异步 handler 检测。
     *
     * 当 handler 返回 Promise 时，引用计数会在 Promise 完成后递减。
     * _refCount 归零时标记事件处理完成，但不自动清理 data。
     * 如需清理，请使用 cleanupContext() 方法。
     */
    emit(event: string, dataOrContext?: any, source?: any, scopeId: string = 'NO_SCOPE'): void {
        // 判断第二个参数是否为预构建的 EventContext
        const isPrebuiltContext = dataOrContext !== null
            && dataOrContext !== undefined
            && typeof dataOrContext === 'object'
            && 'event' in dataOrContext
            && 'timestamp' in dataOrContext
            && 'busId' in dataOrContext;

        const context: EventContext = isPrebuiltContext
            ? dataOrContext
            : {
                event,
                data: dataOrContext,
                source: source || 'UNKNOWN',
                busId: this.busId,
                scopeId,
                timestamp: Date.now(),
            };

        const handlers = this.listeners.get(event);

        if (!handlers || handlers.size === 0) {
            this.logBus('debug', 'emit_no_listeners', { event: String(event) });
            return;
        }

        this.logEvent('debug', 'emit', String(event), {
            handlerCount: handlers.size,
            source: context.source?.constructor?.name || context.source,
        });

        // 设置引用计数
        context._refCount = handlers.size;

        const done = () => {
            context._refCount!--;
            // _refCount 归零时不自动清理，由调用方决定是否清理
        };

        handlers.forEach(handler => {
            try {
                const result = handler(context);
                if (result instanceof Promise) {
                    result.then(done, (err) => {
                        this.logEvent('error', 'handler_error', String(event), { error: err });
                        done();
                    });
                } else {
                    done();
                }
            } catch (err) {
                this.logEvent('error', 'handler_error', String(event), { error: err });
                done();
            }
        });
    }

    /**
     * 清理 EventContext 的 data
     *
     * 对 ctx.data 执行一级深度清理，将引用类型替换为空值。
     * 通常在 emitUI 中，当 _refCount 归零后显式调用。
     *
     * @param ctx - 要清理的 EventContext
     */
    cleanupContext(ctx: EventContext): void {
        if (ctx.data !== null && ctx.data !== undefined && typeof ctx.data === 'object') {
            deepNullify(ctx.data);
        }
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
    createScope(): IEventScope {
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
