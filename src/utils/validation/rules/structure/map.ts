import { ValidationErrorCode } from '../../core';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';
import { isMap } from '../types';

/**
 * 检查Map是否具有指定的键
 */
export function hasMapKey(key: any): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_MAP, { value });
        }

        if (value.has(key)) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.MISSING_KEY, { value, key });
    };
}

/**
 * 检查Map是否具有所有指定的键
 */
export function hasMapKeys(requiredKeys: any[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_MAP, { value });
        }

        for (const key of requiredKeys) {
            if (!value.has(key)) {
                return createValidationFailure(ValidationErrorCode.MISSING_KEY, { value, key });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 检查Map是否具有至少一个指定的键
 */
export function hasAnyMapKey(keys: any[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_MAP, { value });
        }

        for (const key of keys) {
            if (value.has(key)) {
                return createValidationSuccess();
            }
        }

        return createValidationFailure(ValidationErrorCode.MISSING_KEYS, { value, keys });
    };
}

/**
 * 检查Map是否不包含指定的键
 */
export function hasNoMapKey(forbiddenKeys: any[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_MAP, { value });
        }

        for (const key of forbiddenKeys) {
            if (value.has(key)) {
                return createValidationFailure(ValidationErrorCode.FORBIDDEN_KEY, { value, key });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 检查Map是否为空
 */
export function isEmptyMap(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_MAP, { value });
        }

        if (value.size === 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_EMPTY_MAP, {
            value,
            actualSize: value.size,
        });
    };
}

/**
 * 检查Map是否为非空
 */
export function isNonEmptyMap(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_MAP, { value });
        }

        if (value.size > 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.EMPTY_MAP, { value });
    };
}
