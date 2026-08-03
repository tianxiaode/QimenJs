/**
 * @qimenjs/imperative
 *
 * 命令式 API - toast 和 msgbox
 *
 * 事件通过 OverlayEventBus 发送，编码：overlay:{overlayKey}:{action}
 * 外部监听示例：
 *   overlayEventBus.overlayOn('myToast', 'close', (data) => { ... });
 *   overlayEventBus.overlayOn('myMsgbox', 'confirm', (data) => { ... });
 */

export { toast, msgbox } from './api';
export { ToastManager } from './ToastManager';
export { Toast } from './Toast';
export { MsgboxManager } from './MsgboxManager';
export { Msgbox } from './Msgbox';
export { MSGBOX_TEMPLATE } from './msgbox-tpl';
export { TOAST_TEMPLATE, TOAST_NOTIFICATION_TEMPLATE } from './toast-tpl';
export {
    TOAST_ACTIONS,
    TOAST_FEEDBACK_EVENTS,
    MSGBOX_ACTIONS,
    MSGBOX_FEEDBACK_EVENTS,
} from './imperative-events';
export type {
    ToastOptions,
    ToastHandle,
    ToastType,
    ToastPosition,
    MsgboxOptions,
    MsgboxResult,
    MsgboxType,
} from './types';
