import { ValidationErrorCode } from '../../../core';
import { isArray } from '../../types';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../../core';

/**
 * 检查数组是否只包含允许的值
 */
export function containsOnly<T>(allowedValues: T[]): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (!allowedValues.includes(item)) {
                return createValidationFailure(ValidationErrorCode.NOT_ALLOWED, {
                    index: i,
                    value: item,
                    allowedValues,
                });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 检查数组是否包含所有必须的值
 */
export function containsAll<T>(requiredValues: T[]): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        const missingItems = requiredValues.filter(item => !value.includes(item));
        if (missingItems.length > 0) {
            return createValidationFailure(ValidationErrorCode.MISSING_FIELD, {
                missingItems,
                requiredValues,
            });
        }

        return createValidationSuccess();
    };
}

/**
 * 检查数组是否不包含任何排除的值
 */
export function containsNone<T>(excludedValues: T[]): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (excludedValues.includes(item)) {
                return createValidationFailure(ValidationErrorCode.NOT_ALLOWED, {
                    index: i,
                    value: item,
                    disallowedValues: excludedValues,
                });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 检查数组是否包含至少一个指定值
 */
export function containsAny<T>(possibleValues: T[]): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        const found = possibleValues.some(item => value.includes(item));
        if (!found) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
                possibleValues,
            });
        }

        return createValidationSuccess();
    };
}