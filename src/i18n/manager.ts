/**
 * I18n 运行时实现 - 浏览器端零依赖
 *
 * IIFE 产物由构建脚本从此文件编译（去除 export 后拼接挂载副作用），
 * 供无构建器的应用通过 <script> 标签直接加载；
 * 有构建器的应用直接 import 本文件使用。
 */

import type {
    ILocaleChangeEvent,
    I18nLocaleConfig,
    II18nManager,
    IMessagesUpdateEvent,
    Locale,
    Messages,
    TranslateParams,
} from './types';

export class I18nManager implements II18nManager {
    private _locale: Locale;
    private _messages: Map<Locale, Messages>;
    private _listeners: Map<string, Set<(data: any) => void>>;
    private _loadedScripts: Set<string>;

    constructor() {
        this._locale = detectLocale();
        this._messages = new Map();
        this._listeners = new Map();
        this._loadedScripts = new Set();
    }

    get locale(): Locale {
        return this._locale;
    }

    set locale(value: Locale) {
        if (value === this._locale) return;
        const previous = this._locale;
        this._locale = value;
        if (typeof document !== 'undefined') {
            document.documentElement.lang = value;
        }
        this.emit('locale:change', { previous, current: value });
        this.loadScript('/locales/' + value + '.js');
    }

    t(key: string, params?: TranslateParams, defaultValue?: string): string {
        const messages = this._messages.get(this._locale);
        if (!messages) return defaultValue ?? key;
        const value = getByPath(messages, key);
        if (value == null || typeof value !== 'string') return defaultValue ?? key;
        if (!params) return value;
        let result = value;
        for (const [k, v] of Object.entries(params)) {
            result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
        return result;
    }

    getMessage(path: string): any {
        const messages = this._messages.get(this._locale);
        return messages ? getByPath(messages, path) : undefined;
    }

    getMessages(): Messages {
        return this._messages.get(this._locale) || {};
    }

    inject(messages: Messages, locale?: Locale): void {
        const target = locale ?? this._locale;
        const existing = this._messages.get(target) || {};
        mergeDeep(existing, messages);
        this._messages.set(target, existing);
        this.emit('messages:update', { locale: target, messages });
    }

    loadScript(url: string): Promise<void> {
        if (this._loadedScripts.has(url)) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => {
                this._loadedScripts.add(url);
                resolve();
            };
            script.onerror = () => {
                reject(new Error(`[i18n] Failed to load script: ${url}`));
            };
            document.head.appendChild(script);
        });
    }

    onLocaleChange(handler: (event: ILocaleChangeEvent) => void): () => void {
        return this.on('locale:change', handler);
    }

    onMessagesUpdate(handler: (event: IMessagesUpdateEvent) => void): () => void {
        return this.on('messages:update', handler);
    }

    dispose(): void {
        this._messages.clear();
        this._listeners.clear();
        this._loadedScripts.clear();
    }

    getLocaleConfig(locale?: Locale): I18nLocaleConfig | undefined {
        const target = locale ?? this._locale;
        const messages = this._messages.get(target);
        return messages ? messages._locale : undefined;
    }

    formatDate(date: Date | string | number, style: string, locale?: Locale): string {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return String(date);
        const config = this.getLocaleConfig(locale);
        const pattern = (config && config.date && config.date[style]) || 'yyyy/M/d';
        return formatPattern(d, pattern, config);
    }

    formatTime(date: Date | string | number, style: string, locale?: Locale): string {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return String(date);
        const config = this.getLocaleConfig(locale);
        const pattern = (config && config.time && config.time[style]) || 'H:mm';
        return formatPattern(d, pattern, config);
    }

    formatNumber(
        num: number,
        options?: { decimalDigits?: number; groupSeparator?: string; decimalSeparator?: string },
        locale?: Locale
    ): string {
        if (typeof num !== 'number' || isNaN(num)) return String(num);
        const config = this.getLocaleConfig(locale);
        const nc = (config && config.number) || undefined;
        const decimalDigits = options?.decimalDigits ?? 0;
        const groupSep = options?.groupSeparator ?? nc?.groupSeparator ?? ',';
        const decimalSep = options?.decimalSeparator ?? nc?.decimalSeparator ?? '.';
        const groupSize = nc?.groupSize ?? 3;

        const fixed = num.toFixed(decimalDigits);
        const parts = fixed.split('.');
        let intPart = parts[0];
        const decPart = parts[1];

        if (groupSep && groupSize > 0) {
            const negative = intPart.startsWith('-');
            if (negative) intPart = intPart.slice(1);
            const groups: string[] = [];
            while (intPart.length > groupSize) {
                groups.unshift(intPart.slice(-groupSize));
                intPart = intPart.slice(0, -groupSize);
            }
            groups.unshift(intPart);
            intPart = groups.join(groupSep);
            if (negative) intPart = '-' + intPart;
        }

        return decPart ? intPart + decimalSep + decPart : intPart;
    }

    formatCurrency(
        num: number,
        options?: { symbol?: string; position?: string; decimalDigits?: number },
        locale?: Locale
    ): string {
        if (typeof num !== 'number' || isNaN(num)) return String(num);
        const config = this.getLocaleConfig(locale);
        const cc = (config && config.currency) || undefined;
        const symbol = options?.symbol ?? cc?.symbol ?? '$';
        const position = options?.position ?? cc?.position ?? 'prefix';
        const decimalDigits = options?.decimalDigits ?? cc?.decimalDigits ?? 2;

        const formatted = this.formatNumber(num, { decimalDigits }, locale);
        return position === 'prefix' ? symbol + formatted : formatted + ' ' + symbol;
    }

    on(event: string, handler: (data: any) => void): () => void {
        let set = this._listeners.get(event);
        if (!set) {
            set = new Set();
            this._listeners.set(event, set);
        }
        set.add(handler);
        return () => {
            set?.delete(handler);
            if (set && set.size === 0) this._listeners.delete(event);
        };
    }

    emit(event: string, data: any): void {
        const handlers = this._listeners.get(event);
        if (!handlers) return;
        handlers.forEach(h => {
            try {
                h(data);
            } catch {
                /* 不中断其他处理器 */
            }
        });
    }
}

export function getByPath(obj: any, path: string): any {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return undefined;
        }
    }
    return result;
}

export function mergeDeep(target: any, source: Messages): void {
    for (const key of Object.keys(source)) {
        if (
            typeof source[key] === 'object' &&
            source[key] !== null &&
            !Array.isArray(source[key]) &&
            typeof target[key] === 'object' &&
            target[key] !== null &&
            !Array.isArray(target[key])
        ) {
            mergeDeep(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

export function detectLocale(): Locale {
    try {
        if (typeof location !== 'undefined') {
            const lang = new URLSearchParams(location.search).get('lang');
            if (lang) return lang;
        }
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('locale');
            if (stored) return stored;
        }
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
            if (match && match[1]) return decodeURIComponent(match[1]);
        }
        if (typeof navigator !== 'undefined') {
            return navigator.language || 'zh-CN';
        }
    } catch {
        /* 回退 */
    }
    return 'zh-CN';
}

export function formatPattern(
    d: Date,
    pattern: string,
    config: I18nLocaleConfig | null | undefined
): string {
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayOfWeek = d.getDay();

    const weekdays = config?.weekdays ?? [];
    const weekdaysShort = config?.weekdaysShort ?? [];
    const months = config?.months ?? [];
    const monthsShort = config?.monthsShort ?? [];
    const hour12 = h % 12 || 12;
    const isPm = h >= 12;
    const ampm = isPm ? 'PM' : 'AM';

    let result = pattern;

    result = result.replace(/EEEE/g, () => {
        return (
            weekdays[dayOfWeek] || '星期' + ['日', '一', '二', '三', '四', '五', '六'][dayOfWeek]
        );
    });
    result = result.replace(/EEE/g, () => {
        return weekdaysShort[dayOfWeek] || weekdays[dayOfWeek] || '';
    });
    result = result.replace(/MMMM/g, () => {
        return months[month - 1] || month + '月';
    });
    result = result.replace(/MMM/g, () => {
        return monthsShort[month - 1] || months[month - 1] || '';
    });
    result = result.replace(/yyyy/g, String(year));
    result = result.replace(/MM/g, String(month).padStart(2, '0'));
    result = result.replace(/M(?![Mo])/g, String(month));
    result = result.replace(/dd/g, String(day).padStart(2, '0'));
    result = result.replace(/d(?![aey])/g, String(day));
    result = result.replace(/HH/g, String(h).padStart(2, '0'));
    result = result.replace(/H(?![HeH])/g, String(h));
    result = result.replace(/hh/g, String(hour12).padStart(2, '0'));
    result = result.replace(/h(?![aey])/g, String(hour12));
    result = result.replace(/mm/g, String(m).padStart(2, '0'));
    result = result.replace(/ss/g, String(s).padStart(2, '0'));
    result = result.replace(/\sa\b/, ' ' + ampm);
    result = result.replace(/^a\b/, ampm);

    return result;
}
