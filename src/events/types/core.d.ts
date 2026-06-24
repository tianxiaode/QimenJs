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
export type ScopeLogAction = 'created' | 'disposed' | 'dispose_twice' | 'subscribe_after_dispose' | 'cleanup_error' | 'emit_after_dispose';
/**
 * 事件日志动作类型 - 定义事件可以记录的操作类型
 */
export type EventLogAction = 'emit' | 'handler_error';
/**
 * 标准事件上下文结构
 */
export interface IEventContext<T = any> {
    readonly source: any;
    readonly data: T;
    readonly event: string;
    readonly timestamp: number;
    readonly busId: string;
    readonly scopeId: string;
    [key: string]: any;
}
//# sourceMappingURL=core.d.ts.map