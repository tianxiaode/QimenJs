import { EventBus } from './EventBus';
import { EventHandler, IEventContext, IEventScope, ScopeLogAction } from './types';

import { ILogger, LogLevel } from '@qimenjs/logger';
import { string } from '@qimenjs/utils';

/**
 * 事件作用域 - 用于管理一组相关事件的生命周期
 *
 * EventScope 可以将多个事件订阅绑定到一个作用域中，当作用域被销毁时，
 * 所有绑定到该作用域的事件订阅都会被自动取消，避免内存泄漏。
 *
 * @template Events 事件映射类型，定义了事件名称和载荷类型的对应关系
 *
 * @example
 * ```ts
 * const bus = new EventBus<MyEvents>();
 * const scope = bus.createScope();
 *
 * // 使用作用域订阅事件
 * scope.on('user:login', (payload) => {
 *   console.log('用户登录:', payload.userId);
 * });
 *
 * // 一次性订阅
 * scope.once('user:logout', () => {
 *   console.log('用户登出');
 * });
 *
 * // 批量清理所有绑定到此作用域的事件订阅
 * scope.dispose();
 * ```
 */
export class EventScope implements IEventScope {
    private readonly scopeId = string.getId('event-scope');
    private readonly disposers: Array<() => void> = [];
    private disposed = false;

    /**
     * 构造函数
     *
     * @param bus - 关联的事件总线实例
     * @param logger - 可选的日志记录器，用于记录事件作用域的操作日志
     */
    constructor(
        private readonly bus: EventBus,
        private readonly logger?: ILogger
    ) {
        this.logScope('debug', 'created');
    }

    // --- 内置日志方法 ---

    /**
     * 记录作用域相关的日志
     *
     * @param level - 日志级别
     * @param action - 作用域操作动作
     * @param data - 附加数据
     */
    logScope(level: LogLevel, action: ScopeLogAction, data?: Record<string, any>) {
        if (!this.logger) return;
        this.logger[level](`[event.scope] ${action}`, {
            busId: this.bus.getBusId(),
            scopeId: this.scopeId,
            ...data,
        });
    }

    /**
     * 触发事件
     *
     * 在当前作用域上下文中触发一个事件，如果作用域已被销毁，则记录警告日志。
     *
     * @param event - 事件名称
     * @param data - 事件数据
     * @param options - 可选配置：source 事件源 / scopeId 作用域ID
     */
    emit(event: string, data?: any, options?: { source?: any; scopeId?: string }): void {
        if (this.disposed) {
            this.logScope('warn', 'emit_after_dispose', { event: String(event) });
            return;
        }
        this.bus.emit(event, data, options?.source || this, options?.scopeId || this.scopeId);
    }

    /**
     * 订阅事件
     *
     * 将事件处理器添加到事件总线并将其取消函数注册到当前作用域中，
     * 当作用域被销毁时，这些事件处理器也会被自动取消订阅。
     *
     * @param event - 事件名称
     * @param handler - 事件处理器函数
     * @returns 返回一个取消订阅的函数
     */
    on(event: string, handler: EventHandler): () => void {
        if (this.disposed) {
            this.logScope('warn', 'subscribe_after_dispose', { event: String(event) });
            return () => {};
        }

        const off = this.bus.on(event, handler);
        this.disposers.push(off);
        return off;
    }

    /**
     * 一次性订阅事件
     *
     * 与 on 方法类似，但处理器只会在事件第一次被触发时调用，之后自动取消订阅。
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
     * 添加清理函数
     *
     * 将一个清理函数添加到作用域中，当作用域被销毁时，该函数会被调用。
     *
     * @param cleanup - 清理函数
     */
    addCleanup(cleanup: () => void): void {
        if (!this.disposed) this.disposers.push(cleanup);
    }

    /**
     * 销毁作用域
     *
     * 执行所有注册的清理函数，释放资源并标记作用域为已销毁状态。
     * 如果作用域已经被销毁，则记录调试日志。
     */
    dispose(): void {
        if (this.disposed) {
            this.logScope('debug', 'dispose_twice');
            return;
        }

        this.disposed = true;

        this.disposers.forEach(fn => {
            try {
                fn();
            } catch (err) {
                this.logScope('error', 'cleanup_error', { error: err });
            }
        });

        this.disposers.length = 0;
        this.logScope('info', 'disposed');
    }

    /**
     * 获取事件作用域的唯一标识符
     *
     * @returns 返回事件作用域的ID
     */
    getScopeId(): string {
        return this.scopeId;
    }
}
