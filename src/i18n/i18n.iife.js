/**
 * I18n IIFE 入口 - 浏览器端零依赖实现
 *
 * 由构建脚本包装为 IIFE 格式，供 <script> 标签直接加载
 * 输出: window.qimenI18n = { I18nManager, i18n, registerMessages }
 */

class I18nManager {
    constructor() {
        this._locale = detectLocale();
        this._messages = new Map();
        this._listeners = new Map();
        this._loadedScripts = new Set();
    }

    get locale() {
        return this._locale;
    }

    set locale(value) {
        if (value === this._locale) return;
        const previous = this._locale;
        this._locale = value;
        this.emit('locale:change', { previous, current: value });
    }

    t(key, params, defaultValue) {
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

    getMessage(path) {
        const messages = this._messages.get(this._locale);
        return messages ? getByPath(messages, path) : undefined;
    }

    getMessages() {
        return this._messages.get(this._locale) || {};
    }

    inject(messages, locale) {
        const target = locale ?? this._locale;
        const existing = this._messages.get(target) || {};
        mergeDeep(existing, messages);
        this._messages.set(target, existing);
        this.emit('messages:update', { locale: target, messages });
    }

    loadScript(url) {
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

    onLocaleChange(handler) {
        return this.on('locale:change', handler);
    }

    onMessagesUpdate(handler) {
        return this.on('messages:update', handler);
    }

    dispose() {
        this._messages.clear();
        this._listeners.clear();
        this._loadedScripts.clear();
    }

    getLocaleConfig(locale) {
        const target = locale ?? this._locale;
        const messages = this._messages.get(target);
        return messages ? messages._locale : undefined;
    }

    formatDate(date, style, locale) {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return String(date);
        const config = this.getLocaleConfig(locale);
        const pattern = (config && config.date && config.date[style]) || 'yyyy/M/d';
        return formatPattern(d, pattern, config);
    }

    formatTime(date, style, locale) {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return String(date);
        const config = this.getLocaleConfig(locale);
        const pattern = (config && config.time && config.time[style]) || 'H:mm';
        return formatPattern(d, pattern, config);
    }

    formatNumber(num, options, locale) {
        if (typeof num !== 'number' || isNaN(num)) return String(num);
        const config = this.getLocaleConfig(locale);
        const nc = (config && config.number) || {};
        const decimalDigits = options?.decimalDigits ?? 0;
        const groupSep = options?.groupSeparator ?? nc.groupSeparator ?? ',';
        const decimalSep = options?.decimalSeparator ?? nc.decimalSeparator ?? '.';
        const groupSize = nc.groupSize ?? 3;

        let fixed = num.toFixed(decimalDigits);
        const parts = fixed.split('.');
        let intPart = parts[0];
        const decPart = parts[1];

        if (groupSep && groupSize > 0) {
            const negative = intPart.startsWith('-');
            if (negative) intPart = intPart.slice(1);
            const groups = [];
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

    formatCurrency(num, options, locale) {
        if (typeof num !== 'number' || isNaN(num)) return String(num);
        const config = this.getLocaleConfig(locale);
        const cc = (config && config.currency) || {};
        const symbol = options?.symbol ?? cc.symbol ?? '$';
        const position = options?.position ?? cc.position ?? 'prefix';
        const decimalDigits = options?.decimalDigits ?? cc.decimalDigits ?? 2;

        const formatted = this.formatNumber(num, { decimalDigits }, locale);
        return position === 'prefix' ? symbol + formatted : formatted + ' ' + symbol;
    }

    on(event, handler) {
        let set = this._listeners.get(event);
        if (!set) {
            set = new Set();
            this._listeners.set(event, set);
        }
        set.add(handler);
        return () => {
            set.delete(handler);
            if (set.size === 0) this._listeners.delete(event);
        };
    }

    emit(event, data) {
        const handlers = this._listeners.get(event);
        if (!handlers) return;
        handlers.forEach(h => {
            try { h(data); } catch { /* 不中断其他处理器 */ }
        });
    }
}

function getByPath(obj, path) {
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

function mergeDeep(target, source) {
    for (const key of Object.keys(source)) {
        if (
            typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) &&
            typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])
        ) {
            mergeDeep(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

function detectLocale() {
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
    } catch { /* 回退 */ }
    return 'zh-CN';
}

function formatPattern(d, pattern, config) {
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var dayOfWeek = d.getDay();

    var weekdays = (config && config.weekdays) || [];
    var weekdaysShort = (config && config.weekdaysShort) || [];
    var months = (config && config.months) || [];
    var monthsShort = (config && config.monthsShort) || [];
    var hourCycle = (config && config.hourCycle) || 'h23';

    var hour12 = h % 12 || 12;
    var isPm = h >= 12;
    var ampm = isPm ? 'PM' : 'AM';

    var result = pattern;

    result = result.replace(/EEEE/g, function() {
        return weekdays[dayOfWeek] || ('星期' + ['日', '一', '二', '三', '四', '五', '六'][dayOfWeek]);
    });
    result = result.replace(/EEE/g, function() {
        return weekdaysShort[dayOfWeek] || weekdays[dayOfWeek] || '';
    });
    result = result.replace(/MMMM/g, function() {
        return months[month - 1] || (month + '月');
    });
    result = result.replace(/MMM/g, function() {
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

var i18n = new I18nManager();

function registerMessages(locale, messages) {
    i18n.inject(messages, locale);
    if (messages._locale) {
        messages._locale._lang = locale;
        // 将 weekdays/months 提升到顶层，供 formatPattern 直接读取
        var lc = messages._locale;
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
}