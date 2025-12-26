import { EventBus } from './EventBus';
import { logScope } from './EventLog';
import { EventHandler, EventMap } from './types';

import { ILogger } from '@orbitjs/logger';
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
export class EventScope<Events extends EventMap> {
    private readonly scopeId = string.getId('scope');
    private readonly disposers: Array<() => void> = [];
    private disposed = false;

    constructor(
        private readonly bus: EventBus<Events>,
        private readonly busId: string,
        private readonly logger?: ILogger
    ) {
        logScope(this.logger, 'debug', 'created', this.busId, this.scopeId);
    }

    on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
        if (this.disposed) {
            logScope(this.logger, 'warn', 'subscribe_after_dispose', this.busId, this.scopeId, {
                event: String(event),
            });
            return () => {};
        }

        const off = this.bus.on(event, handler);
        this.disposers.push(off);
        return off;
    }

    once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
        const off = this.on(event, payload => {
            off();
            handler(payload);
        });
    }

    addCleanup(cleanup: () => void): void {
        if (!this.disposed) {
            this.disposers.push(cleanup);
        }
    }

    dispose(): void {
        if (this.disposed) {
            logScope(this.logger, 'debug', 'dispose_twice', this.busId, this.scopeId);
            return;
        }

        this.disposed = true;

        this.disposers.forEach(fn => {
            try {
                fn();
            } catch (err) {
                // 这里可以选择加一个 scope_error action
                logScope(this.logger, 'error', 'cleanup_error', this.busId, this.scopeId, {
                    error: err,
                });
            }
        });

        this.disposers.length = 0;

        logScope(this.logger, 'info', 'disposed', this.busId, this.scopeId);
    }
}
