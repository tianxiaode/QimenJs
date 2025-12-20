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

export interface CommonRule {
    message?: string;
}

export interface PresenceOptions {
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

export interface CoreRule extends CommonRule, PresenceOptions {}

export interface ExtensionRule extends CoreRule {}

export interface HasChildRule extends ExtensionRule {
    childRule: ValidatorFunction | HasChildRule;
    allChildsError?: boolean;
}

export interface HasPropertiesRule extends ExtensionRule {
    properties?: Record<string, ValidatorFunction | HasPropertiesRule>;
    requiredFields?: readonly string[];
    additionalProperties?: boolean;
    allPropertiesError?: boolean;
}

export type ValidatorFunction = (
    value: any,
    rule: any,
    context?: ValidationErrorContext
) => ValidationResult;

export type CheckFunction = (
    value: any,
    rule: any,
    context?: ValidationErrorContext
) => CheckResult;
