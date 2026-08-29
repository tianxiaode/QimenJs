export interface DataMap {
    /** 默认值集合 */
    defaultValues: Record<string, any>;
    /** target to 配置的映射关系 */
    targetToMap: Map<string, TargetToOptionDefinition>;
    /** 带有本地化配置的配置key集合 */
    i18nOptions: Array<string>;
    /** 全部配置的key集合，用于拆分构造函数的配置 */
    optionsKeys: Set<string>;
    /** 需要从构造函数中获取值的属性集合 */
    propertyKeys: Set<string>;
    /** 用于销毁属性 */
    propertyClearKeys: Array<string>;
}

export const TARGET_TO_OPTION__MAP = {
    text: 'textContext',
    src: 'src',
    html: 'html',
    href: 'href',
    value: 'value',
    title: 'title',
    alt: 'alt',
    style: 'style',
    attribute: 'attribute',
};

export const TARGET_TO_OPTION_KEYS = Object.keys(TARGET_TO_OPTION__MAP);
export const TARGET_TO_OPTION_KEYS_SET = new Set(TARGET_TO_OPTION_KEYS);
export interface TargetToOptionDefinition {
    /** 目标节点 */
    target?: string;
    /** 映射到目标的属性，如value, text,src, link,href等 */
    to?: keyof typeof TARGET_TO_OPTION_KEYS;
    /** 本地化key */
    i18n?: string;
    /** 默认值，当目标节点不存在时使用 */
    default?: any;
    /** 值改变时执行 */
    change?: (value: any, old: any, def: TargetToOptionDefinition) => void;
}

export type OptionDefinition = Record<string, TargetToOptionDefinition>;

export type Definitions = {
    targetToOptions?: Record<string, TargetToOptionDefinition>;
    options?: Record<string, any>;
    privateField?: Record<string, any>;
    fields?: Record<string, any>;
};

// ============================================================
// 类型工具 - 对齐 InferAbilities
// ============================================================

/**
 * ✅ 从 Definitions 推导类型（对齐 InferAbilities）
 */
export type InferDefinitions<T extends Definitions> = (T['fields'] extends Record<string, any>
    ? T['fields']
    : object) &
    (T['privateField'] extends Record<string, any> ? T['privateField'] : object);
