/**
 * 命令式浮层事件常量
 *
 * Toast/Msgbox 通过 SystemEventBus 发送事件，
 * 事件编码：{prefix}:{id}:{action}，由 Manager 生成 eventKey。
 */

// ============================================
// Toast 事件前缀
// ============================================
export const TOAST_EVENT_PREFIX = 'toast' as const;

export const TOAST_ACTIONS = {
    CLOSE: 'close',
} as const;

export const TOAST_FEEDBACK_EVENTS = {
    CLOSED: 'closed',
} as const;

// ============================================
// Msgbox 事件前缀
// ============================================
export const MSGBOX_EVENT_PREFIX = 'msgbox' as const;

export const MSGBOX_ACTIONS = {
    CONFIRM: 'confirm',
    CANCEL: 'cancel',
} as const;

export const MSGBOX_FEEDBACK_EVENTS = {
    CLOSED: 'closed',
} as const;

// ============================================
// eventKey 编码工具
// ============================================
export function encodeEventKey(prefix: string, id: number, action: string): string {
    return `${prefix}:${id}:${action}`;
}
