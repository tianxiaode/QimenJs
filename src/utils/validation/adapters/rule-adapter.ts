import { ValidationResult } from '../core';
import {
    validateString,
    validateNumber,
    validateArray,
    validateObject,
    validateBoolean,
    validateDate,
} from '../validators';

// 数据类型映射
export const DataType = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    ARRAY: 'array',
    OBJECT: 'object',
    DATE: 'date',
    ANY: 'any',
} as const;

type DataType = (typeof DataType)[keyof typeof DataType];

/**
 * 根据数据类型转换通用规则为特定规则
 */
function convertRulesByType(rules: Record<string, any>, dataType: DataType): Record<string, any> {
    const convertedRules = { ...rules };

    // 删除可能的type字段，避免重复
    delete convertedRules.type;

    // 根据数据类型转换通用规则
    switch (dataType) {
        case DataType.STRING:
            // 字符串：min/max -> minLength/maxLength
            if (rules.min !== undefined) {
                convertedRules.minLength = rules.min;
                delete convertedRules.min;
            }
            if (rules.max !== undefined) {
                convertedRules.maxLength = rules.max;
                delete convertedRules.max;
            }
            if (rules.length !== undefined) {
                convertedRules.exactLength = rules.length;
                delete convertedRules.length;
            }
            break;

        case DataType.NUMBER:
            // 数字：min/max -> minValue/maxValue
            if (rules.min !== undefined) {
                convertedRules.minValue = rules.min;
                delete convertedRules.min;
            }
            if (rules.max !== undefined) {
                convertedRules.maxValue = rules.max;
                delete convertedRules.max;
            }
            break;

        case DataType.ARRAY:
            // 数组：min/max -> minArrayLength/maxArrayLength
            if (rules.min !== undefined) {
                convertedRules.minArrayLength = rules.min;
                delete convertedRules.min;
            }
            if (rules.max !== undefined) {
                convertedRules.maxArrayLength = rules.max;
                delete convertedRules.max;
            }
            if (rules.length !== undefined) {
                convertedRules.exactArrayLength = rules.length;
                delete convertedRules.length;
            }
            break;
    }

    return convertedRules;
}

/**
 * 根据数据类型选择验证函数
 */
function getValidatorByType(dataType: DataType) {
    switch (dataType) {
        case DataType.STRING:
            return validateString;
        case DataType.NUMBER:
            return validateNumber;
        case DataType.ARRAY:
            return validateArray;
        case DataType.OBJECT:
            return validateObject;
        case DataType.BOOLEAN:
            return validateBoolean;
        case DataType.DATE:
            return validateDate;
        default:
            // 默认使用字符串验证器
            return validateString;
    }
}

/**
 * 创建 UI 框架验证器
 */
export function createUIValidator(uiRules: any) {
    // 确定数据类型
    const dataType = uiRules.type || DataType.STRING;

    // 转换规则
    const convertedRules = convertRulesByType(uiRules, dataType);

    // 获取对应的验证函数
    const validator = getValidatorByType(dataType);

    // 返回验证器函数
    return (value: any) => {
        return validator(value, convertedRules as any) as ValidationResult;
    };
}
