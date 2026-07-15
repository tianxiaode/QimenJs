/**
 * 事件核心类型定义
 *
 * @module events/types/core
 */

import type { EventContext } from '@/context';

/**
 * 事件处理器类型 - 定义处理事件的函数类型
 *
 * @template T 事件载荷的类型，默认为 any
 * @param context 事件触发时传递的上下文
 */
export type EventHandler<T = any> = (context: EventContext) => void | Promise<void>;

/**
 * 事件总线动作类型 - 定义事件总线可以记录的操作类型
 */
export type BusAction = 'on' | 'emit' | 'emit_no_listeners' | 'emit_no_scope' | 'clear' | 'handler_error' | 'off';

/**
 * 作用域日志动作类型 - 定义事件作用域可以记录的操作类型
 */
export type ScopeLogAction =
    | 'created' // 作用域已创建
    | 'disposed' // 作用域已销毁
    | 'dispose_twice' // 尝试重复销毁作用域
    | 'subscribe_after_dispose' // 在作用域销毁后尝试订阅事件
    | 'cleanup_error' // 清理函数执行时发生错误
    | 'emit_after_dispose' // 在作用域销毁后尝试触发事件
    | 'emit'; // 触发事件

/**
 * 事件日志动作类型 - 定义事件可以记录的操作类型
 */
export type EventLogAction = 'emit' | 'handler_error';

/**
 * @deprecated 使用 EventContext 代替
 *
 * IEventContext 已与 EventContext 融合，此类型仅为向后兼容保留。
 * 新代码请直接使用 EventContext。
 */
export type IEventContext<T = any> = EventContext;
