import { StringValidationOptions } from './types';
import {
    ValidationErrorCode,
    ValidationResult,
    createValidationSuccess,
    createValidationFailure,
    assertValidation,
} from '../../core';
import { allRules } from '../../composition';
import {
    isString,
    getRuleFunctions,
    isFunction
} from '../../rules';

export function validateString(
    value: any,
    options: StringValidationOptions = {}
): ValidationResult {
    const defaultOptions: StringValidationOptions = {
        required: false,
        nullable: false,
        trim: false,
        skipIfEmpty: false,
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

    // 2. 类型验证
    const typeResult = isString(value);
    if (!typeResult.isValid) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING, {
            value,
            options: defaultOptions,
        });
    }

    const stringValue = value as string;

    // 3. 预处理
    let processedValue = stringValue;
    if (defaultOptions.trim) {
        processedValue = processedValue.trim();
    }
    if (defaultOptions.toLowerCase) {
        processedValue = processedValue.toLowerCase();
    }
    if (defaultOptions.toUpperCase) {
        processedValue = processedValue.toUpperCase();
    }

    // 4. 空字符串跳过验证
    if (processedValue === '' && defaultOptions.skipIfEmpty) {
        return createValidationSuccess();
    }

    // 5. 必填字段的空字符串检查
    if (defaultOptions.required && processedValue === '') {
        return createValidationFailure(ValidationErrorCode.REQUIRED, {
            processedValue,
            options: defaultOptions,
        });
    }

    // 6. 获取所有验证规则函数（自动排除非规则键）
    const rules = getRuleFunctions(defaultOptions);
    
    // 7. 添加自定义验证（custom 不会被 getRuleFunctions 包含）
    if (isFunction(defaultOptions.custom).isValid) {
        rules.push(defaultOptions.custom!);
    }

    // 8. 执行所有验证规则
    return rules.length > 0 
        ? allRules(...rules)(processedValue) 
        : createValidationSuccess();
}

/**
 * 断言字符串
 * @param value 要验证的值
 * @param rules 验证规则
 * @param context 验证上下文 
 * @returns 
 */
export function assertString(
  value: string,
  rules: StringValidationOptions,
  context?: Record<string, any>
): string {
  const result = validateString(value, rules);
  assertValidation(result, context)
  
  return value; // 返回原始值，便于链式调用
}

