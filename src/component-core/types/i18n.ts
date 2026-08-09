// types/i18n-types.ts

/**
 * 节点 i18n 配置
 */
export interface NodeI18nConfig {
    text?: string;
    hint?: string;
    placeholder?: string;
    value?: string;
    [field: string]: string | undefined;
}

/**
 * i18n 节点集合
 */
export type I18nNodes = Record<string, NodeI18nConfig>;

/**
 * i18n 更新参数
 */
export type I18nUpdate = string | NodeI18nConfig;
