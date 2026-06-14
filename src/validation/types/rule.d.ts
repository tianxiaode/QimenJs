import { ValidationTag } from './base';
export type CustomValidationFunction = (value: any, index: number, rule: ValidationRule, context: any) => boolean | Promise<boolean>;
/**
 * 验证模式类型枚举
 * 定义了所有可用的验证模式类型常量
 */
export declare enum ValidationPatternType {
    EMAIL = "email",// 电子邮件验证
    URL = "url",// URL链接验证
    IPV4 = "ipv4",// IPv4地址验证
    IPV6 = "ipv6",// IPv6地址验证
    MAC_ADDRESS = "mac",// MAC地址验证
    PHONE = "phone",// 电话号码验证
    UUID = "uuid",// UUID格式验证
    BASE64 = "base64",// Base64编码验证
    HEX_COLOR = "hexColor",// 十六进制颜色值验证
    RGB_COLOR = "rgbColor",// RGB颜色值验证
    RGBA_COLOR = "rgbaColor",// RGBA颜色值验证
    CREDIT_CARD = "creditCard",// 信用卡号验证
    CHINESE_ID = "chineseId",// 中国身份证号验证
    CHINESE_POSTCODE = "chinesePostcode",// 中国邮政编码验证
    USERNAME = "username",// 用户名格式验证
    UPPERCASE = "uppercase",// 大写字母验证
    LOWERCASE = "lowercase",// 小写字母验证
    DIGIT = "digit",// 数字验证
    SPECIAL_CHAR = "specialChar"
}
export type PatternSwitches = {
    [K in ValidationPatternType]?: boolean;
};
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
export interface StringRule extends BaseValidationRule {
    type: 'string';
    trim?: boolean | 'all' | 'inner';
    minLength?: number;
    maxLength?: number;
    length?: number;
    includes?: any[] | ((rule: ValidationRule) => any[]);
    excludes?: any[] | ((rule: ValidationRule) => any[]);
}
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
    /** * 是否允许无限值 (Infinity/-Infinity)。
     * 默认为 false。如果为 true，遇到无限值时不报错但依然会 terminate 流程。
     */
    infinite?: boolean;
    includes?: any[] | ((rule: ValidationRule) => any[]);
    excludes?: any[] | ((rule: ValidationRule) => any[]);
}
export interface BooleanRule extends BaseValidationRule {
    type: 'boolean';
}
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
export interface ObjectRule extends BaseValidationRule {
    type: 'object';
    /** * 名验证（全集名单）：
     * 只有在这里列出的字段才允许存在，且必须存在。
     */
    requiredFields?: readonly string[];
    /** * 值验证（逻辑钩子）：
     * 仅用来定义字段的值怎么验。
     * 即使这里定义了 'age'，如果 requiredFields 里没写 'age'，
     * 传入的 age 也会被视为非法（因为它不在名单里）。
     */
    properties?: Record<string, ValidationRule | CustomValidationFunction>;
    /** * 此时这个布尔值的含义变得极度简单：
     * true: 允许 requiredFields 之外的字段（不管它们）。
     * false: 严格匹配 requiredFields，多一个都不行。
     */
    additionalProperties?: boolean;
}
export interface PasswordRule extends BaseValidationRule {
    type: 'password';
    trim?: boolean | 'all' | 'inner';
}
export interface CompareRule extends BaseValidationRule {
    type: 'compare';
    operator?: '=' | '!=' | '>' | '>=' | '<' | '<=';
    target?: any | ((rule: ValidationRule) => any);
    strict?: boolean;
}
export interface FileRule extends BaseValidationRule {
    type: 'file';
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
    minFiles?: number;
    maxFiles?: number;
}
export interface SplitRule extends BaseValidationRule, Omit<ArrayRule, 'type'>, // 继承数组的 minItems, maxItems, unique, itemRule 等
Omit<StringRule, 'type' | 'includes' | 'excludes'> {
    type: 'split';
    separator: string | RegExp;
}
export interface FormatRule extends Omit<BaseValidationRule, 'type'> {
    type: 'format';
    format?: Omit<ValidationPatternType, 'uppercase' | 'lowercase' | 'digit' | 'specialChar'> | string;
    pattern?: RegExp;
}
export type ValidationRule = StringRule | NumberRule | BooleanRule | DateRule | ArrayRule | ObjectRule | PasswordRule | CompareRule | FileRule | SplitRule | FormatRule;
//# sourceMappingURL=rule.d.ts.map