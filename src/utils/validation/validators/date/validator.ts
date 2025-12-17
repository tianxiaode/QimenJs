import { DateValidationOptions } from './types';
import {
    ValidationErrorCode,
    ValidationResult,
    createValidationSuccess,
    createValidationFailure,
    assertValidation,
} from '../../core';
import { allRules } from '../../composition';
import { isFunction, getRuleFunctions } from '../../rules';

/**
 * 验证日期
 * @param value 要验证的值
 * @param options 验证选项
 * @returns 验证结果
 */
export function validateDate(
    value: any,
    options: DateValidationOptions = {}
): ValidationResult {
    const defaultOptions: DateValidationOptions = {
        required: false,
        nullable: false,
        allowInvalid: false,
        strict: false,
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

    let dateValue: Date;

    // 2. 类型转换和验证
    if (value instanceof Date) {
        dateValue = value;
    } else if (defaultOptions.strict) {
        // 严格模式下必须是 Date 实例
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, {
            value,
            options: defaultOptions,
        });
    } else {
        // 尝试转换为日期
        dateValue = new Date(value);
    }

    // 3. 获取所有验证规则函数（自动排除非规则键）
    const rules = getRuleFunctions(defaultOptions);
    
    // 4. 添加自定义验证
    if (isFunction(defaultOptions.custom).isValid) {
        rules.push(defaultOptions.custom!);
    }

    // 5. 执行所有验证规则
    return rules.length > 0 
        ? allRules(...rules)(dateValue) 
        : createValidationSuccess();
}

/**
 * 断言日期
 * @param value 要验证的值
 * @param rules 验证规则
 * @param context 验证上下文 
 * @returns 验证后的日期值
 */
export function assertDate(
  value: Date,
  rules: DateValidationOptions,
  context?: Record<string, any>
): Date {
  const result = validateDate(value, rules);
  assertValidation(result, context)
  
  return value;
}