import { EventHandler } from './core';

/**
 * 事件作用域接口 - 用于管理一组相关事件的生命周期
 *
 * @template Events 事件映射类型，定义了事件名称和载荷类型的对应关系
 */
export interface IEventScope<Events = any> {
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
     * @param data 事件数据
     * @param options 可选配置：source 事件源 / scopeId 作用域ID
     */
    emit(event: string, data?: any, options?: { source?: any; scopeId?: string }): void;

    /**
     * 添加清理函数
     *
     * @param cleanup 清理函数，在作用域销毁时会被调用
     */
    addCleanup(cleanup: () => void): void;

    /**
     * 销毁作用域
     *
     * 取消所有绑定到此作用域的事件订阅并执行清理函数
     */
    dispose(): void;

    /**
     * 获取作用域的唯一标识符
     *
     * @returns 返回作用域的ID
     */
    getScopeId(): string;
}
