import { EventHandler, EventMap } from "./types";
import { EventScope } from "./EventScope";

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
export class EventBus<Events extends EventMap = EventMap> {
    private listeners = new Map<keyof Events, Set<EventHandler>>();

    /**
     * 订阅事件
     * 
     * @param event 要订阅的事件名称
     * @param handler 事件处理器函数
     * @returns 返回一个取消订阅的函数，调用它可以取消事件订阅
     */
    on<K extends keyof Events>(
        event: K,
        handler: EventHandler<Events[K]>
    ): () => void {
        let set = this.listeners.get(event);
        if (!set) {
            set = new Set();
            this.listeners.set(event, set);
        }
        set.add(handler);

        // 返回取消订阅函数
        return () => {
            set?.delete(handler);
            if (set?.size === 0) {
                this.listeners.delete(event);
            }
        };
    }

    /**
     * 订阅只执行一次的事件
     * 
     * @param event 要订阅的事件名称
     * @param handler 事件处理器函数，执行后会自动取消订阅
     */
    once<K extends keyof Events>(
        event: K,
        handler: EventHandler<Events[K]>
    ): void {
        const off = this.on(event, (payload) => {
            off();
            handler(payload);
        });
    }

    /**
     * 取消订阅特定事件的处理器
     * 
     * @param event 要取消订阅的事件名称
     * @param handler 要取消的事件处理器
     */
    off<K extends keyof Events>(
        event: K,
        handler: EventHandler<Events[K]>
    ): void {
        this.listeners.get(event)?.delete(handler);
    }

    /**
     * 发布事件
     * 
     * @param event 要发布的事件名称
     * @param payload 事件载荷数据
     */
    emit<K extends keyof Events>(
        event: K,
        payload: Events[K]
    ): void {
        this.listeners.get(event)?.forEach((handler) => {
            try {
                handler(payload);
            } catch (err) {
                console.error(`[EventBus] "${String(event)}" handler error`, err);
            }
        });
    }

    /**
     * 清理事件订阅
     * 
     * @param event 可选参数，如果指定则只清理该事件的订阅，否则清理所有事件订阅
     */
    clear(event?: keyof Events): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /** 
     * 创建生命周期作用域
     * 
     * @returns 返回一个EventScope实例，可以用于管理一组相关事件的生命周期
     */
    createScope(): EventScope<Events> {
        return new EventScope(this);
    }
}