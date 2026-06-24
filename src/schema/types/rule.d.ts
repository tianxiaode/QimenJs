/**
 * 验证规则类型定义
 *
 * 这些类型定义了数据约束，是 Schema 的一部分
 */
/**
 * 验证类型标签
 */
export type ValidationTag = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'password' | 'compare' | 'file' | 'split' | 'format';
/**
 * 自定义验证函数
 */
export type CustomValidationFunction = (value: any, index: number, rule: ValidationRule, context: any) => boolean | Promise<boolean>;
/**
 * 验证模式类型枚举
 * 定义了所有可用的验证模式类型常量
 */
export declare enum ValidationPatternType {
    EMAIL = "email",
    URL = "url",
    IPV4 = "ipv4",
    IPV6 = "ipv6",
    MAC_ADDRESS = "mac",
    PHONE = "phone",
    UUID = "uuid",
    BASE64 = "base64",
    HEX_COLOR = "hexColor",
    RGB_COLOR = "rgbColor",
    RGBA_COLOR = "rgbaColor",
    CREDIT_CARD = "creditCard",
    CHINESE_ID = "chineseId",
    CHINESE_POSTCODE = "chinesePostcode",
    USERNAME = "username",
    UPPERCASE = "uppercase",
    LOWERCASE = "lowercase",
    DIGIT = "digit",
    SPECIAL_CHAR = "specialChar"
}
export type PatternSwitches = {
    [K in ValidationPatternType]?: boolean;
};
/**
 * 基础验证规则类型 - 用于派生特定类型规则
 */
export interface BaseValidationRule {
    type: ValidationTag;
    message?: string;
    transform?: (val: any, rule: ValidationRule) => any;
    required?: boolean;
    nullable?: boolean;
    empty?: boolean;
    allErrors?: boolean;
    [key: string]: any;
}
/**
 * 字符串验证规则
 */
export interface StringRule extends BaseValidationRule {
    type: 'string';
    trim?: boolean | 'all' | 'inner';
    minLength?: number;
    maxLength?: number;
    length?: number;
    includes?: any[] | ((rule: ValidationRule) => any[]);
    excludes?: any[] | ((rule: ValidationRule) => any[]);
}
/**
 * 数字验证规则
 */
export interface NumberRule extends BaseValidationRule {
    type: 'number';
    min?: number;
    max?: number;
    exact?: number;
    integer?: boolean;
    positive?: boolean;
    negative?: boolean;
    even?: boolean;
    odd?: boolean;
    infinite?: boolean;
    includes?: any[] | ((rule: ValidationRule) => any[]);
    excludes?: any[] | ((rule: ValidationRule) => any[]);
}
/**
 * 布尔验证规则
 */
export interface BooleanRule extends BaseValidationRule {
    type: 'boolean';
}
/**
 * 日期验证规则
 */
export interface DateRule extends BaseValidationRule {
    type: 'date';
    min?: Date;
    max?: Date;
    future?: boolean;
    past?: boolean;
    today?: boolean;
    tomorrow?: boolean;
    yesterday?: boolean;
    weekend?: number | number[];
    includes?: any[] | ((rule: ValidationRule) => any[]);
    excludes?: any[] | ((rule: ValidationRule) => any[]);
}
/**
 * 数组验证规则
 */
export interface ArrayRule extends BaseValidationRule {
    type: 'array';
    itemRule?: CustomValidationFunction | ValidationRule;
    allItemsError?: boolean;
    allowEmptyItem?: boolean;
    minLength?: number;
    maxLength?: number;
    length?: number;
    unique?: boolean;
    uniqueBy?: string | ((item: any, rule: ValidationRule) => any);
    includes?: any[] | ((rule: ValidationRule) => any[]);
    excludes?: any[] | ((rule: ValidationRule) => any[]);
}
/**
 * 对象验证规则
 */
export interface ObjectRule extends BaseValidationRule {
    type: 'object';
    requiredFields?: readonly string[];
    properties?: Record<string, ValidationRule | CustomValidationFunction>;
    additionalProperties?: boolean;
}
/**
 * 密码验证规则
 */
export interface PasswordRule extends BaseValidationRule {
    type: 'password';
    trim?: boolean | 'all' | 'inner';
}
/**
 * 比较验证规则
 */
export interface CompareRule extends BaseValidationRule {
    type: 'compare';
    operator?: '=' | '!=' | '>' | '>=' | '<' | '<=';
    target?: any | ((rule: ValidationRule) => any);
    strict?: boolean;
}
/**
 * 文件验证规则
 */
export interface FileRule extends BaseValidationRule {
    type: 'file';
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
    minFiles?: number;
    maxFiles?: number;
}
/**
 * 分割验证规则
 */
export interface SplitRule extends BaseValidationRule, Omit<ArrayRule, 'type'>, Omit<StringRule, 'type' | 'includes' | 'excludes'> {
    type: 'split';
    separator: string | RegExp;
}
/**
 * 格式验证规则
 */
export interface FormatRule extends Omit<BaseValidationRule, 'type'> {
    type: 'format';
    format?: Omit<ValidationPatternType, 'uppercase' | 'lowercase' | 'digit' | 'specialChar'> | string;
    pattern?: RegExp;
}
/**
 * 统一验证规则类型
 */
export type ValidationRule = StringRule | NumberRule | BooleanRule | DateRule | ArrayRule | ObjectRule | PasswordRule | CompareRule | FileRule | SplitRule | FormatRule;
//# sourceMappingURL=rule.d.ts.map