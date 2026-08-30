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
    text: 'textContext',
    src: 'src',
    html: 'html',
    href: 'href',
    value: 'value',
    title: 'title',
    alt: 'alt',
    style: 'style',
    attribute: 'attribute',
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
    privateFields?: Record<string, any>;
    fields?: Record<string, any>;
};

export interface I18nMeta {
    /** 当前生效的 i18n key（可能被用户覆盖） */
    key?: string;
    /** 来源：'default' | 'user-override' | 'explicit-value' */
    useI18n: boolean;
}

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
