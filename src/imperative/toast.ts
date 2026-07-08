/**
 * toast 命令式 API
 */

import { ToastManager } from './ToastManager';
import type { ToastOptions, ToastHandle } from './types';

/**
 * 显示 toast 消息提示
 *
 * @param messageOrOptions - 消息字符串或配置对象
 * @param duration - 持续时间 ms，覆盖 options 中的值
 * @returns ToastHandle — 支持 close() 和 await
 */
export function toast(
    messageOrOptions: string | ToastOptions,
    duration?: number,
): ToastHandle {
    const options: ToastOptions = typeof messageOrOptions === 'string'
        ? { message: messageOrOptions }
        : messageOrOptions;

    if (duration !== undefined) {
        options.duration = duration;
    }

    return ToastManager.getInstance().create(options);
}
