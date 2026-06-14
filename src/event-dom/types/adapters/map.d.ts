/**
 * AtomicSignal - 原子信号类型
 *
 * 表示浏览器 DOM 能够发出的具体事件类型，包括指针、鼠标、触摸、键盘等各类事件
 * 这些是底层的、与设备相关的事件类型
 */
export type AtomicSignal = 'pointerdown' | 'pointerup' | 'pointermove' | 'pointercancel' | 'pointerenter' | 'pointerleave' | 'pointerover' | 'pointerout' | 'mousedown' | 'mouseup' | 'mousemove' | 'mouseenter' | 'mouseleave' | 'mouseover' | 'mouseout' | 'wheel' | 'touchstart' | 'touchend' | 'touchmove' | 'touchcancel' | 'keydown' | 'keyup' | 'keypress' | 'focus' | 'blur' | 'input' | 'change' | 'submit' | 'scroll';
/**
 * InputSignal - 输入信号类型
 *
 * 表示规范化后的"原子输入语义"，位于 DOM 事件之上，手势事件之下
 * 这些是语义化的、与设备无关的输入信号类型
 */
export type InputSignal = 'press' | 'release' | 'move' | 'cancel' | 'enter' | 'leave' | 'over' | 'out' | 'wheel' | 'keydown' | 'keyup' | 'input' | 'change' | 'submit' | 'focus' | 'blur' | 'scroll';
/**
 * InputEventBinding - 输入事件绑定接口
 *
 * 定义了如何将语义化的输入信号映射到具体的 DOM 事件
 * 每个输入信号可以绑定到不同类型的设备事件
 */
export interface InputEventBinding {
    pointer?: readonly AtomicSignal[];
    touch?: readonly AtomicSignal[];
    mouse?: readonly AtomicSignal[];
    keyboard?: readonly AtomicSignal[];
    other?: readonly AtomicSignal[];
}
/**
 * InputEventMap - 输入事件映射
 *
 * 将语义化的输入信号（InputSignal）映射到具体的 DOM 事件绑定（InputEventBinding）
 * 实现了从抽象的输入语义到具体 DOM 事件的映射关系
 */
export type InputEventMap = {
    [K in InputSignal]?: InputEventBinding;
};
/**
 * GestureSemantic - 手势语义类型
 *
 * 定义了高层的行为语义，不同于简单的输入信号组合
 * 每个手势都是有状态、有时序、有判定条件的复杂行为语义
 */
export type GestureSemantic = 'tap' | 'click' | 'dblclick' | 'longpress' | 'drag' | 'swipe' | 'hover' | 'contextmenu' | 'submit';
/**
 * GestureProcessorId - 手势处理器ID类型
 *
 * 定义了可用的手势处理器的唯一标识符
 * 每个手势都需要一个特定的处理器来解释和处理输入信号
 */
export type GestureProcessorId = 'tapProcessor' | 'doubleTapProcessor' | 'longPressProcessor' | 'panProcessor' | 'swipeProcessor' | 'hoverProcessor' | 'contextMenuProcessor' | 'enterKeyProcessor';
/**
 * GestureConstraintsMap - 手势约束映射
 *
 * 定义了各种手势的约束条件，用于判断手势是否成立
 * 不同的手势有不同的约束参数类型
 */
export interface GestureConstraintsMap {
    tap: {
        maxDuration?: number;
        maxDistance?: number;
    };
    click: {
        maxDuration?: number;
        maxDistance?: number;
    };
    dblclick: {
        maxDuration?: number;
        maxInterval?: number;
        maxDistance?: number;
    };
    longpress: {
        minDuration?: number;
        maxDistance?: number;
    };
    drag: {
        minDistance?: number;
    };
    swipe: {
        minDistance?: number;
        maxDuration?: number;
        minVelocity?: number;
    };
    hover: {
        delay?: number;
    };
    contextmenu: {
        buttons?: number[];
    };
    submit: {};
}
/**
 * GestureEventDescriptor - 手势事件描述符接口
 *
 * 定义了一个手势事件的完整描述，包括所需输入信号、处理器、约束条件和语义
 *
 * @template S - 手势语义类型，必须是 GestureSemantic 的子类型
 */
export interface GestureEventDescriptor<S extends GestureSemantic = GestureSemantic> {
    /** gesture 依赖哪些 InputSignal */
    requires: readonly InputSignal[];
    /** 用哪个 processor 解释 */
    processor: GestureProcessorId;
    /** 该 gesture 的语义约束 */
    constraints?: GestureConstraintsMap[S];
    /** 手势的语义标识 */
    semantic: S;
}
/**
 * GestureEventMap - 手势事件映射
 *
 * 将每个手势语义映射到其描述符，定义了所有可用的手势事件配置
 */
export type GestureEventMap = {
    [K in GestureSemantic]: GestureEventDescriptor<K>;
};
//# sourceMappingURL=map.d.ts.map