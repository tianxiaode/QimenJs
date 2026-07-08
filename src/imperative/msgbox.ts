/**
 * msgbox 命令式 API
 */

import { MsgboxManager } from './MsgboxManager';
import type { MsgboxOptions, MsgboxResult, MsgboxType } from './types';

/**
 * 参数归一化
 */
function normalizeMsgboxArgs(
    titleOrOptions: string | MsgboxOptions,
    content?: string,
    type: MsgboxType = 'alert',
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
    alert(
        titleOrOptions: string | MsgboxOptions,
        content?: string,
    ): Promise<MsgboxResult> {
        const options = normalizeMsgboxArgs(titleOrOptions, content, 'alert');
        return MsgboxManager.getInstance().create(options);
    },

    /**
     * confirm 模态消息框 — 含确认和取消按钮
     */
    confirm(
        titleOrOptions: string | MsgboxOptions,
        content?: string,
    ): Promise<MsgboxResult> {
        const options = normalizeMsgboxArgs(titleOrOptions, content, 'confirm');
        return MsgboxManager.getInstance().create(options);
    },

    /**
     * prompt 模态消息框 — 含输入框和确认/取消按钮
     */
    prompt(
        titleOrOptions: string | MsgboxOptions,
        content?: string,
    ): Promise<MsgboxResult> {
        const options = normalizeMsgboxArgs(titleOrOptions, content, 'prompt');
        return MsgboxManager.getInstance().create(options);
    },
};
