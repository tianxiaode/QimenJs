import { ValidationErrorCode } from '../../core';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';
import { isObject } from '../types';

/**
 * 检查对象是否具有指定的键
 */
export function hasKey(key: string): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_OBJECT, { value });
        }

        if (Object.prototype.hasOwnProperty.call(value, key)) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.MISSING_KEY, { value, key });
    };
}

/**
 * 检查对象是否具有所有指定的键
 */
export function hasKeys(requiredKeys: string[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_OBJECT, { value });
        }

        for (const key of requiredKeys) {
            if (!Object.prototype.hasOwnProperty.call(value, key)) {
                return createValidationFailure(ValidationErrorCode.MISSING_KEY, { value, key });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 检查对象是否具有至少一个指定的键
 */
export function hasAnyKey(keys: string[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_OBJECT, { value });
        }

        for (const key of keys) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                return createValidationSuccess();
            }
        }

        return createValidationFailure(ValidationErrorCode.MISSING_KEYS, { value, keys });
    };
}

/**
 * 检查对象是否不包含指定的键
 */
export function hasNoKey(forbiddenKeys: string[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_OBJECT, { value });
        }

        for (const key of forbiddenKeys) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                return createValidationFailure(ValidationErrorCode.FORBIDDEN_KEY, { value, key });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 检查对象是否为空对象
 */
export function isEmptyObject(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_OBJECT, { value });
        }

        if (Object.keys(value).length === 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_EMPTY_OBJECT, {
            value,
            actualKeys: Object.keys(value),
        });
    };
}

/**
 * 检查对象是否为非空对象
 */
export function isNonEmptyObject(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_OBJECT, { value });
        }

        if (Object.keys(value).length > 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.EMPTY_OBJECT, { value });
    };
}
