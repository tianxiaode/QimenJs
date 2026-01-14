import { EventBus } from './EventBus';
import { EventHandler, IEventContext, ScopeLogAction } from './types';

import { ILogger, LogLevel } from '@orbitjs/logger';
import { string } from '@orbitjs/utils';

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
export class EventScope {
    private readonly scopeId = string.getId('event-scope');
    private readonly disposers: Array<() => void> = [];
    private disposed = false;

    constructor(
        private readonly bus: EventBus,
        private readonly logger?: ILogger
    ) {
        this.logScope('debug', 'created');
    }

    // --- 内置日志方法 ---
    logScope(level: LogLevel, action: ScopeLogAction, data?: Record<string, any>) {
        if (!this.logger) return;
        this.logger[level](`[event.scope] ${action}`, {
            busId: this.bus.getBusId(),
            scopeId: this.scopeId,
            ...data,
        });
    }

    emit(event: string, data?: any, source?: any): void {
        if (this.disposed) {
            this.logScope('warn', 'emit_after_dispose', { event: String(event) });
            return;
        }
        const context: IEventContext<any> = {
            event,
            data,
            source: source || 'UNKNOWN', // 如果没传 source，至少标注为未知
            scopeId: this.scopeId, // 带上当前 Scope 的唯一标识
            busId: this.bus.getBusId(),
            timestamp: Date.now(),
        };
        this.bus.emit(event, context);
    }

    on(event: string, handler: EventHandler): () => void {
        if (this.disposed) {
            this.logScope('warn', 'subscribe_after_dispose', { event: String(event) });
            return () => {};
        }

        const off = this.bus.on(event, handler);
        this.disposers.push(off);
        return off;
    }

    once(event: string, handler: EventHandler): void {
        const off = this.on(event, payload => {
            off();
            handler(payload);
        });
    }

    addCleanup(cleanup: () => void): void {
        if (!this.disposed) this.disposers.push(cleanup);
    }

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

    getScopeId(): string {
        return this.scopeId;
    }
}
