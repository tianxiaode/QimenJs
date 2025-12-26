// /event-dom/helpers/types.ts

/**
 * 语义输入事件类型（平台无关）
 *
 * 组件层只能使用这些类型
 */
export type InputType =
  | 'press'        // 点击 / 轻触 / 回车
  | 'longPress'    // 长按
  | 'hover'        // 悬停
  | 'focus'
  | 'blur'
  | 'outside';     // 点击 / 触摸外部


/**
 * DOM 事件类型别名
 *
 * 只在 helpers 内部使用
 */
export type DomEventType = keyof HTMLElementEventMap;


/**
 * 一个语义输入在某个平台下
 * 可能对应多个 DOM 事件
 */
export type DomEventBinding = {
  type: DomEventType;
  options?: AddEventListenerOptions;
};


/**
 * 平台输入映射表
 *
 * 不同平台可以有不同实现
 */
export type InputDomEventMap = {
  [K in InputType]: DomEventBinding[];
};


/**
 * bind 系列辅助函数的通用签名
 *
 * - 只执行副作用
 * - 不进入 EventBus
 */
export type BindInputHandler<E = Event> = (event: E) => void;


/**
 * bridge 系列辅助函数的通用约束
 *
 * Events：组件语义事件表
 */
export type BridgeEvents = Record<string, any>;


/**
 * 辅助类型：从 InputType 推导 DOM Event 类型
 * （用于更精细的 typing，可选）
 */
export type InputEventPayloadMap = {
  press: MouseEvent | TouchEvent | KeyboardEvent;
  longPress: TouchEvent | MouseEvent;
  hover: MouseEvent;
  focus: FocusEvent;
  blur: FocusEvent;
  outside: MouseEvent | TouchEvent;
};
