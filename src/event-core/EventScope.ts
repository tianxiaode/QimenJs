import { EventBus } from "./EventBus";
import { EventHandler, EventMap } from "./types";

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
    private disposers: Array<() => void> = [];
    private disposed = false;

    /**
     * 创建事件作用域实例
     * 
     * @param bus 事件总线实例
     */
    constructor(private bus: EventBus<Events>) {}

    /**
     * 订阅事件并将其绑定到当前作用域
     * 
     * 当作用域被销毁时，通过此方法订阅的事件会被自动取消
     * 
     * @param event 要订阅的事件名称
     * @param handler 事件处理器函数
     * @returns 返回一个取消订阅的函数，调用它可以立即取消事件订阅
     */
    on<K extends keyof Events>(
        event: K,
        handler: EventHandler<Events[K]>
    ): () => void {
        if (this.disposed) {
            return () => {};
        }

        const off = this.bus.on(event, handler);
        this.disposers.push(off);
        return off;
    }

    /**
     * 订阅只执行一次的事件并将其绑定到当前作用域
     * 
     * 当作用域被销毁时，通过此方法订阅的事件会被自动取消
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
     * 销毁当前作用域，取消所有绑定到此作用域的事件订阅
     * 
     * 一次性清理当前 scope 绑定的所有事件
     */
    dispose(): void {
        if (this.disposed) return;

        this.disposed = true;
        this.disposers.forEach((off) => off());
        this.disposers.length = 0;
    }
}