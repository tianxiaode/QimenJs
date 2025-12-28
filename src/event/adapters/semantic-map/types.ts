/* ============================================
 * 1️⃣ AtomicSignal：真实 DOM 能发出的事件
 * ============================================ */

export type AtomicSignal =
    // Pointer (首选)
    | 'pointerdown'
    | 'pointerup'
    | 'pointermove'
    | 'pointercancel'
    | 'pointerenter'
    | 'pointerleave'
    | 'pointerover'
    | 'pointerout'

    // Mouse（fallback）
    | 'mousedown'
    | 'mouseup'
    | 'mousemove'
    | 'mouseenter'
    | 'mouseleave'
    | 'mouseover'
    | 'mouseout'
    | 'wheel'

    // Touch（fallback）
    | 'touchstart'
    | 'touchend'
    | 'touchmove'
    | 'touchcancel'

    // Keyboard
    | 'keydown'
    | 'keyup'
    | 'keypress'

    // Form / Focus
    | 'focus'
    | 'blur'
    | 'input'
    | 'change'
    | 'submit'
    | 'scroll';

/* ============================================
 * 2️⃣ InputSignal：规范化后的“原子输入语义”
 * （DOM 之上，gesture 之下）
 * InputSignal 不是“抽象得越少越好”，
 *   而是“不要跨输入设备抽象”。
 * ============================================ */

export type InputSignal =
    // pointer / touch / mouse
    | 'press'
    | 'release'
    | 'move'
    | 'cancel'
    | 'enter'
    | 'leave'
    | 'over'
    | 'out'
    | 'wheel'

    // keyboard（独立）
    | 'keydown'
    | 'keyup'

    // form / focus
    | 'input'
    | 'change'
    | 'submit'
    | 'focus'
    | 'blur'

    // view
    | 'scroll';

/* ============================================
 * 4️⃣ InputEventMap
 * InputSignal → DOM AtomicSignal
 * ============================================ */

export type InputEventMap = {
    [K in InputSignal]?: {
        domEvents: readonly AtomicSignal[];
    };
};

/* ============================================
 * GestureSemantic：高层行为语义
 * Gesture ≠ InputSignal 的简单组合
 *  Gesture = 有状态、有时序、有判定条件的行为语义
 * ============================================ */

export type GestureSemantic =
    // pointer-based gestures
    | 'tap'
    | 'click'
    | 'dblclick'
    | 'longpress'
    | 'drag'
    | 'swipe'
    | 'hover'

    // context / system
    | 'contextmenu'
    | 'submit';

/* ============================================
 * GestureProcessorId
 * ============================================ */

export type GestureProcessorId =
    | 'tapProcessor'
    | 'doubleTapProcessor'
    | 'longPressProcessor'
    | 'panProcessor'
    | 'swipeProcessor'
    | 'hoverProcessor'
    | 'contextMenuProcessor'
    | 'enterKeyProcessor';

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

/* ============================================
 * GestureEventDescriptor
 * ============================================ */

export interface GestureEventDescriptor<S extends GestureSemantic = GestureSemantic> {
    /** gesture 依赖哪些 InputSignal */
    requires: readonly InputSignal[];

    /** 用哪个 processor 解释 */
    processor: GestureProcessorId;

    /** 该 gesture 的语义约束 */
    constraints?: GestureConstraintsMap[S];
}

export type GestureEventMap = {
    [K in GestureSemantic]: GestureEventDescriptor<K>;
};
