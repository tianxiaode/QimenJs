// src/utils/validation/adapters/predefined-maps.ts
import {
    isRequired,
    isString,
    isNumber,
    isDate,
    isBoolean,
    isFalsy,
    isTruthy,
} from '../rules';
import {
    hasMinLength,
    hasMaxLength,
    hasLengthBetween,
    hasMaxValue,
    hasMinValue,
    isLessThan,
    isBetween,
    isEqualTo,
    isNotEqualTo,
    isGreaterThan,
    isGreaterThanOrEqual,
    isLessThanOrEqual,
    isInCollection,
    isNotInCollection,
} from '../constraints';
import {
    isEmail,
    isIPv4,
    isIPv6,
    isMACAddress,
    isNumericString,
    isPhoneNumber,
    isURL,
    isUsername,
    isUUID,
    hasPasswordStrength,
    matchesPattern,
} from '../patterns';
import { buildDelimitedStringValidator } from '../builders';

/**
 * 预定义的关键词到验证函数的映射
 * 格式: { [keyword]: (ruleValue: any) => ValidationFunction }
 */
export const PREDEFINED_KEYWORD_MAP = {
    // 基础验证关键词
    required: () => isRequired,
    string: () => isString,
    number: () => isNumber,
    date: () => isDate,
    boolean: () => isBoolean,
    truthy: () => isTruthy,
    falsy: () => isFalsy,

    // 长度验证关键词
    min: (value: number) => hasMinLength(value),
    minimum: (value: number) => hasMinLength(value), // 别名
    max: (value: number) => hasMaxLength(value),
    maximum: (value: number) => hasMaxLength(value), // 别名
    len: (value: number) => (val: string) => {
        const minResult = hasMinLength(value)(val);
        const maxResult = hasMaxLength(value)(val);
        // 简单组合两个结果
        if (minResult.isValid && maxResult.isValid) {
            return { isValid: true, errors: [] };
        }
        return {
            isValid: false,
            errors: [...minResult.errors, ...maxResult.errors],
        };
    },
    length: (value: number) => (val: string) => {
        const minResult = hasMinLength(value)(val);
        const maxResult = hasMaxLength(value)(val);
        if (minResult.isValid && maxResult.isValid) {
            return { isValid: true, errors: [] };
        }
        return {
            isValid: false,
            errors: [...minResult.errors, ...maxResult.errors],
        };
    },
    lengthBetween: (value: [number, number]) => hasLengthBetween(value[0], value[1]),

    // 数值比较关键词
    lessThan: (value: number) => isLessThan(value),
    lt: (value: number) => isLessThan(value), // 别名
    greaterThan: (value: number) => isGreaterThan(value),
    gt: (value: number) => isGreaterThan(value), // 别名
    lessThanOrEqual: (value: number) => isLessThanOrEqual(value),
    lte: (value: number) => isLessThanOrEqual(value), // 别名
    greaterThanOrEqual: (value: number) => isGreaterThanOrEqual(value),
    gte: (value: number) => isGreaterThanOrEqual(value), // 别名
    equal: (value: any) => isEqualTo(value),
    equalTo: (value: any) => isEqualTo(value), // 别名
    notEqual: (value: any) => isNotEqualTo(value),
    notEqualTo: (value: any) => isNotEqualTo(value), // 别名
    between: (value: [number, number]) => isBetween(value[0], value[1]),

    // 数值范围验证关键词
    minValue: (value: number) => hasMinValue(value),
    maxValue: (value: number) => hasMaxValue(value),

    // 集合成员验证
    in: (value: any[]) => isInCollection(value),
    notIn: (value: any[]) => isNotInCollection(value),
    includes: (value: any[]) => isInCollection(value), // 别名
    excludes: (value: any[]) => isNotInCollection(value), // 别名

    // 正则表达式相关关键词
    pattern: (value: RegExp) => matchesPattern(value),
    regex: (value: RegExp) => matchesPattern(value), // 别名

    // 预定义模式关键词
    email: () => isEmail,
    ipv4: () => isIPv4,
    ipv6: () => isIPv6,
    mac: () => isMACAddress,
    macAddress: () => isMACAddress, // 别名
    numeric: () => isNumericString,
    phone: () => isPhoneNumber,
    mobile: () => isPhoneNumber, // 别名
    url: () => isURL,
    username: () => isUsername,
    uuid: () => isUUID,

    // 密码强度验证
    passwordStrength: (value: any) => hasPasswordStrength(value),

    // 分隔符字符串验证器构建器
    delimited: (config: { delimiter?: string; trim?: boolean; required?: boolean }) => 
        buildDelimitedStringValidator(config),
} as const;

// 预定义的关键词别名映射
export const KEYWORD_ALIASES = {
    minimum: 'min',
    maximum: 'max',
    length: 'len',
    regex: 'pattern',
    mobile: 'phone',
    macAddress: 'mac',
    includes: 'in',
    excludes: 'notIn',
    equal: 'equalTo',
    notEqual: 'notEqualTo',
    lt: 'lessThan',
    gt: 'greaterThan',
    lte: 'lessThanOrEqual',
    gte: 'greaterThanOrEqual',
} as const;

// 常用的组合规则
export const PREDEFINED_COMPOSITE_RULES = {
    // 强密码: 至少8位，包含大小写字母和数字
    strongPassword: {
        min: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    },

    // 用户名: 3-20位字母、数字或下划线
    username: {
        min: 3,
        max: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
    },

    // 邮箱（显式定义）
    emailAddress: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    
    // 手机号
    phoneNumber: {
        pattern: /^1[3-9]\d{9}$/,
    },
    
    // URL
    webUrl: {
        pattern: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
    },
} as const;