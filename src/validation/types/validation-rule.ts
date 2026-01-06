import { ValidationProcessorHandler } from "./processor";

type CustomValidationFunction = (value: any, rule: ValidationRule) => boolean | Promise<boolean>;

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
    BASE64 = 'base65', // Base64编码验证
    HEX_COLOR = 'hexColor', // 十六进制颜色值验证
    RGB_COLOR = 'rgbColor', // RGB颜色值验证
    RGBA_COLOR = 'rgbaColor', // RGBA颜色值验证
    CREDIT_CARD = 'creditCard', // 信用卡号验证
    CHINESE_ID = 'chinseId', // 中国身份证号验证
    CHINESE_POSTCODE = 'chinesePostcode', // 中国邮政编码验证
    USERNAME = 'username', // 用户名格式验证
    UPPERCASE = 'uppercase', // 大写字母验证
    LOWERCASE = 'lowercase', // 小写字母验证
    DIGIT = 'digit', // 数字验证
    SPECIAL_CHAR = 'specialChar', // 特殊字符验证
}

// 1. 定义内置模式开关
export type PatternSwitches = {
    [K in ValidationPatternType]?: boolean;
};

// 基础识别字段
interface BasicIdentificationConstraints {
    type?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'password';
    message?: string;
    default?: any; // 当输入为空时的兜底值
    transform?: (val: any, rule: ValidationRule) => any; // 物理转换逻辑
}

// 存在性与清洗字段
interface ExistenceAndSanitizationConstraints {
    required?: boolean;
    nullable?: boolean;
    trim?: boolean | 'all' | 'inner';
    separator?: string | RegExp; // 开启此项，自动切换为数组逻辑
}

// 语义化快捷预设字段
interface SemanticConstraints {
    format?: ValidationPatternType | string; 
    period?: 'future' | 'past' | 'today' | 'tomorrow' | 'yesterday';
    is?: 'file' | 'image' | 'blob' | 'buffer';
    
    // 文本模式约束
    pattern?: RegExp;
    uppercase?: boolean;
    lowercase?: boolean;
    digit?: boolean;
    specialChar?: boolean;
}

// 范围与关系约束字段
interface RangeRelationConstraints {
    // 基础物理量
    min?: number;
    max?: number;
    exact?: number;

    // 逻辑关联
    enum?: any[] | ((rule: ValidationRule) => any[]);
    operator?: '===' | '!==' | '>' | '>=' | '<' | '<=';
    target?: any | ((rule: ValidationRule) => any);
}

// 集合约束字段
interface CollectionConstraints {
    // 拆分控制
    separator?: string | RegExp; 
    allowEmptyItem?: boolean;
    
    // 子项规则与报错控制
    itemRule?: CustomValidationFunction | ValidationRule; // 统一子项规则
    allItemsError?: boolean; 
    
    // 集合数量约束 (物理隔离，不与 min/max 混淆)
    minItems?: number;
    maxItems?: number;
    
    // 数组特有
    unique?: boolean;
    uniqueBy?: string | ((item: any, rule: ValidationRule) => any);
    children?: ValidationRule[]; // 对应你定义的数组项统一递归
}

// 对象约束字段
interface ObjectConstraints {
    properties?: Record<string, ValidationRule | ValidationRule[]>;
    requiredFields?: readonly string[];
    allowKeys?: string[];
    denyKeys?: string[];
    additionalProperties?: boolean;
    
    // 对象子属性递归
    mapping?: Record<string, ValidationRule[]>;
}

// 验证行为约束字段
interface ValidationBehaviorConstraints {
    /** * 严格模式：
     * true: 强制类型匹配，禁止自动 trim 等
     * false: 允许隐式转换
     */
    strict?: boolean;

    /** * 错误收集模式：
     * true: 跑完该字段关联的所有 Station，收集所有错误
     * false: 一旦某个 Station 报错，立即停止该规则的后续校验
     */
    allErrors?: boolean;
}

// 整合所有约束接口
export interface ValidationRule 
    extends BasicIdentificationConstraints,
            ExistenceAndSanitizationConstraints,
            SemanticConstraints,
            RangeRelationConstraints,
            CollectionConstraints,
            ObjectConstraints,
            ValidationBehaviorConstraints,
            PatternSwitches {
    [key: string]: any;
}