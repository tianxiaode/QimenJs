// utils/validation/rules/array/length.ts
import { ValidationErrorCode } from '../../../core';
import { isArray } from '../../types';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../../core';
import { checkLength, hasSize, getLength } from '../../size';

/**
 * 检查是否为数组且具有最小长度
 */
export function hasMinArrayLength(min: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        // 使用已有的长度检查逻辑
        return checkLength(length => length >= min, ValidationErrorCode.TOO_SMALL, { min })(value);
    };
}

/**
 * 检查是否为数组且具有最大长度
 */
export function hasMaxArrayLength(max: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        // 使用已有的长度检查逻辑
        return checkLength(length => length <= max, ValidationErrorCode.TOO_LARGE, { max })(value);
    };
}

/**
 * 检查数组长度是否在指定范围内
 */
export function hasArrayLengthBetween(min: number, max: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        // 复用 range.ts 中的 hasSize 方法，专门针对数组
        return hasSize(value, min, max);
    };
}

/**
 * 检查是否为空数组
 */
export function isEmptyArray(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        if (value.length === 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
            value,
            actualLength: value.length,
        });
    };
}

/**
 * 检查是否为非空数组
 */
export function isNonEmptyArray(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        if (value.length > 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.TOO_SMALL, {
            value,
            min: 1,
        });
    };
}

/**
 * 检查数组是否具有精确长度
 */
export function hasExactArrayLength(expectedLength: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        const length = getLength(value);

        if (length === expectedLength) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
            value,
            expected: expectedLength,
            actual: length,
        });
    };
}

/**
 * 检查数组长度是否为指定值之一
 */
export function hasArrayLengthOneOf(allowedLengths: number[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        const length = getLength(value);

        if (allowedLengths.includes(length!)) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_ALLOWED, {
            value,
            allowedValues: allowedLengths,
            actual: length,
        });
    };
}
