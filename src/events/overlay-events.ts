/**
 * 浮层事件常量定义
 *
 * 已弃用：OverlayDispatchCenter 已移除，浮层组件直接管理生命周期。
 * 这些常量保留供向后兼容，但不再使用。
 *
 * @deprecated 浮层组件直接管理生命周期，不再通过事件总线调度
 */

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

export const OVERLAY_FEEDBACK_EVENTS = {
    /** 浮层已显示 */
    SHOWN: 'shown',
    /** 浮层已隐藏 */
    HIDDEN: 'hidden',
    /** 浮层数据已变更 */
    CHANGED: 'changed',
} as const;
