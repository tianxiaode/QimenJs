// types/i18n-types.ts

/**
 * 节点 i18n 配置
 */
export interface I18nDecl {
    text?: string;
    hint?: string;
    placeholder?: string;
    value?: string;
    [field: string]: string | undefined;
}

/**
 * i18n 节点集合
 */
export type I18nDeclMap = Record<string, I18nDecl>;
