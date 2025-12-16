// rules/constraints/range.ts
import { ValidationErrorCode } from '../core/constants';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../core';
import { isNumber } from '../rules';

/**
 * 检查是否为有效索引（非负整数）
 */
export function isArrayIndex(value: any): ValidationResult {
    // 复用已有的整数类型检查
    const integerCheck = isNumber(value);
    if (!integerCheck.isValid) {
        return integerCheck;
    }

    if (!Number.isInteger(value) || value < 0 || value >= 2 ** 32 - 1) {
        return createValidationFailure(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, {
            min: 0,
            max: 2 ** 32 - 2,
            actual: value,
        });
    }

    return createValidationSuccess();
}

/**
 * 检查是否为有效的属性键（字符串、符号或数字）
 */
export function isPropertyKey(value: any): ValidationResult {
    const isValid =
        typeof value === 'string' || typeof value === 'symbol' || typeof value === 'number';

    if (isValid) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.INVALID_PROPERTY_KEY, { value });
}