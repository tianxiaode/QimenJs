import { Logger } from '@orbitjs/logger';
import { EventBus } from './EventBus';
import { EventHandler, IEventScope } from '../../types';

/**
 * 全局事件总线 - 提供应用级别的单例事件总线
 *
 * GlobalEventBus 是一个全局可用的事件总线实例，用于跨组件或模块的事件通信。
 * 它封装了一个 EventBus 实例并暴露了其主要方法。
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
export class GlobalEventBus {
    private readonly bus: EventBus;
    private readonly rootScope: IEventScope;

    constructor() {
        this.bus = new EventBus(Logger.for('global-bus'));
        // 创建一个永不主动销毁的根作用域
        this.rootScope = this.bus.createScope();
    }

    /**
     * 订阅事件
     *
     * @param event 事件名称
     * @param handler 事件处理器
     * @returns 取消订阅的函数
     */
    on(event: string, handler: EventHandler) {
        return this.rootScope.on(event, handler);
    }

    /**
     * 一次性订阅事件
     *
     * @param event 事件名称
     * @param handler 事件处理器
     */
    once(event: string, handler: EventHandler) {
        this.rootScope.once(event, handler);
    }

    /**
     * 触发事件
     *
     * @param event 事件名称
     * @param payload 事件载荷
     */
    emit(event: string, data?: any) {
        return this.rootScope.emit(event, data, 'GLOBAL');
    }

    /**
     * 创建事件作用域
     *
     * 用于管理一组相关事件的生命周期
     *
     * @returns 返回一个EventScope实例
     */
    createEventScope(): IEventScope {
        return this.bus.createScope();
    }

    /**
     * 获取事件总线的唯一标识符
     *
     * @returns 返回事件总线的ID
     */
    getBusId() {
        return this.bus.getBusId();
    }
}

/**
 * 全局事件总线的单例实例
 *
 * 这是一个预创建的 GlobalEventBus 单例，可以直接导入使用。
 *
 * @example
 * ```ts
 * import { globalEventBus } from '@orbitjs/event';
 *
 * globalEventBus.on('my-event', handler);
 * globalEventBus.emit('my-event', payload);
 * ```
 */
export const globalEventBus = new GlobalEventBus();
