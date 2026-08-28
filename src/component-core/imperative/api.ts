/**
 * 命令式 API 工厂函数
 *
 * toast() 和 msgbox 的便捷调用入口。
 */

import { ToastManager } from './ToastManager';
import { MsgboxManager } from './MsgboxManager';
import { Component } from '@/component-core';
import { t } from '@/i18n/i18n-utils';
import type { ToastOptions, ToastHandle, MsgboxOptions, MsgboxResult, MsgboxType } from '../types';
import './msgbox.css';
import './toast.css';

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
): MsgboxOptions {
    if (typeof titleOrOptions === 'string') {
        return { title: titleOrOptions, content: content ?? '', msgboxType: type };
    }
    return { ...titleOrOptions, msgboxType: type };
}

export const msgbox = {
    alert(titleOrOptions: string | MsgboxOptions, content?: string): Promise<MsgboxResult> {
        const options = normalizeMsgboxArgs(titleOrOptions, content, 'alert');
        return MsgboxManager.getInstance().create(options);
    },

    confirm(titleOrOptions: string | MsgboxOptions, content?: string): Promise<MsgboxResult> {
        const options = normalizeMsgboxArgs(titleOrOptions, content, 'confirm');
        return MsgboxManager.getInstance().create(options);
    },

    prompt(titleOrOptions: string | MsgboxOptions, content?: string): Promise<MsgboxResult> {
        const options = normalizeMsgboxArgs(titleOrOptions, content, 'prompt');
        return MsgboxManager.getInstance().create(options);
    },
};

Component.setDefaultHandler((ctx: any, _domain: string) => {
    const code = ctx?.error?.code || ctx?.code;
    const message = code ? t(code, true) : ctx?.error?.message || ctx?.message || String(ctx);
    toast({ message, type: 'error' });
});
