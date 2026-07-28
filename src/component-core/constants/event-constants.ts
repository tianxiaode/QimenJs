/**
 * event-constants.ts — 事件引擎常量
 *
 * 定义事件委托系统中使用的 DOM 属性键和符号常量，
 * 用于在运行时标记 DOM 节点的事件元数据和组件边界。
 */

/**
 * 节点事件元数据 — 绑定在 DOM 元素上的事件信息
 *
 * 通过 Symbol 作为属性键挂载在 el 上，避免与用户自定义属性冲突。
 * 当事件触发时，从 event.target 向上遍历查找此标记。
 */
export const NODE_EVENT_META: unique symbol = Symbol('NODE_EVENT_META');

/**
 * 组件根标记 — 绑定在组件根元素上的边界标记
 *
 * 事件委托遍历时碰到此标记即停止，防止事件跨组件传播。
 * 确保事件匹配被限制在当前组件的 DOM 子树内。
 */
export const COMPONENT_ROOT: unique symbol = Symbol('COMPONENT_ROOT');

/**
 * 节点事件元数据结构 — 运行时存储在 el[NODE_EVENT_META] 上
 */
export interface NodeEventMeta {
    /** 节点名称 */
    nodeName: string;
    /** 事件类型集合 — 从 emits 字段提取的 DOM 事件类型 */
    eventTypes: Set<string>;
    /** 语义动作名 — 从 action 字段继承 */
    action?: string;
    /** 额外事件数据字段声明 — 从 data 字段继承 */
    data?: string[] | Record<string, string[]>;
}