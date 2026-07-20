/**
 * 浮层事件常量定义
 *
 * 定义 OverlayDispatchCenter 及其相关组件触发的所有事件，
 * 供 overlay 包和 component 包统一引用，消除硬编码字符串。
 *
 * 事件分类：
 * - 请求动作：组件向调度中心发送的操作指令
 * - 反馈事件：调度中心执行操作后向组件发送的通知
 */

// ============================================
// 请求动作（组件 → OverlayDispatchCenter）
// ============================================
export const OVERLAY_ACTIONS = {
    /** 初始化浮层（组件实例+配置发送给调度中心） */
    INIT: 'init',
    /** 显示浮层 */
    SHOW: 'show',
    /** 隐藏浮层 */
    HIDE: 'hide',
    /** 切换浮层显示/隐藏 */
    TOGGLE: 'toggle',
    /** 重新定位浮层 */
    REPOSITION: 'reposition',
    /** 变更浮层数据 */
    CHANGE: 'change',
    /** 销毁浮层实例 */
    DISPOSE: 'dispose',
} as const;

// ============================================
// 反馈事件（OverlayDispatchCenter → 组件）
// ============================================
export const OVERLAY_FEEDBACK_EVENTS = {
    /** 浮层已显示 */
    SHOWN: 'shown',
    /** 浮层已隐藏 */
    HIDDEN: 'hidden',
    /** 浮层数据已变更 */
    CHANGED: 'changed',
} as const;
