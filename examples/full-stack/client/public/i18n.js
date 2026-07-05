(function(qimenI18n){"use strict";
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

    // ---- 格式化方法 ----

    /** 获取当前语言的区域格式配置 */
    getLocaleConfig(locale) {
        const target = locale ?? this._locale;
        const messages = this._messages.get(target);
        return messages ? messages._locale : undefined;
    }

    /**
     * 格式化日期
     * @param {Date|string|number} date 日期对象、时间戳或日期字符串
     * @param {string} style 格式风格: 'short' | 'medium' | 'long' | 'full'
     * @param {string} locale 目标语言，默认当前语言
     */
    formatDate(date, style, locale) {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return String(date);
        const config = this.getLocaleConfig(locale);
        const pattern = (config && config.date && config.date[style]) || 'yyyy/M/d';
        return formatPattern(d, pattern, config);
    }

    /**
     * 格式化时间
     * @param {Date|string|number} date 时间对象、时间戳
     * @param {string} style 格式风格: 'short' | 'medium' | 'long'
     * @param {string} locale 目标语言
     */
    formatTime(date, style, locale) {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return String(date);
        const config = this.getLocaleConfig(locale);
        const pattern = (config && config.time && config.time[style]) || 'H:mm';
        return formatPattern(d, pattern, config);
    }

    /**
     * 格式化数字
     * @param {number} num 数字
     * @param {object} options 选项: { decimalDigits, groupSeparator, decimalSeparator }
     * @param {string} locale 目标语言
     */
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

        // 添加千分位
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

    /**
     * 格式化货币
     * @param {number} num 金额
     * @param {object} options 选项: { symbol, position, decimalDigits }
     * @param {string} locale 目标语言
     */
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

    // ---- 内部方法 ----

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

// ---- 工具函数 ----

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

// ---- 日期格式化工具 ----

var WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六'];
var WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var WEEKDAYS_EN_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var MONTHS_EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
var MONTHS_FR_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
var WEEKDAYS_FR = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
var WEEKDAYS_FR_SHORT = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

function formatPattern(d, pattern, config) {
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var dayOfWeek = d.getDay(); // 0=Sunday

    // 判断语言
    var lang = (config && config._lang) || '';
    var isZh = lang.startsWith('zh');
    var isFr = lang.startsWith('fr');

    // 12小时制
    var hour12 = h % 12 || 12;
    var ampm = h < 12 ? 'AM' : 'PM';
    if (isZh) ampm = h < 12 ? '上午' : '下午';
    if (isFr) ampm = h < 12 ? 'AM' : 'PM';

    var result = pattern;

    // EEEE - 星期全称
    result = result.replace(/EEEE/g, function() {
        if (isZh) return '星期' + WEEKDAYS_ZH[dayOfWeek];
        if (isFr) return WEEKDAYS_FR[(dayOfWeek + 6) % 7]; // 法语周一是0
        return WEEKDAYS_EN[dayOfWeek];
    });
    // EEE - 星期缩写
    result = result.replace(/EEE/g, function() {
        if (isZh) return '周' + WEEKDAYS_ZH[dayOfWeek];
        if (isFr) return WEEKDAYS_FR_SHORT[(dayOfWeek + 6) % 7];
        return WEEKDAYS_EN_SHORT[dayOfWeek];
    });
    // MMMM - 月份全称
    result = result.replace(/MMMM/g, function() {
        if (isFr) return MONTHS_FR[month - 1];
        if (isZh) return month + '月';
        return MONTHS_EN[month - 1];
    });
    // MMM - 月份缩写
    result = result.replace(/MMM/g, function() {
        if (isFr) return MONTHS_FR_SHORT[month - 1];
        if (isZh) return month + '月';
        return MONTHS_EN_SHORT[month - 1];
    });
    // yyyy - 四位年份
    result = result.replace(/yyyy/g, String(year));
    // MM - 两位月份
    result = result.replace(/MM/g, String(month).padStart(2, '0'));
    // M - 月份
    result = result.replace(/M(?![Mo])/g, String(month));
    // dd - 两位日期
    result = result.replace(/dd/g, String(day).padStart(2, '0'));
    // d - 日期
    result = result.replace(/d(?![aey])/g, String(day));
    // HH - 24小时制两位
    result = result.replace(/HH/g, String(h).padStart(2, '0'));
    // H - 24小时制
    result = result.replace(/H(?![HeH])/g, String(h));
    // hh - 12小时制两位
    result = result.replace(/hh/g, String(hour12).padStart(2, '0'));
    // h - 12小时制
    result = result.replace(/h(?![aey])/g, String(hour12));
    // mm - 两位分钟
    result = result.replace(/mm/g, String(m).padStart(2, '0'));
    // ss - 两位秒
    result = result.replace(/ss/g, String(s).padStart(2, '0'));
    // a - AM/PM
    result = result.replace(/\sa\b/, ' ' + ampm);
    result = result.replace(/^a\b/, ampm);

    return result;
}

var i18n = new I18nManager();

function registerMessages(locale, messages) {
    i18n.inject(messages, locale);
    // 在 _locale 中标记语言，供格式化函数判断
    if (messages._locale) {
        messages._locale._lang = locale;
    }
    if (!i18n.getMessages() || Object.keys(i18n.getMessages()).length === 0) {
        i18n.locale = locale;
    }
}

if (typeof window !== 'undefined') {
    window.__qimen_i18n_register__ = registerMessages;
}

qimenI18n.I18nManager=I18nManager;qimenI18n.i18n=i18n;qimenI18n.registerMessages=registerMessages;
})(this.qimenI18n=this.qimenI18n||{});