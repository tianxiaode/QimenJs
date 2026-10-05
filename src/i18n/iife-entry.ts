/// <reference path="./global.d.ts" />

/**
 * I18n IIFE 入口 - 无构建器场景的挂载副作用
 *
 * 由构建脚本编译为 IIFE 产物（去除 import 后拼接 manager 实现），
 * 供 <script> 标签直接加载。
 * 输出: window.qimenI18n = { I18nManager, i18n, registerMessages }
 */
import { I18nManager } from './manager';
import type { Locale, Messages } from './types';

const i18n = new I18nManager();

function registerMessages(locale: Locale, messages: Messages): void {
    i18n.inject(messages, locale);
    if (messages._locale) {
        messages._locale._lang = locale;
        // 将 weekdays/months 提升到顶层，供 formatPattern 直接读取
        const lc = messages._locale;
        if (lc.weekdays && !messages.weekdays) messages.weekdays = lc.weekdays;
        if (lc.weekdaysShort && !messages.weekdaysShort) messages.weekdaysShort = lc.weekdaysShort;
        if (lc.months && !messages.months) messages.months = lc.months;
        if (lc.monthsShort && !messages.monthsShort) messages.monthsShort = lc.monthsShort;
    }
    if (!i18n.getMessages() || Object.keys(i18n.getMessages()).length === 0) {
        i18n.locale = locale;
    }
}

if (typeof window !== 'undefined') {
    window.__qimen_i18n_register__ = registerMessages;
    window.__qimen_i18n__ = i18n;
    window.qimenI18n = { I18nManager: I18nManager, i18n: i18n, registerMessages: registerMessages };

    // 自动检测语言并动态加载对应语言包
    (function () {
        const detected = i18n.locale;
        const locale = detected !== 'zh-CN' && detected !== 'en-US' ? 'zh-CN' : detected;
        if (locale !== detected) {
            i18n.locale = locale;
        }
        document.documentElement.lang = locale;
        i18n.loadScript('/locales/' + locale + '.js');
    })();
}
