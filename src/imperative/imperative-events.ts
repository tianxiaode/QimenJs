/**
 * 命令式浮层事件常量
 *
 * Toast/Msgbox 通过 OverlayEventBus 发送的事件，
 * 事件编码遵循 overlay:{overlayKey}:{action} 规范。
 *
 * 事件分类：
 * - 请求动作：Toast/Msgbox 实例发出的状态变更通知
 * - 反馈事件：操作完成后的确认通知
 */

// ============================================
// Toast 动作（Toast 实例 → OverlayEventBus）
// ============================================
export const TOAST_ACTIONS = {
    /** toast 关闭中（退出动画开始） */
    CLOSE: 'close',
} as const;

// ============================================
// Toast 反馈事件
// ============================================
export const TOAST_FEEDBACK_EVENTS = {
    /** toast 已关闭（退出动画完成，DOM 已移除） */
    CLOSED: 'closed',
} as const;

// ============================================
// Msgbox 动作（Msgbox 实例 → OverlayEventBus）
// ============================================
export const MSGBOX_ACTIONS = {
    /** 用户点击确认 */
    CONFIRM: 'confirm',
    /** 用户点击取消 */
    CANCEL: 'cancel',
} as const;

// ============================================
// Msgbox 反馈事件
// ============================================
export const MSGBOX_FEEDBACK_EVENTS = {
    /** msgbox 已关闭（退出动画完成，DOM 已移除） */
    CLOSED: 'closed',
} as const;
