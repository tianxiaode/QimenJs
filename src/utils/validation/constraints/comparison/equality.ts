// rules/constraints/comparison/equality.ts
import { ComparisonOperation, createComparisonValidator } from './numeric';
import { ValidationResult, createValidationSuccess, createValidationFailure } from '../../core';
import { ValidationErrorCode } from '../../core/constants';

/**
 * 检查值是否等于期望值
 */
export function isEqualTo(
    expected: any,
    strict: boolean = true
): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.EQUAL, expected, strict);
}

/**
 * 检查值是否不等于某个值
 */
export function isNotEqualTo(
    notExpected: any,
    strict: boolean = true
): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.NOT_EQUAL, notExpected, strict);
}

/**
 * 检查两个值是否为相同类型
 */
export function isSameType(a: any, b: any): ValidationResult {
    // 处理 null 和 undefined
    if (a === null || a === undefined || b === null || b === undefined) {
        const isSame = a === b;
        if (isSame) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_SAME_TYPE, { a, b });
    }

    // 特殊处理数组
    const aIsArray = Array.isArray(a);
    const bIsArray = Array.isArray(b);
    if (aIsArray && bIsArray) {
        return createValidationSuccess();
    }

    if (aIsArray !== bIsArray) {
        return createValidationFailure(ValidationErrorCode.NOT_SAME_TYPE, { a, b });
    }

    // 特殊处理对象
    const aIsObject = typeof a === 'object';
    const bIsObject = typeof b === 'object';
    if (aIsObject && bIsObject) {
        return createValidationSuccess();
    }

    // 其他类型使用 typeof
    const isSame = typeof a === typeof b;
    if (isSame) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_SAME_TYPE, { a, b });
}