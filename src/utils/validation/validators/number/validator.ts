import {
    ValidationErrorCode,
    ValidationResult,
    createValidationSuccess,
    createValidationFailure,
    assertValidation,
} from '../../core';
import { allRules } from '../../composition';
import { getRuleFunctions } from '../../rules';
import { NumberValidationOptions } from './types';


/**
 * 验证数字
 */
export function validateNumber(
    value: any,
    options: NumberValidationOptions = {}
): ValidationResult {
    const defaultOptions: NumberValidationOptions = {
        required: false,
        nullable: false,
        allowNaN: false,
        allowInfinite: false,
        ...options,
    };

    // 1. 空值处理
    if (value == null) {
        if (defaultOptions.nullable) {
            return createValidationSuccess();
        }
        if (defaultOptions.required) {
            return createValidationFailure(ValidationErrorCode.REQUIRED, {
                value,
                options: defaultOptions,
            });
        }
        return createValidationSuccess();
    }

    // 2. 类型验证 - 必须是数字类型
    if (typeof value !== 'number') {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, {
            value,
            options: defaultOptions,
        });
    }

    const numberValue = value as number;

    // 3. 特殊数值处理 (NaN, Infinity)
    if (isNaN(numberValue)) {
        if (defaultOptions.allowNaN) {
            return createValidationSuccess();
        }
        return createValidationFailure(ValidationErrorCode.TYPE_IS_NAN, {
            value,
            options: defaultOptions,
        });
    }

    if (!isFinite(numberValue)) {
        if (defaultOptions.allowInfinite) {
            return createValidationSuccess();
        }
        return createValidationFailure(ValidationErrorCode.TYPE_IS_INFINITE, {
            value,
            options: defaultOptions,
        });
    }

    // 4. 构建用于规则映射的选项
    const ruleOptions: Record<string, any> = {
        // 基础选项
        required: defaultOptions.required,
        nullable: defaultOptions.nullable,
        
        // 数值范围
        minValue: defaultOptions.min,
        maxValue: defaultOptions.max,
        exact: defaultOptions.exact,
        range: defaultOptions.range,
        exclusiveRange: defaultOptions.exclusiveRange,
        
        // 数值特性
        integer: defaultOptions.integer,
        positive: defaultOptions.positive,
        negative: defaultOptions.negative,
        zero: defaultOptions.zero,
        
        // 值列表验证
        allowedValues: defaultOptions.allowedValues,
        disallowedValues: defaultOptions.disallowedValues,
        
        // 自定义验证
        custom: defaultOptions.custom,
    };

    // 5. 获取所有验证规则函数
    const rules = getRuleFunctions(ruleOptions);
    
    // 6. 执行所有验证规则
    if (rules.length > 0) {
        return allRules(...rules)(numberValue);
    }
    
    return createValidationSuccess();
}

/**
 * 断言数字
 */
export function assertNumber(
    value: number,
    rules: NumberValidationOptions,
    context?: Record<string, any>
): number {
    const result = validateNumber(value, rules);
    assertValidation(result, context);
    
    return value; // 返回原始值，便于链式调用
}

/**
 * 创建数值范围验证器（快捷方式）
 */
export function createNumberRangeValidator(
    min?: number,
    max?: number,
    options: Omit<NumberValidationOptions, 'min' | 'max'> = {}
) {
    return (value: any) => validateNumber(value, { ...options, min, max });
}

/**
 * 创建整数验证器（快捷方式）
 */
export function createIntegerValidator(
    options: Omit<NumberValidationOptions, 'integer'> = {}
) {
    return (value: any) => validateNumber(value, { ...options, integer: true });
}

/**
 * 创建正数验证器（快捷方式）
 */
export function createPositiveNumberValidator(
    options: Omit<NumberValidationOptions, 'positive'> = {}
) {
    return (value: any) => validateNumber(value, { ...options, positive: true });
}

/**
 * 创建负数验证器（快捷方式）
 */
export function createNegativeNumberValidator(
    options: Omit<NumberValidationOptions, 'negative'> = {}
) {
    return (value: any) => validateNumber(value, { ...options, negative: true });
}