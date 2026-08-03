/**
 * 命令式 API 工厂函数
 *
 * toast() 和 msgbox 的便捷调用入口。
 */

import { ToastManager } from './ToastManager';
import { MsgboxManager } from './MsgboxManager';
import type { ToastOptions, ToastHandle, MsgboxOptions, MsgboxResult, MsgboxType } from './types';

/**
 * 显示 toast 消息提示
 *
 * @param messageOrOptions - 消息字符串或配置对象
 * @param duration - 持续时间 ms，覆盖 options 中的值
 * @returns ToastHandle — 支持 close() 和 await
 */
export function toast(messageOrOptions: string | ToastOptions, duration?: number): ToastHandle {
    const options: ToastOptions =
        typeof messageOrOptions === 'string' ? { message: messageOrOptions } : messageOrOptions;

    if (duration !== undefined) {
        options.duration = duration;
    }

    return ToastManager.getInstance().create(options);
}

// ─── msgbox ────────────────────────────────────────────────

/**
 * 参数归一化
 */
function normalizeMsgboxArgs(
    titleOrOptions: string | MsgboxOptions,
    content?: string,
    type: MsgboxType = 'alert'
): MsgboxOptions & { type: MsgboxType } {
    if (typeof titleOrOptions === 'string') {
        return { title: titleOrOptions, content: content ?? '', type };
    }
    return { ...titleOrOptions, type };
}

export const msgbox = {
    /**
     * alert 模态消息框 — 仅含确认按钮
     */
    alert(titleOrOptions: string | MsgboxOptions, content?: string): Promise<MsgboxResult> {
        const options = normalizeMsgboxArgs(titleOrOptions, content, 'alert');
        return MsgboxManager.getInstance().create(options);
    },

    /**
     * confirm 模态消息框 — 含确认和取消按钮
     */
    confirm(titleOrOptions: string | MsgboxOptions, content?: string): Promise<MsgboxResult> {
        const options = normalizeMsgboxArgs(titleOrOptions, content, 'confirm');
        return MsgboxManager.getInstance().create(options);
    },

    /**
     * prompt 模态消息框 — 含输入框和确认/取消按钮
     */
    prompt(titleOrOptions: string | MsgboxOptions, content?: string): Promise<MsgboxResult> {
        const options = normalizeMsgboxArgs(titleOrOptions, content, 'prompt');
        return MsgboxManager.getInstance().create(options);
    },
};
