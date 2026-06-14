import { EventHandler, IEventContext } from "./core";
import { IEventScope } from "./scope";
/**
 * 事件总线接口 - 定义事件管理的基本操作规范
 *
 * @template Events 事件映射类型，定义了事件名称和载荷类型的对应关系
 */
export interface IEventBus<Events = any> {
    /**
     * 订阅事件
     *
     * @param event 事件名称
     * @param handler 事件处理器
     * @returns 返回取消订阅函数
     */
    on(event: string, handler: EventHandler): () => void;
    /**
     * 订阅单次事件
     *
     * @param event 事件名称
     * @param handler 事件处理器
     */
    once(event: string, handler: EventHandler): void;
    /**
     * 触发事件
     *
     * @param event 事件名称
     * @param context 事件上下文
     */
    emit(event: string, context: IEventContext): void;
    /**
     * 清理事件订阅
     *
     * @param event 可选参数，如果指定则只清理该事件的订阅，否则清理所有事件订阅
     */
    clear(event?: string): void;
    /**
     * 创建事件作用域
     *
     * 用于管理一组相关事件的生命周期
     *
     * @returns 返回一个EventScope实例
     */
    createScope(): IEventScope;
    /**
     * 获取事件总线的唯一标识符
     *
     * @returns 返回事件总线的ID
     */
    getBusId(): string;
}
//# sourceMappingURL=bus.d.ts.map