/**
 * 事件处理器类型 - 定义处理事件的函数类型
 *
 * @template T 事件载荷的类型，默认为 any
 * @param context 事件触发时传递的载荷数据
 */
export type EventHandler<T = any> = (context: IEventContext<T>) => void;

/**
 * 事件总线动作类型 - 定义事件总线可以记录的操作类型
 */
export type BusAction = 'emit' | 'emit_no_listeners' | 'clear' | 'handler_error' | 'off';

/**
 * 作用域日志动作类型 - 定义事件作用域可以记录的操作类型
 */
export type ScopeLogAction =
    | 'created' // 作用域已创建
    | 'disposed' // 作用域已销毁
    | 'dispose_twice' // 尝试重复销毁作用域
    | 'subscribe_after_dispose' // 在作用域销毁后尝试订阅事件
    | 'cleanup_error' // 清理函数执行时发生错误
    | 'emit_after_dispose'; // 在作用域销毁后尝试触发事件

/**
 * 事件日志动作类型 - 定义事件可以记录的操作类型
 */
export type EventLogAction = 'emit' | 'handler_error';

/**
 * 标准事件上下文结构
 */
export interface IEventContext<T = any> {
    readonly source: any; // 谁触发的 (Host/EntityManager)
    readonly data: T; // 业务数据
    readonly event: string; // 事件名 (冗余一份方便处理)
    readonly timestamp: number; // 发生时间
    readonly busId: string; // 哪个总线发出来的
    readonly scopeId: string; // 哪个作用域发出来的
    [key: string]: any; // 允许扩展其他元数据 (如 traceId)
}
