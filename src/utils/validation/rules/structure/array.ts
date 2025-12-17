import { ValidationErrorCode } from '../../core';
import { isArray } from '../types';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';
import { getLength, checkLength, hasSize } from '../size';

/**
 * 检查是否为数组且具有最小长度
 */
export function hasMinArrayLength(min: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        // 使用已有的长度检查逻辑
        return checkLength(length => length >= min, ValidationErrorCode.MIN_LENGTH, { min })(value);
    };
}

/**
 * 检查是否为数组且具有最大长度
 */
export function hasMaxArrayLength(max: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        // 使用已有的长度检查逻辑
        return checkLength(length => length <= max, ValidationErrorCode.MAX_LENGTH, { max })(value);
    };
}

/**
 * 检查数组长度是否在指定范围内
 */
export function hasArrayLengthBetween(min: number, max: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        // 复用 range.ts 中的 hasSize 方法，专门针对数组
        return hasSize(value, min, max);
    };
}

/**
 * 检查数组是否具有精确长度
 */
export function hasExactArrayLength(expectedLength: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        const length = getLength(value);

        if (length === expectedLength) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.LENGTH_MISMATCH, {
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
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        const length = getLength(value);

        if (allowedLengths.includes(length!)) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.LENGTH_NOT_ONE_OF, {
            value,
            allowedLengths,
            actual: length,
        });
    };
}

/**
 * 检查是否为空数组
 */
export function isEmptyArray(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        if (value.length === 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, {
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
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        if (value.length > 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.EMPTY_ARRAY, { value });
    };
}
