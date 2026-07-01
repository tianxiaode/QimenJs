import type {
    ILocaleChangeEvent,
    IMessagesUpdateEvent,
    Locale,
    Messages,
    TranslateParams,
} from './types';

/**
 * I18n 管理器
 *
 * @example
 * ```html
 * <!-- HTML: 只需加载 i18n 核心，语言包由 JS 动态加载 -->
 * <script src="/orbit-i18n.js"></script>
 * <script>
 *   // 启动时根据检测到的语言加载对应语言包
 *   orbitI18n.loadScript('/locales/' + orbitI18n.i18n.locale + '.js');
 * </script>
 * ```
 *
 * ```ts
 * // JS 中使用
 * import { i18n } from '@orbitjs/i18n';
 *
 * i18n.t('common.save');                    // '保存'
 * i18n.t('greeting', { name: 'World' });    // '你好, World'
 *
 * // 切换语言（自动加载新语言包）
 * await i18n.loadScript('/locales/en-US.js');
 * i18n.locale = 'en-US';
 *
 * // 监听变更
 * i18n.onLocaleChange(() => { /* 重渲染 *\/ });
 * ```
 */
export class I18nManager {
    private _locale: Locale = detectLocale();
    private _messages = new Map<Locale, Messages>();
    private _listeners = new Map<string, Set<Function>>();
    private _loadedScripts = new Set<string>();

    /** 当前语言 */
    get locale(): Locale {
        return this._locale;
    }

    set locale(value: Locale) {
        if (value === this._locale) return;
        const previous = this._locale;
        this._locale = value;
        this.emit('locale:change', { previous, current: value });
    }

    /**
     * 翻译文本
     *
     * @param key 翻译键，支持点号路径 'user.profile.name'
     * @param params 插值参数，替换 {key} 占位符
     * @param defaultValue 默认值，未提供时返回 key
     */
    t(key: string, params?: TranslateParams, defaultValue?: string): string {
        const messages = this._messages.get(this._locale);
        if (!messages) return defaultValue ?? key;

        const value = getByPath(messages, key);
        if (value === undefined || value === null) return defaultValue ?? key;
        if (typeof value !== 'string') return defaultValue ?? key;

        if (!params) return value;

        let result = value;
        for (const [k, v] of Object.entries(params)) {
            result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
        return result;
    }

    /**
     * 通过路径获取原始翻译值（不做插值）
     */
    getMessage(path: string): any {
        const messages = this._messages.get(this._locale);
        return messages ? getByPath(messages, path) : undefined;
    }

    /**
     * 获取当前语言的全部消息
     */
    getMessages(): Messages {
        return this._messages.get(this._locale) || {};
    }

    /**
     * 注入消息 - 合并到指定语言
     *
     * @param messages 消息集合
     * @param locale 目标语言，默认当前语言
     */
    inject(messages: Messages, locale?: Locale): void {
        const target = locale ?? this._locale;
        const existing = this._messages.get(target) || {};
        mergeDeep(existing, messages);
        this._messages.set(target, existing);
        this.emit('messages:update', { locale: target, messages });
    }

    /**
     * 动态加载 .js 语言包文件
     *
     * 通过创建 <script> 标签加载 public 目录下的 .js 语言包。
     * .js 文件内部调用 __orbit_i18n_register__() 注入消息。
     *
     * 同一 URL 只加载一次（去重）。
     *
     * @param url .js 语言包文件路径，如 '/locales/en-US.js'
     * @returns Promise<void> 加载完成
     *
     * @example
     * ```ts
     * // 启动时加载当前语言
     * await i18n.loadScript('/locales/' + i18n.locale + '.js');
     *
     * // 切换语言时加载新语言包
     * await i18n.loadScript('/locales/en-US.js');
     * i18n.locale = 'en-US';
     * ```
     */
    loadScript(url: string): Promise<void> {
        // 去重：同一 URL 只加载一次
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

    /**
     * 监听语言变更
     * @returns 取消监听函数
     */
    onLocaleChange(handler: (event: ILocaleChangeEvent) => void): () => void {
        return this.on('locale:change', handler);
    }

    /**
     * 监听消息更新
     * @returns 取消监听函数
     */
    onMessagesUpdate(handler: (event: IMessagesUpdateEvent) => void): () => void {
        return this.on('messages:update', handler);
    }

    /**
     * 销毁
     */
    dispose(): void {
        this._messages.clear();
        this._listeners.clear();
        this._loadedScripts.clear();
    }

    // ---- 内部方法 ----

    private on(event: string, handler: Function): () => void {
        let set = this._listeners.get(event);
        if (!set) {
            set = new Set();
            this._listeners.set(event, set);
        }
        set.add(handler);
        return () => {
            set!.delete(handler);
            if (set!.size === 0) this._listeners.delete(event);
        };
    }

    private emit(event: string, data: any): void {
        const handlers = this._listeners.get(event);
        if (!handlers) return;
        handlers.forEach(h => {
            try { h(data); } catch { /* 不中断其他处理器 */ }
        });
    }
}

// ---- 工具函数 ----

function getByPath(obj: Record<string, any>, path: string): any {
    const keys = path.split('.');
    let result: any = obj;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return undefined;
        }
    }
    return result;
}

function mergeDeep(target: Messages, source: Messages): void {
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

/**
 * 检测浏览器语言
 *
 * 优先级：URL 参数 > localStorage > cookie > navigator.language > 'zh-CN'
 */
function detectLocale(): Locale {
    try {
        // 1. URL 参数 ?lang=xx
        if (typeof location !== 'undefined') {
            const lang = new URLSearchParams(location.search).get('lang');
            if (lang) return lang;
        }

        // 2. localStorage
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('locale');
            if (stored) return stored;
        }

        // 3. cookie
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
            if (match?.[1]) return decodeURIComponent(match[1]);
        }

        // 4. 浏览器语言
        if (typeof navigator !== 'undefined') {
            return navigator.language || 'zh-CN';
        }
    } catch {
        // 任何环境异常都回退
    }

    return 'zh-CN';
}

/** 全局单例 */
export const i18n = new I18nManager();

/**
 * 注册语言包到全局 i18n 单例
 *
 * 供 public 目录的 .js 语言包文件调用。
 * .js 文件内容格式：
 *   __orbit_i18n_register__('zh-CN', { common: { save: '保存' } })
 *
 * 注册后自动将 i18n.locale 同步为该语言（如果当前没有消息的话），
 * 解决"检测到的语言"与"加载的语言包"不匹配的问题。
 */
export function registerMessages(locale: Locale, messages: Messages): void {
    i18n.inject(messages, locale);
    // 如果当前语言还没有消息，自动切换到刚注册的语言
    if (!i18n.getMessages() || Object.keys(i18n.getMessages()).length === 0) {
        i18n.locale = locale;
    }
}

// 挂载到全局，供 script 标签加载的 .js 文件调用
if (typeof window !== 'undefined') {
    (window as any).__orbit_i18n_register__ = registerMessages;
}
