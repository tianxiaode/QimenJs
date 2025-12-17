import { ValidationResult } from '../../core'

/**
 * 字符串验证规则接口
 */
export interface StringValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => ValidationResult;
    trim?: boolean; // 是否自动去除首尾空格
    allowEmpty?: boolean; // 是否允许空字符串（与required配合使用）
    whitelist?: string[]; // 白名单
    blacklist?: string[]; // 黑名单
}

/**
 * 带分隔符字符串验证规则
 */
export interface DelimitedStringValidationRules {
    required?: boolean;
    delimiter?: string; // 分隔符，默认为逗号
    trimItems?: boolean; // 是否修剪项，默认为true
    allowEmptyItems?: boolean; // 是否允许空项，默认为false
    minItems?: number; // 最少项数
    maxItems?: number; // 最多项数
    itemMinLength?: number; // 单个项的最小长度
    itemMaxLength?: number; // 单个项的最大长度
    itemPattern?: RegExp; // 单个项的正则模式
    validateItem?: (item: string) => ValidationResult; // 自定义单项验证
}


