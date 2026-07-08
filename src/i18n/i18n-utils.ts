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
