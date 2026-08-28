/**
 * 命令式 API 类型定义
 */

import { ComponentCoreOptions } from './component';

/** toast 类型 */
export type ToastType = 'info' | 'success' | 'warning' | 'error';

/** toast 显示位置 */
export type ToastPosition =
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top'
    | 'bottom';

/** toast 配置选项 */
export interface ToastOptions extends ComponentCoreOptions {
    /** 消息内容，必填 */
    message: string;
    /** 标题，可选。提供时使用 ToastNotification 增强模板 */
    title?: string;
    /** toast 类型，默认 'info' */
    toastType?: ToastType;
    /** 持续时间 ms，默认 3000，设为 0 则不自动关闭 */
    duration?: number;
    /** 显示位置，默认 'top-right' */
    position?: ToastPosition;
}

/**
 * toast 句柄 — 同时是 Thenable 对象
 *
 * 用法：
 * - h.close() 手动关闭
 * - await h 等待关闭
 */
export interface ToastHandle {
    /** 手动关闭 toast */
    close(): void;
    /** 是否已关闭 */
    readonly isClosed: boolean;
    /** Promise then — 支持 await */
    then<TResult1 = void, TResult2 = never>(
        onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2>;
}

/** msgbox 类型 */
export type MsgboxType = 'alert' | 'confirm' | 'prompt';

/** msgbox 配置选项 */
export interface MsgboxOptions extends ComponentCoreOptions {
    msgboxType?: MsgboxType;
    /** 标题，必填 */
    title?: string;
    /** 内容文本，可选 */
    content?: string;
}

/** msgbox 返回结果 */
export interface MsgboxResult {
    /** 用户操作 */
    action: 'confirm' | 'cancel';
    /** prompt 模式的输入值，非 prompt 模式为 '' */
    value: string;
}
