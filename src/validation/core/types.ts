/**
 * 验证错误上下文信息
 *
 * 提供了以下常用字段作为参考，您也可以添加任意自定义字段：
 *
 * @property {string|string[]} path - 数据路径，如 'user.email' 或 ['user', 'email']
 * @property {string} field - 字段名称
 * @property {any} value - 字段当前值
 * @property {string} label - 字段显示标签
 * @property {any} parent - 父级数据
 * @property {any} root - 根级数据
 * @property {number} index - 数组索引（如果是数组项）
 * @property {string|number} key - 对象键（如果是对象属性）
 *
 * 除了上述字段，您可以通过任意键添加自定义上下文信息。
 */
export interface ValidationErrorContext {
    // 常用基础字段（作为参考和默认使用）
    context?: ValidationErrorContext | string[];
    validate?: ValidatorFunction;
    field?: string;
    value?: any;
    label?: string;
    type?: string;
    parent?: any;
    root?: any;
    index?: number;
    key?: string | number;
    functionName?: string;
    arguments?: any[];

    // 允许任意自定义字段
    [key: string]: any;
}

/**
 * 验证错误信息接口
 * 用于描述单个验证错误的结构
 */
export interface ValidationRuleError {
    /**
     * 错误代码，用于标识错误类型
     * 例如: 'required', 'minLength', 'patternMismatch' 等
     */
    code: string;

    /**
     * 错误参数，可选字段，用于提供错误详情
     * 例如: { min: 5, max: 10 } 用于描述数值范围限制
     */
    params?: Record<string, any>;

    /**
     * 错误上下文，指示验证失败的上下文信息
     */
    context?: ValidationErrorContext;
}

export type CheckResult = ValidationRuleError | null;

export type ValidationResult = ValidationRuleError[] | null;

/**
 * 仅用于兼容不同校验函数返回值的适配层类型
 * ❌ 不应在核心校验逻辑中传播
 */
export type AnyValidationResult = CheckResult | ValidationResult;

/**
 * 验证规则选项接口
 * 用于描述单个验证规则的选项结构
 */
export interface RuleBaseOptions {
    type?: string;
    message?: string;
    [key: string]: any;
}

/**
 * 用于定义必填、可选、空值规则
 */
export interface RulePresenceOptions {
    /**
     * 是否必填（不允许 undefined）
     */
    required?: boolean;

    /**
     * 是否允许为 null
     */
    nullable?: boolean;

    /**
     * 是否允许空值（'' / [] / {}）
     */
    empty?: boolean;
}

/**
 * 用于定义字符串或数组的长度规则
 */
export interface RuleLengthOptions {
    /**
     * 最小长度限制
     * 字符串长度不能少于指定数值
     */
    minLength?: number;

    /**
     * 最大长度限制
     * 字符串长度不能超过指定数值
     */
    maxLength?: number;

    /**
     * 精确长度限制
     * 字符串长度必须等于指定数值
     * 如果设置了此属性，minLength和maxLength将被忽略
     */
    exactLength?: number;
}

/**
 * 用于定义数值范围规则
 */
export interface RuleRangeOptions<T extends number | Date> extends RuleLengthOptions {
    /**
     * 最小值
     */
    min?: T;

    /**
     * 最大值
     */
    max?: T;
}

/**
 * 用于定义数组子项规则
 * 仅用于兼容不同校验函数返回值的适配层类型
 * ❌ 不应在核心校验逻辑中传播
 */
export interface RuleArrayItemsOptions {
    /**
     * 子项规则
     * 数组项必须满足的规则     *
     */

    itemRule: ValidatorFunction | RuleArrayItemsOptions;

    /**
     * 是否收集所有子项错误
     */
    allItemsError?: boolean;
}

/**
 * 用于定义对象属性规则
 * 仅用于兼容不同校验函数返回值的适配层类型
 * ❌ 不应在核心校验逻辑中传播
 */
export interface RuleObjectPropertiesOptions {
    /**
     * 属性规则
     * 对象属性必须满足的规则
     */
    properties?: Record<string, ValidatorFunction | RuleObjectPropertiesOptions>;

    /**
     * 要求的属性列表
     */
    requiredFields?: readonly string[];
    /**
     * 是否允许额外的属性
     */
    additionalProperties?: boolean;
    /**
     * 是否收集所有属性错误
     */
    allPropertiesError?: boolean;
}

export interface RulePatternOptions {
    /**
     * 正则表达式模式匹配
     * 字符串必须匹配指定的正则表达式模式
     */
    pattern?: RegExp;
}

/**
 * 核心验证规则选项接口
 * 用于描述核心验证规则的选项结构
 */
export interface CoreRuleOptions extends RuleBaseOptions, RulePresenceOptions {}

/**
 * 验证规则接口
 * 用于描述单个验证规则的结构
 * 包含校验函数、错误信息、选项等
 * 该接口仅用于描述，不应在核心校验逻辑中传播
 */
export type ValidatorFunction = (
    value: any,
    rule: any,
    context?: ValidationErrorContext
) => ValidationResult;

/**
 * 仅用于核心验证的子验证，不应在核心校验逻辑中传播
 * ❌ 不应在核心校验逻辑中传播
 */
export type CheckFunction = (
    value: any,
    rule: any,
    context?: ValidationErrorContext
) => CheckResult;
