import { ValidationTag } from './processor';

export type CustomValidationFunction = (
    value: any,
    index: number,
    rule: ValidationRule,
    context: any
) => boolean | Promise<boolean>;

/**
 * 验证模式类型枚举
 * 定义了所有可用的验证模式类型常量
 */
export enum ValidationPatternType {
    EMAIL = 'email', // 电子邮件验证
    URL = 'url', // URL链接验证
    IPV4 = 'ipv4', // IPv4地址验证
    IPV6 = 'ipv6', // IPv6地址验证
    MAC_ADDRESS = 'mac', // MAC地址验证
    PHONE = 'phone', // 电话号码验证
    UUID = 'uuid', // UUID格式验证
    BASE64 = 'base64', // Base64编码验证
    HEX_COLOR = 'hexColor', // 十六进制颜色值验证
    RGB_COLOR = 'rgbColor', // RGB颜色值验证
    RGBA_COLOR = 'rgbaColor', // RGBA颜色值验证
    CREDIT_CARD = 'creditCard', // 信用卡号验证
    CHINESE_ID = 'chineseId', // 中国身份证号验证
    CHINESE_POSTCODE = 'chinesePostcode', // 中国邮政编码验证
    USERNAME = 'username', // 用户名格式验证
    UPPERCASE = 'uppercase', // 大写字母验证
    LOWERCASE = 'lowercase', // 小写字母验证
    DIGIT = 'digit', // 数字验证
    SPECIAL_CHAR = 'specialChar', // 特殊字符验证,
}

export type PatternSwitches = {
    [K in ValidationPatternType]?: boolean;
};

// 基础验证规则类型 - 用于派生特定类型规则
export interface BaseValidationRule {
    // 验证类型，必须是预定义的类型之一
    type: ValidationTag;

    // 基础标识字段
    message?: string;
    default?: any; // 当输入为空时的兜底值
    transform?: (val: any, rule: ValidationRule) => any; // 物理转换逻辑

    // 存在性字段
    required?: boolean;
    nullable?: boolean;
    empty?: boolean;

    // 错误收集模式：true表示收集所有错误，false表示遇到第一个错误就停止
    allErrors?: boolean;

    [key: string]: any;
}

// 字符串验证规则
export interface StringRule extends BaseValidationRule {
    type: 'string';

    // 清洗字段 - 只在字符串类型中存在
    trim?: boolean | 'all' | 'inner';

    // 长度验证
    minLength?: number;
    maxLength?: number;
    length?: number;

    // 包含/排除验证
    includes?: any[] | ((rule: ValidationRule) => any[]);
    excludes?: any[] | ((rule: ValidationRule) => any[]);
}

// 数字验证规则
export interface NumberRule extends BaseValidationRule {
    type: 'number';

    // 范围验证
    min?: number;
    max?: number;
    exact?: number;

    // 数字特有验证
    integer?: boolean;
    positive?: boolean;
    negative?: boolean;
    even?: boolean;
    odd?: boolean;
    /** * 是否允许无限值 (Infinity/-Infinity)。
     * 默认为 false。如果为 true，遇到无限值时不报错但依然会 terminate 流程。
     */
    infinite?: boolean;

    // 包含/排除验证
    includes?: any[] | ((rule: ValidationRule) => any[]);
    excludes?: any[] | ((rule: ValidationRule) => any[]);
}

// 布尔验证规则
export interface BooleanRule extends BaseValidationRule {
    type: 'boolean';
}

// 日期验证规则
export interface DateRule extends BaseValidationRule {
    type: 'date';

    // 范围验证
    min?: Date;
    max?: Date;

    // 日期特殊属性
    future?: boolean;
    past?: boolean;
    today?: boolean;
    tomorrow?: boolean;
    yesterday?: boolean;
    weekend?: number | number[];

    // 包含/排除验证
    includes?: any[] | ((rule: ValidationRule) => any[]);
    excludes?: any[] | ((rule: ValidationRule) => any[]);
}

// 数组验证规则
export interface ArrayRule extends BaseValidationRule {
    type: 'array';

    // 子项规则与报错控制
    itemRule?: CustomValidationFunction | ValidationRule; // 统一子项规则
    allItemsError?: boolean;
    allowEmptyItem?: boolean;

    // 集合数量约束
    minLength?: number;
    maxLength?: number;
    length?: number;

    // 数组特有
    unique?: boolean;
    uniqueBy?: string | ((item: any, rule: ValidationRule) => any);

    // 包含/排除验证
    includes?: any[] | ((rule: ValidationRule) => any[]);
    excludes?: any[] | ((rule: ValidationRule) => any[]);
}

// 对象验证规则
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

// 密码验证规则 - 独立密码验证，不与字符串规则混合
export interface PasswordRule extends BaseValidationRule {
    type: 'password';

    // 长度验证
    trim?: boolean | 'all' | 'inner';
}

// 比较验证规则
export interface CompareRule extends BaseValidationRule {
    type: 'compare';

    // 比较特有属性
    operator?: '=' | '!=' | '>' | '>=' | '<' | '<=';
    target?: any | ((rule: ValidationRule) => any);

    // 严格模式：强制类型匹配，禁止自动转换
    strict?: boolean;
}

// 文件验证规则
export interface FileRule extends BaseValidationRule {
    type: 'file';

    // 文件特有属性
    maxSize?: number;
    allowedTypes?: string[]; // MIME类型
    allowedExtensions?: string[];
    minFiles?: number;
    maxFiles?: number;
}


export interface SplitRule
    extends
        BaseValidationRule,
        Omit<ArrayRule, 'type'>, // 继承数组的 minItems, maxItems, unique, itemRule 等
        Omit<StringRule, 'type' | 'is' | 'format' | 'pattern' | 'includes' | 'excludes'> {
    // 继承字符串的 trim, minLength (原串长度) 等
    type: 'split';

    // 核心特殊属性
    separator: string | RegExp;

    // 明确语义：这里的 min/max 到底指什么？
    // 我们可以约定：minLength/maxLength 指原始字符串长度
    // minItems/maxItems 指拆分后的项数（由 ArrayRule 提供）
}

// 1. 基础公共属性
interface BaseFormatPart extends Omit<BaseValidationRule, 'type' | 'required'> {
    type: 'format';
    required: true;
}

// 2. 日期专用部分
interface DateFormatPart extends BaseFormatPart {
    format: 'date';
    dateFormat?: string;
}

// 3. 数字专用部分
interface NumberFormatPart extends BaseFormatPart {
    format: 'number';
    precision?: number;
    min?: number;
    max?: number;
}

// 4. 通用模式部分（正则/枚举）
interface PatternFormatPart extends BaseFormatPart {
    format: string; // 其他普通字符串模板
    pattern?: Omit<ValidationPatternType, 'uppercase' | 'lowercase' | 'digit' | 'specialChar'>;
    regexp?: string | RegExp;
}

// --- 最终组合：这就是你要的 FormatRule ---
export type FormatRule = DateFormatPart | NumberFormatPart | PatternFormatPart;

// 整合所有约束接口 - 作为联合类型
export type ValidationRule =
    | StringRule
    | NumberRule
    | BooleanRule
    | DateRule
    | ArrayRule
    | ObjectRule
    | PasswordRule
    | CompareRule
    | FileRule
    | SplitRule
    | FormatRule;
