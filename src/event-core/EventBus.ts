import { EventHandler, EventMap } from './types';
import { EventScope } from './EventScope';
import { ILogger } from '@orbitjs/logger';
import { string } from '@orbitjs/utils';
import { logBus, logEvent } from './EventLog';

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
export class EventBus<Events extends EventMap> {
    private readonly busId = string.getId('event-bus');
    private readonly listeners = new Map<keyof Events, Set<EventHandler>>();
    private readonly logger?: ILogger;

    constructor(logger?: ILogger) {
        this.logger = logger;
    }

    on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
        let set = this.listeners.get(event);
        if (!set) {
            set = new Set();
            this.listeners.set(event, set);
        }
        set.add(handler);

        return () => {
            set?.delete(handler);
            if (set?.size === 0) {
                this.listeners.delete(event);
            }
        };
    }

    off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
        const set = this.listeners.get(event);

        if (!set || !set.has(handler)) {
            // 可选：低级别日志，帮助排查误用
            logBus(this.logger, 'debug', 'off', this.busId, {
                event: String(event),
                found: false,
            });
            return;
        }

        set.delete(handler);

        if (set.size === 0) {
            this.listeners.delete(event);
        }

        logBus(this.logger, 'debug', 'off', this.busId, {
            event: String(event),
            found: true,
        });
    }

    once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
        const off = this.on(event, payload => {
            off();
            handler(payload);
        });
    }

    emit<K extends keyof Events>(event: K, payload: Events[K]): void {
        const handlers = this.listeners.get(event);

        if (!handlers || handlers.size === 0) {
            logBus(this.logger, 'debug', 'emit_no_listeners', this.busId, { event: String(event) });
            return;
        }

        logEvent(this.logger, 'debug', 'emit', this.busId, String(event), {
            handlerCount: handlers.size,
        });

        handlers.forEach(handler => {
            try {
                handler(payload);
            } catch (err) {
                logEvent(this.logger, 'error', 'handler_error', this.busId, String(event), {
                    error: err,
                });
            }
        });
    }

    clear(event?: keyof Events): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }

        logBus(this.logger, 'warn', 'clear', this.busId, { event: event ? String(event) : 'all' });
    }

    createScope(): EventScope<Events> {
        return new EventScope(this, this.busId, this.logger);
    }
}
