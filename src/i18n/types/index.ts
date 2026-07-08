/**
 * @qimenjs/i18n 类型定义
 *
 * 与 i18n.iife.js 中的 I18nManager 类对齐
 */

/** 语言标识符，如 'zh-CN', 'en-US' */
export type Locale = string;

/** 翻译消息集合 - 支持嵌套结构 */
export type Messages = Record<string, any>;

/** 翻译参数 - 用于插值替换 */
export type TranslateParams = Record<string, string | number>;

/** 语言变更事件 */
export interface ILocaleChangeEvent {
    previous: Locale;
    current: Locale;
}

/** 消息更新事件 */
export interface IMessagesUpdateEvent {
    locale: Locale;
    messages: Messages;
}

/** UI 组件区域配置 */
export interface I18nUiConfig {
    /** 标签与输入框的分隔符（中文 '：'，英文 ':'） */
    labelSeparator: string;
    /** 标签位置：'left' | 'top' */
    labelPosition: 'left' | 'top';
    /** 错误信息显示位置：'below' | 'right' | 'tooltip' */
    errorPosition: 'below' | 'right' | 'tooltip';
    /** 必填标记符号 */
    requiredMark: string;
    /** 必填标记位置：'after' | 'before' */
    requiredMarkPosition: 'after' | 'before';
}

/** 货币格式配置 */
export interface I18nCurrencyConfig {
    code: string;
    symbol: string;
    position: 'prefix' | 'suffix';
    decimalDigits: number;
}

/** 数字格式配置 */
export interface I18nNumberConfig {
    decimalSeparator: string;
    groupSeparator: string;
    groupSize: number;
}

/** 区域格式配置（语言包 _locale 字段） */
export interface I18nLocaleConfig {
    date?: Record<string, string>;
    time?: Record<string, string>;
    currency?: I18nCurrencyConfig;
    number?: I18nNumberConfig;
    units?: Record<string, string>;
    weekStart?: number;
    hourCycle?: string;
    /** 内部标记，供格式化函数判断语言 */
    _lang?: string;
    /** UI 组件配置 */
    ui?: I18nUiConfig;
}

/**
 * I18nManager 运行时接口
 *
 * 与 i18n.iife.js 中的 I18nManager 类对齐
 */
export interface II18nManager {
    /** 当前语言 */
    locale: Locale;

    /** 翻译文本，支持点号路径和 {key} 插值 */
    t(key: string, params?: TranslateParams, defaultValue?: string): string;

    /** 获取原始翻译值（不做插值） */
    getMessage(path: string): any;

    /** 获取当前语言的全部消息 */
    getMessages(): Messages;

    /** 获取当前语言的区域格式配置（包含 ui 字段） */
    getLocaleConfig(locale?: Locale): I18nLocaleConfig | undefined;

    /** 注入消息 - 合并到指定语言 */
    inject(messages: Messages, locale?: Locale): void;

    /** 动态加载 .js 语言包文件 */
    loadScript(url: string): Promise<void>;

    /** 格式化日期 */
    formatDate(date: Date | string | number, style: string, locale?: Locale): string;

    /** 格式化时间 */
    formatTime(date: Date | string | number, style: string, locale?: Locale): string;

    /** 格式化数字 */
    formatNumber(num: number, options?: { decimalDigits?: number; groupSeparator?: string; decimalSeparator?: string }, locale?: Locale): string;

    /** 格式化货币 */
    formatCurrency(num: number, options?: { symbol?: string; position?: string; decimalDigits?: number }, locale?: Locale): string;

    /** 监听语言变更，返回取消监听函数 */
    onLocaleChange(handler: (event: ILocaleChangeEvent) => void): () => void;

    /** 监听消息更新，返回取消监听函数 */
    onMessagesUpdate(handler: (event: IMessagesUpdateEvent) => void): () => void;

    /** 销毁 */
    dispose(): void;
}

/** window.qimenI18n 全局对象 */
export interface IQimenI18nGlobal {
    I18nManager: any;
    i18n: II18nManager;
    registerMessages: (locale: Locale, messages: Messages) => void;
}
