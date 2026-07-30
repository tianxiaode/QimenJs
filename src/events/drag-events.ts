/**
 * 拖拽事件常量定义
 *
 * 定义 DragDispatchCenter 及其相关组件触发的所有事件，
 * 供 drag 包和 component 包统一引用，消除硬编码字符串。
 *
 * 事件分类：
 * - 请求动作：组件向调度中心发送的操作指令
 * - 状态转换：调度中心执行操作后通过 DragEventBus 广播
 */

// ============================================
// 请求动作（组件 → DragDispatchCenter）
// ============================================
export const DRAG_ACTIONS = {
    /** 初始化拖拽（组件实例+配置发送给调度中心） */
    INIT: 'init',
    /** 开始拖拽会话（绑定手势监听） */
    START: 'start',
    /** 停止拖拽会话（解绑手势监听） */
    STOP: 'stop',
    /** 销毁拖拽实例 */
    DISPOSE: 'dispose',
} as const;

// ============================================
// 拖拽状态转换（DragDispatchCenter → DragEventBus）
// ============================================
export const DRAG_PHASES = {
    /** 拖拽开始 */
    START: 'start',
    /** 拖拽移动（本地处理，不走总线） */
    MOVE: 'move',
    /** 拖拽结束 */
    END: 'end',
    /** 拖拽取消 */
    CANCEL: 'cancel',
} as const;
