import { EventBus } from "./EventBus";
import { Logger } from "@orbitjs/logger";
/** 
 * 🔧 在这里定义全局事件表
 * 
 * 定义应用中使用的事件类型，包括事件名称和对应的载荷类型
 * 
 * @example
 * ```ts
 * export type AppEvents = {
 *   'user:login': { userId: string; username: string };
 *   'user:logout': void;
 *   'error': Error;
 * };
 * ```
 */
export type AppEvents = {
    login: { userId: string };
    logout: void;
    error: Error;
};

// 创建全局事件总线实例
const bus = new EventBus<AppEvents>(
  Logger.for('event.bus')
);

/** 
 * 函数风格 API（业务层只用这些）
 * 
 * 订阅事件，当事件被触发时执行处理器函数
 * 
 * @template K 事件名称类型
 * @param event 要订阅的事件名称
 * @param handler 事件处理器函数
 * @returns 返回一个取消订阅的函数
 */
export const on = bus.on.bind(bus);

/** 
 * 订阅只执行一次的事件
 * 
 * @template K 事件名称类型
 * @param event 要订阅的事件名称
 * @param handler 事件处理器函数，执行后会自动取消订阅
 */
export const once = bus.once.bind(bus);

/** 
 * 取消订阅特定事件的处理器
 * 
 * @template K 事件名称类型
 * @param event 要取消订阅的事件名称
 * @param handler 要取消的事件处理器
 */
export const off = bus.off.bind(bus);

/** 
 * 发布事件
 * 
 * @template K 事件名称类型
 * @param event 要发布的事件名称
 * @param payload 事件载荷数据
 */
export const emit = bus.emit.bind(bus);

/** 
 * 清理事件订阅
 * 
 * @param event 可选参数，如果指定则只清理该事件的订阅，否则清理所有事件订阅
 */
export const clear = bus.clear.bind(bus);

/** 
 * 创建事件作用域
 * 
 * 用于管理一组相关事件的生命周期
 * 
 * @returns 返回一个EventScope实例
 */
export const createEventScope = bus.createScope.bind(bus);

/** 
 * 高级用法导出
 * 
 * 导出EventBus类，供需要创建独立事件总线实例的场景使用
 */
export { EventBus };