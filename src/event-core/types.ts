/**
 * 事件映射类型 - 定义事件名称和事件载荷类型的映射关系
 *
 * @example
 * ```ts
 * interface MyEvents {
 *   'user:login': { userId: string; username: string };
 *   'user:logout': void;
 * }
 * ```
 */
export type EventMap = Record<string, any>;

/**
 * 事件处理器类型 - 定义处理事件的函数类型
 *
 * @template T 事件载荷的类型，默认为 any
 * @param payload 事件触发时传递的载荷数据
 */
export type EventHandler<T = any> = (payload: T) => void;

export type BusAction = 'emit' | 'emit_no_listeners' | 'clear' | 'handler_error' | 'off'; 

export type ScopeLogAction = 'created' | 'disposed' | 'dispose_twice' | 'subscribe_after_dispose' | 'cleanup_error' | 'emit_after_dispose';

export type EventLogAction = 'emit' | 'handler_error';
