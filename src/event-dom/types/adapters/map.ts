/* ============================================
 * 1️⃣ AtomicSignal：真实 DOM 能发出的事件
 * ============================================ */

/**
 * AtomicSignal - 原子信号类型
 *
 * 表示浏览器 DOM 能够发出的具体事件类型，包括指针、鼠标、触摸、键盘等各类事件
 * 这些是底层的、与设备相关的事件类型
 */
export type AtomicSignal =
    // Pointer (首选)
    | 'pointerdown' // 指针按下
    | 'pointerup' // 指针释放
    | 'pointermove' // 指针移动
    | 'pointercancel' // 指针取消
    | 'pointerenter' // 指针进入元素
    | 'pointerleave' // 指针离开元素
    | 'pointerover' // 指针悬停（冒泡）
    | 'pointerout' // 指针移出（冒泡）

    // Mouse（fallback）
    | 'mousedown' // 鼠标按下
    | 'mouseup' // 鼠标释放
    | 'mousemove' // 鼠标移动
    | 'mouseenter' // 鼠标进入元素
    | 'mouseleave' // 鼠标离开元素
    | 'mouseover' // 鼠标悬停（冒泡）
    | 'mouseout' // 鼠标移出（冒泡）
    | 'wheel' // 鼠标滚轮

    // Touch（fallback）
    | 'touchstart' // 触摸开始
    | 'touchend' // 触摸结束
    | 'touchmove' // 触摸移动
    | 'touchcancel' // 触摸取消

    // Keyboard
    | 'keydown' // 按键按下
    | 'keyup' // 按键释放
    | 'keypress' // 按键（已弃用）

    // Form / Focus
    | 'focus' // 获得焦点
    | 'blur' // 失去焦点
    | 'input' // 输入事件
    | 'change' // 变更事件
    | 'submit' // 提交事件
    | 'scroll'; // 滚动事件

/* ============================================
 * 2️⃣ InputSignal：规范化后的"原子输入语义"
 * （DOM 之上，gesture 之下）
 * InputSignal 不是"抽象得越少越好"，
 *   而是"不要跨输入设备抽象"。
 * ============================================ */

/**
 * InputSignal - 输入信号类型
 *
 * 表示规范化后的"原子输入语义"，位于 DOM 事件之上，手势事件之下
 * 这些是语义化的、与设备无关的输入信号类型
 */
export type InputSignal =
    // pointer / touch / mouse
    | 'press' // 按下（鼠标按下、触摸开始、指针按下）
    | 'release' // 释放（鼠标释放、触摸结束、指针释放）
    | 'move' // 移动（鼠标移动、触摸移动、指针移动）
    | 'cancel' // 取消（触摸取消、指针取消）
    | 'enter' // 进入（鼠标进入、指针进入）
    | 'leave' // 离开（鼠标离开、指针离开）
    | 'over' // 悬停（鼠标悬停、指针悬停，冒泡）
    | 'out' // 移出（鼠标移出、指针移出，冒泡）
    | 'wheel' // 滚轮

    // keyboard（独立）
    | 'keydown' // 按键按下
    | 'keyup' // 按键释放

    // form / focus
    | 'input' // 输入
    | 'change' // 变更
    | 'submit' // 提交
    | 'focus' // 获得焦点
    | 'blur' // 失去焦点

    // view
    | 'scroll'; // 滚动

/* ============================================
 * 3️⃣ InputEventBinding & InputEventMap
 * InputSignal → DOM AtomicSignal
 * ============================================ */

/**
 * InputEventBinding - 输入事件绑定接口
 *
 * 定义了如何将语义化的输入信号映射到具体的 DOM 事件
 * 每个输入信号可以绑定到不同类型的设备事件
 */
export interface InputEventBinding {
    pointer?: readonly AtomicSignal[]; // 指针设备对应的 DOM 事件
    touch?: readonly AtomicSignal[]; // 触摸设备对应的 DOM 事件
    mouse?: readonly AtomicSignal[]; // 鼠标设备对应的 DOM 事件
    keyboard?: readonly AtomicSignal[]; // 键盘设备对应的 DOM 事件
    other?: readonly AtomicSignal[]; // 其他类型设备对应的 DOM 事件
}

/**
 * InputEventMap - 输入事件映射
 *
 * 将语义化的输入信号（InputSignal）映射到具体的 DOM 事件绑定（InputEventBinding）
 * 实现了从抽象的输入语义到具体 DOM 事件的映射关系
 */
export type InputEventMap = {
    [K in InputSignal]?: InputEventBinding; // 每个输入信号可选地绑定到事件
};

/* ============================================
 * 4️⃣ GestureSemantic：高层行为语义
 * Gesture ≠ InputSignal 的简单组合
 *  Gesture = 有状态、有时序、有判定条件的行为语义
 * ============================================ */

/**
 * GestureSemantic - 手势语义类型
 *
 * 定义了高层的行为语义，不同于简单的输入信号组合
 * 每个手势都是有状态、有时序、有判定条件的复杂行为语义
 */
export type GestureSemantic =
    // pointer-based gestures - 基于指针的手势
    | 'tap' // 轻触
    | 'click' // 点击
    | 'dblclick' // 双击
    | 'longpress' // 长按
    | 'drag' // 拖拽
    | 'swipe' // 滑动
    | 'hover' // 悬停

    // context / system - 上下文/系统级
    | 'contextmenu' // 右键菜单
    | 'submit'; // 提交

/* ============================================
 * 5️⃣ GestureProcessorId & GestureConstraintsMap
 * ============================================ */

/**
 * GestureProcessorId - 手势处理器ID类型
 *
 * 定义了可用的手势处理器的唯一标识符
 * 每个手势都需要一个特定的处理器来解释和处理输入信号
 */
export type GestureProcessorId =
    | 'tapProcessor' // 点击处理器
    | 'doubleTapProcessor' // 双击处理器
    | 'longPressProcessor' // 长按处理器
    | 'panProcessor' // 拖拽处理器
    | 'swipeProcessor' // 滑动处理器
    | 'hoverProcessor' // 悬停处理器
    | 'contextMenuProcessor' // 右键菜单处理器
    | 'enterKeyProcessor'; // 回车键处理器

/**
 * GestureConstraintsMap - 手势约束映射
 *
 * 定义了各种手势的约束条件，用于判断手势是否成立
 * 不同的手势有不同的约束参数类型
 */
export interface GestureConstraintsMap {
    tap: {
        // 轻触手势约束
        maxDuration?: number; // 最大持续时间（毫秒）
        maxDistance?: number; // 最大移动距离（像素）
    };

    click: {
        // 点击手势约束
        maxDuration?: number; // 最大持续时间（毫秒）
        maxDistance?: number; // 最大移动距离（像素）
    };

    dblclick: {
        // 双击手势约束
        maxDuration?: number; // 最大持续时间（毫秒）
        maxInterval?: number; // 两次点击最大间隔时间（毫秒）
        maxDistance?: number; // 最大移动距离（像素）
    };

    longpress: {
        // 长按手势约束
        minDuration?: number; // 最小持续时间（毫秒）
        maxDistance?: number; // 最大移动距离（像素）
    };

    drag: {
        // 拖拽手势约束
        minDistance?: number; // 最小移动距离（像素）
    };

    swipe: {
        // 滑动手势约束
        minDistance?: number; // 最小移动距离（像素）
        maxDuration?: number; // 最大持续时间（毫秒）
        minVelocity?: number; // 最小速度（像素/毫秒）
    };

    hover: {
        // 悬停手势约束
        delay?: number; // 延迟时间（毫秒）
    };

    contextmenu: {
        // 右键菜单手势约束
        buttons?: number[]; // 按钮数组（例如 [2] 表示右键）
    };

    submit: {}; // 提交手势约束（无特殊约束）
}

/* ============================================
 * 6️⃣ GestureEventDescriptor & GestureEventMap
 * ============================================ */

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
