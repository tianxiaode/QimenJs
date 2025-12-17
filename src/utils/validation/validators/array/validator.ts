import {
    ValidationErrorCode,
    ValidationResult,
    createValidationSuccess,
    createValidationFailure,
    assertValidation,
} from '../../core';
import { isArray, getRuleFunctions, isFunction } from '../../rules';
import { allRules } from '../../composition';
import { ArrayValidationOptions } from './types';

/**
 * 验证数组
 */
export function validateArray<T = any>(
    value: any,
    options: ArrayValidationOptions<T> = {}
): ValidationResult {
    const defaultOptions: ArrayValidationOptions<T> = {
        required: false,
        nullable: false,
        allowEmpty: true,
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
    const typeResult = isArray(value);
    if (!typeResult.isValid) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, {
            value,
            options: defaultOptions,
        });
    }

    const arrayValue = value as T[];

    // 3. 空数组检查
    if (arrayValue.length === 0 && !defaultOptions.allowEmpty) {
        return createValidationFailure(ValidationErrorCode.EMPTY_ARRAY, {
            value,
            options: defaultOptions,
        });
    }

    // 4. 构建规则选项对象，供 getRuleFunctions 使用
    const ruleOptions: Record<string, any> = {};

    // 长度验证规则
    if (defaultOptions.minLength !== undefined) {
        ruleOptions.minArrayLength = defaultOptions.minLength;
    }
    if (defaultOptions.maxLength !== undefined) {
        ruleOptions.maxArrayLength = defaultOptions.maxLength;
    }
    if (defaultOptions.exactLength !== undefined) {
        ruleOptions.exactArrayLength = defaultOptions.exactLength;
    }

    // 唯一性验证
    if (defaultOptions.unique) {
        ruleOptions.unique = true;
    }
    if (defaultOptions.uniqueBy) {
        ruleOptions.uniqueBy = defaultOptions.uniqueBy;
    }

    // 排序验证
    if (defaultOptions.sorted !== undefined) {
        ruleOptions.sorted = defaultOptions.sorted;
    }

    // 元素类型验证
    if (defaultOptions.itemType) {
        ruleOptions.itemType = defaultOptions.itemType;
    }
    if (defaultOptions.itemTypeCheck) {
        ruleOptions.itemTypeCheck = defaultOptions.itemTypeCheck;
    }

    // 包含验证
    if (defaultOptions.allowedValues) {
        ruleOptions.containsOnly = defaultOptions.allowedValues;
    }
    if (defaultOptions.mustContain) {
        ruleOptions.containsAll = defaultOptions.mustContain;
    }
    if (defaultOptions.mustNotContain) {
        ruleOptions.containsNone = defaultOptions.mustNotContain;
    }
    if (defaultOptions.anyOf) {
        ruleOptions.containsAny = defaultOptions.anyOf;
    }

    // 5. 获取所有验证规则
    const rules = getRuleFunctions(ruleOptions);

    // 6. 添加数组元素验证规则（如果有）
    if (isFunction(defaultOptions.itemValidation).isValid) {
        rules.push(createItemValidationRule(defaultOptions));
    }

    // 7. 添加自定义验证规则（如果有）
    if (isFunction(defaultOptions.custom).isValid) {
        rules.push(defaultOptions.custom!);
    }

    // 8. 执行所有验证规则
    return rules.length > 0 ? allRules(...rules)(arrayValue) : createValidationSuccess();
}

/**
 * 创建元素验证规则
 */
function createItemValidationRule<T>(
    options: ArrayValidationOptions<T>
): (value: T[]) => ValidationResult {
    const { itemValidation } = options;
    const errors: any[] = [];

    return (array: T[]): ValidationResult => {
        let isValid = true;
        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            const itemResult = itemValidation!(item, i);
            if (itemResult.isValid === false) {
                isValid = false;
                errors.push(itemResult.errors);
                break;
            }
        }

        return isValid
            ? createValidationSuccess()
            : createValidationFailure(ValidationErrorCode.ITEM_VALIDATION_FAILED, { errors });
    };
}


/**
 * 断言数字
 * @param value 要验证的值
 * @param rules 验证规则
 * @param context 验证上下文 
 * @returns 
 */
export function assertArray(
  value: string,
  rules: ArrayValidationOptions,
  context?: Record<string, any>
): string {
  const result = validateArray(value, rules);
  assertValidation(result, context)
  
  return value; // 返回原始值，便于链式调用
}

