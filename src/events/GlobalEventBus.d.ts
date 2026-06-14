import { EventHandler, IEventScope } from './types';
/**
 * 全局事件总线 - 提供应用级别的单例事件总线
 *
 * GlobalEventBus 是一个全局可用的事件总线实例，用于跨组件或模块的事件通信。
 * 它封装了一个 EventBus 实例并暴露了其主要方法，确保在整个应用程序中只有一个事件总线实例。
 *
 * GlobalEventBus 使用一个永远不会被主动销毁的根作用域来管理所有全局事件订阅，
 * 从而确保全局事件监听器的生命周期与应用程序的生命周期一致。
 *
 * @example
 * ```ts
 * // 订阅事件
 * const unsubscribe = globalEventBus.on('user:login', (payload) => {
 *   console.log('用户登录:', payload.userId);
 * });
 *
 * // 发布事件
 * globalEventBus.emit('user:login', { userId: '123' });
 *
 * // 使用事件作用域
 * const scope = globalEventBus.createEventScope();
 * scope.on('temp-event', handler);
 * scope.dispose(); // 批量清理所有绑定到此作用域的事件
 * ```
 */
export declare class GlobalEventBus {
    private readonly bus;
    private readonly rootScope;
    /**
     * 构造函数
     *
     * 创建一个新的全局事件总线实例，内部创建一个带有日志记录器的 EventBus，
     * 并初始化一个永不销毁的根作用域。
     */
    constructor();
    /**
     * 订阅事件
     *
     * 通过根作用域订阅一个全局事件，返回一个可以取消订阅的函数。
     *
     * @param event 事件名称
     * @param handler 事件处理器函数
     * @returns 返回取消订阅的函数
     */
    on(event: string, handler: EventHandler): () => void;
    /**
     * 一次性订阅事件
     *
     * 订阅一个只触发一次的全局事件，事件触发后会自动取消订阅。
     *
     * @param event 事件名称
     * @param handler 事件处理器函数
     */
    once(event: string, handler: EventHandler): void;
    /**
     * 触发事件
     *
     * 在全局范围内触发一个事件，将事件传播给所有订阅者。
     *
     * @param event 事件名称
     * @param data 事件数据载荷
     */
    emit(event: string, data?: any): void;
    /**
     * 创建事件作用域
     *
     * 创建一个新的事件作用域，用于管理一组相关事件的生命周期。
     * 这些作用域中的事件订阅会在作用域被销毁时自动取消。
     *
     * @returns 返回一个EventScope实例
     */
    createEventScope(): IEventScope;
    /**
     * 获取事件总线的唯一标识符
     *
     * @returns 返回事件总线的ID
     */
    getBusId(): string;
    /**
     * 清理事件订阅
     *
     * @param event 可选参数，如果指定则只清理该事件的订阅，否则清理所有事件订阅
     */
    clear(event?: string): void;
}
/**
 * 全局事件总线的单例实例
 *
 * 这是一个预创建的 GlobalEventBus 单例，可以直接导入使用。
 * 该实例在整个应用程序生命周期内保持单一实例。
 *
 * @example
 * ```ts
 * import { globalEventBus } from '@orbitjs/event';
 *
 * globalEventBus.on('my-event', handler);
 * globalEventBus.emit('my-event', payload);
 * ```
 */
export declare const globalEventBus: GlobalEventBus;
//# sourceMappingURL=GlobalEventBus.d.ts.map