/**
 * i18n 工具函数
 *
 * 提供 i18n 单例获取和值解析能力，供所有包使用。
 * 包括 ContentAbility、toast/msgbox、entity 等。
 */

import type { II18nManager } from './types';

/**
 * i18n 前缀标记
 *
 * 值以 'i18n:' 开头时表示需要本地化翻译，如 'i18n:btn.save'
 */
export const I18N_PREFIX = 'i18n:';

/**
 * 从 window 获取 i18n 单例
 *
 * i18n 由应用启动时通过 <script> 加载 i18n.iife.js 初始化，
 * 挂载到 window.__qimen_i18n__ 上。
 * 不使用 import 避免包依赖耦合。
 * 类型声明见 @qimenjs/i18n/global.d.ts
 */
export function getI18nManager(): II18nManager | null {
    if (typeof window !== 'undefined' && window.__qimen_i18n__) {
        return window.__qimen_i18n__;
    }
    return null;
}

/**
 * 解析 i18n 值
 *
 * 如果值以 'i18n:' 开头，去掉前缀后调用 i18n.t() 翻译并返回；
 * 否则原样返回。
 *
 * @param value - 原始值，可能带 'i18n:' 前缀
 * @returns 翻译后的文本或原始值
 */
export function resolveI18nValue(value: string): string {
    if (value.startsWith(I18N_PREFIX)) {
        const i18nKey = value.slice(I18N_PREFIX.length);
        const i18n = getI18nManager();
        if (!i18n) return i18nKey;
        return i18n.t(i18nKey) || i18nKey;
    }
    return value;
}

/**
 * 直接翻译 i18n key
 *
 * 不需要 'i18n:' 前缀，直接调用 i18n.t(key) 翻译。
 * 若 key 带 'i18n:' 前缀会自动去掉。
 * 适用于已知是 key 的场景（如错误代码、枚举值），
 * 不必手动拼接前缀。
 *
 * @param key - i18n key，如 'error.network.timeout' 或 'i18n:error.network.timeout'
 * @param isError - 为 true 时自动从 kernel/validation/http 三个错误源查找翻译)，
 *                   适用于原始错误码（如 ENTITY_NOT_FOUND、VALIDATION_REQUIRED、403）
 * @returns 翻译后的文本，i18n 不可用或 key 未注册时返回 key 本身
 */
export function t(key: string, isError?: boolean): string {
    const actualKey = key.startsWith(I18N_PREFIX) ? key.slice(I18N_PREFIX.length) : key;
    const i18n = getI18nManager();

    if (isError) {
        const errorSources = ['kernel', 'validation', 'http'];
        if (i18n) {
            for (const source of errorSources) {
                const fullKey = `${source}.${actualKey}`;
                const result = i18n.t(fullKey);
                if (result && result !== fullKey) return result;
            }
        }
        return actualKey;
    }

    if (!i18n) return actualKey;
    return i18n.t(actualKey) || actualKey;
}
