/**
 * @orbit-js/i18n 类型定义
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
