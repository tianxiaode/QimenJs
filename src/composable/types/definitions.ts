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

export const TARGET_TO_OPTION_MAP = {
    text: 'textContent',
    src: 'src',
    html: 'innerHTML',
    href: 'href',
    value: 'value',
    title: 'title',
    alt: 'alt',
    style: 'style',
    attribute: 'attribute',
    class: 'class',
} as const;

/**
 * | 场景 | 走哪条路 | 说明 |
| :--- | :--- | :--- |
| `new My({ text: 'Hello' })` | 显式赋值 | 直接显示 `'Hello'` |
| `new My({})` | i18n | 解析 `i18n` 键显示 |
| `new My({ text: undefined })` | 按约定视为“未传” | 走 i18n（如果约定 `undefined` 为未传） |
| `new My({ text: null })` | 显式赋值 | 显示 `null`（清空内容） |
 */
export interface TargetToOptionDefinition {
    /** 目标节点 */
    target?: string;
    /** 映射到目标的属性，如value, text,src, link,href等 */
    to?: keyof typeof TARGET_TO_OPTION_MAP;
    /** 默认值，当目标节点不存在时使用 */
    default?: any;
}

export type OptionDefinition = Record<string, TargetToOptionDefinition>;

export type Definitions = {
    targetToOptions?: Record<string, TargetToOptionDefinition>;
    options?: Record<string, any>;
    privateFields?: Record<string, any>;
    fields?: Record<string, any>;
    overrides?: Record<string, any>;
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
    (T['privateFields'] extends Record<string, any> ? T['privateFields'] : object);
