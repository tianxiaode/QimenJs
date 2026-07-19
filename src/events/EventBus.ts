import { BusAction, EventHandler, EventLogAction, IEventScope } from './types';
import { EventScope } from './EventScope';
import type { EventContext } from '@/context';
import { ILogger, LogLevel } from '@qimenjs/logger';
import { string, shallowNullify } from '@qimenjs/utils';

/**
 * 事件总线 - 用于管理事件订阅、发布和取消订阅的核心类
 *
 * EventBus 提供了一个基于事件驱动的通信机制，允许不同组件之间解耦合地进行通信。
 * 它支持多种事件处理模式，包括一次性订阅、取消订阅、引用计数、异步 handler 等功能。
 *
 * 数据结构：按 scopeId 隔离，每个 scopeId 下有独立的事件监听器集合。
 * emit 时只触发自己 scopeId 下的 handler，不广播到其他 scope。
 *
 * @example
 * ```ts
 * const bus = new EventBus();
 * const scope = bus.createScope();
 *
 * // 订阅事件（handler 注册在 scope 的 scopeId 下）
 * scope.on('click', (payload) => {
 *   console.log('点击:', payload.data);
 * });
 *
 * // 发布事件（只触发自己 scopeId 下的 handler）
 * scope.emit('click', { x: 100, y: 200 });
 * ```
 */
export class EventBus {
    private readonly busId = string.getId();
    /**
     * 按 scopeId 隔离的监听器
     *
     * 结构：Map<scopeId, Map<event, Set<handler>>>
     * - 每个 scopeId 下有独立的事件监听器集合
     * - emit 时只查自己 scopeId 下的 handler
     * - 组件事件：instance.on('click', handler) 注册在 instance 的 scopeId 下
     * - 全局事件：globalEventBus.on('theme:change', handler) 注册在 rootScope 的 scopeId 下
     */
    private readonly scopedListeners = new Map<string, Map<string, Set<EventHandler>>>();

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
     * 将 handler 注册到指定 scopeId 下的事件监听器集合中。
     * emit 时只触发同一 scopeId 下的 handler。
     *
     * @param event - 事件名称
     * @param handler - 事件处理器函数
     * @param scopeId - 作用域ID（必须传入，用于隔离）
     * @returns 返回一个取消订阅的函数
     */
    on(event: string, handler: EventHandler, scopeId: string): () => void {
        let scopeMap = this.scopedListeners.get(scopeId);
        if (!scopeMap) {
            scopeMap = new Map();
            this.scopedListeners.set(scopeId, scopeMap);
        }
        let set = scopeMap.get(event);
        if (!set) {
            set = new Set();
            scopeMap.set(event, set);
        }
        set.add(handler);

        this.logBus('debug', 'on', { event: String(event), scopeId, listenerCount: set.size });

        return () => {
            set?.delete(handler);
            if (set?.size === 0) scopeMap?.delete(event);
            if (scopeMap?.size === 0) this.scopedListeners.delete(scopeId);
        };
    }

    /**
     * 一次性订阅事件
     *
     * 添加一个事件处理器，该处理器只会在事件第一次被触发时调用，之后自动取消订阅。
     *
     * @param event - 事件名称
     * @param handler - 事件处理器函数
     * @param scopeId - 作用域ID
     */
    once(event: string, handler: EventHandler, scopeId: string): void {
        const off = this.on(
            event,
            payload => {
                off();
                handler(payload);
            },
            scopeId
        );
    }

    /**
     * 触发事件（传统方式）
     *
     * @param event - 事件名称
     * @param data - 事件数据载荷
     * @param source - 事件源（可选）
     * @param scopeId - 作用域ID（必须传入，只触发该 scopeId 下的 handler）
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
     * 只触发指定 scopeId 下的 handler，不广播到其他 scope。
     * 支持引用计数和异步 handler 检测。
     *
     * 当 handler 返回 Promise 时，引用计数会在 Promise 完成后递减。
     * _refCount 归零时标记事件处理完成，但不自动清理 data。
     * 如需清理，请使用 cleanupContext() 方法。
     */
    emit(event: string, dataOrContext?: any, source?: any, scopeId: string = 'NO_SCOPE'): void {
        // 判断第二个参数是否为预构建的 EventContext
        const isPrebuiltContext =
            dataOrContext !== null &&
            dataOrContext !== undefined &&
            typeof dataOrContext === 'object' &&
            'event' in dataOrContext &&
            'timestamp' in dataOrContext &&
            'busId' in dataOrContext;

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

        const emitScopeId = context.scopeId || scopeId;

        // 只查 emit scopeId 下的 handler
        const scopeMap = this.scopedListeners.get(emitScopeId);
        if (!scopeMap) {
            this.logBus('debug', 'emit_no_scope', { event: String(event), scopeId: emitScopeId });
            return;
        }

        const handlers = scopeMap.get(event);
        if (!handlers || handlers.size === 0) {
            this.logBus('debug', 'emit_no_listeners', {
                event: String(event),
                scopeId: emitScopeId,
            });
            return;
        }

        this.logEvent('debug', 'emit', String(event), {
            handlerCount: handlers.size,
            emitScopeId,
            source: context.source?.constructor?.name || context.source,
        });

        // 设置引用计数
        context._refCount = handlers.size;

        const done = () => {
            context._refCount!--;
        };

        handlers.forEach(handler => {
            try {
                const result = handler(context);
                if (result instanceof Promise) {
                    result.then(done, err => {
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
            shallowNullify(ctx.data);
        }
    }

    /**
     * 清理事件订阅
     *
     * @param scopeId 作用域ID，清理该 scope 下的所有事件订阅
     * @param event 可选参数，如果指定则只清理该事件的订阅
     */
    clear(scopeId: string, event?: string): void {
        if (event) {
            const scopeMap = this.scopedListeners.get(scopeId);
            if (scopeMap) {
                scopeMap.delete(event);
                if (scopeMap.size === 0) this.scopedListeners.delete(scopeId);
            }
        } else {
            this.scopedListeners.delete(scopeId);
        }

        this.logBus('warn', 'clear', { scopeId, event: event ? String(event) : 'all' });
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
