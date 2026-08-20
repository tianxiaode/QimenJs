export const OPTION_TARGET_TO_KEYS = {
    text: 'textContent',
    src: 'src',
    html: 'html',
    href: 'href',
    value: 'value',
    title: 'title',
    alt: 'alt',
};

export interface OptionDecl {
    /** 目标节点 */
    target?: string;
    /** 映射到目标的属性，如value, text,src, link,href等 */
    to?: keyof typeof OPTION_TARGET_TO_KEYS;

    default?: any;
}

export type OptionDefinition = Record<string, OptionDecl | any>;

export type Definitions = {
    options?: OptionDefinition;
    property?: Record<string, any>;
    [key: string]: any;
};

// ============================================================
// 类型工具 - 对齐 InferAbilities
// ============================================================

export type InferOptionDefault<T> = T extends { default: infer D } ? D : any;

export type InferOptions<T extends OptionDefinition> = {
    [K in keyof T]: T[K] extends OptionDecl ? InferOptionDefault<T[K]> : T[K];
};

/**
 * ✅ 从 Definitions 推导类型（对齐 InferAbilities）
 */
export type InferDefinitions<T extends Definitions> = (T['options'] extends OptionDefinition
    ? InferOptions<T['options']>
    : object) &
    (T['property'] extends Record<string, any> ? T['property'] : object) & {
        [K in keyof T as K extends 'options' | 'property' ? never : K]: T[K];
    };
