export const OPTION_TARGET_TO_KEYS = {
    text: 'textContent',
    src: 'src',
    html: 'html',
    href: 'href',
    value: 'value',
    title: 'title',
    alt: 'alt',
    style: 'style',
    attribute: 'attribute',
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
    readonly?: Record<string, any>;
    [key: string]: any;
};

/**
 * 选项处理器接口
 *
 * 用于处理组件选项变更时的自定义逻辑
 *
 * @interface IOptionHandler
 */
export interface IOptionHandler {
    /**
     * 处理器名称，用于标识和调试
     */
    name: string;

    /**
     * 处理选项变更
     *
     * @param key - 选项键名
     * @param value - 新值
     * @param old - 旧值
     * @param definition - 选项定义
     * @param instance - 实例
     * @returns 是否已处理（true 表示已处理，不再执行默认逻辑）
     */
    handler: OptionHandlerFn;
}

/**
 * 选项处理器函数类型
 *
 * @type OptionHandlerFn
 */
export type OptionHandlerFn = (value: any, instance: any, definition?: OptionDecl) => boolean;

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
    (T['property'] extends Record<string, any> ? T['property'] : object) &
    (T['readonly'] extends Record<string, any> ? T['readonly'] : object) & {
        [K in keyof T as K extends 'options' | 'property' | 'readonly' ? never : K]: T[K];
    };
