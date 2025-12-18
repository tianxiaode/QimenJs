// rules/structures/object.ts
import { ValidationErrorCode } from '../../core';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';
import { isObject } from '../types';

/**
 * 检查对象是否具有指定的键
 */
export function hasKey(key: string): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
                value,
                expected: 'object',
                actual: typeof value,
                errorMessage: 'Value must be an object'
            });
        }

        if (Object.prototype.hasOwnProperty.call(value, key)) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.MISSING_FIELD, { 
            value, 
            key,
            errorMessage: `Object is missing required key: ${key}`
        });
    };
}

/**
 * 检查对象是否具有所有指定的键
 */
export function hasKeys(requiredKeys: string[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
                value,
                expected: 'object',
                actual: typeof value,
                errorMessage: 'Value must be an object'
            });
        }

        const missingKeys: string[] = [];
        for (const key of requiredKeys) {
            if (!Object.prototype.hasOwnProperty.call(value, key)) {
                missingKeys.push(key);
            }
        }

        if (missingKeys.length === 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.MISSING_FIELD, { 
            value, 
            missingKeys,
            requiredKeys,
            errorMessage: `Object is missing required keys: ${missingKeys.join(', ')}`
        });
    };
}

/**
 * 检查对象是否具有至少一个指定的键
 */
export function hasAnyKey(keys: string[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
                value,
                expected: 'object',
                actual: typeof value,
                errorMessage: 'Value must be an object'
            });
        }

        for (const key of keys) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                return createValidationSuccess();
            }
        }

        return createValidationFailure(ValidationErrorCode.MISSING_FIELD, { 
            value, 
            keys,
            errorMessage: `Object must have at least one of the specified keys: ${keys.join(', ')}`
        });
    };
}

/**
 * 检查对象是否不包含指定的键
 */
export function hasNoKey(forbiddenKeys: string[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
                value,
                expected: 'object',
                actual: typeof value,
                errorMessage: 'Value must be an object'
            });
        }

        const foundForbiddenKeys: string[] = [];
        for (const key of forbiddenKeys) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                foundForbiddenKeys.push(key);
            }
        }

        if (foundForbiddenKeys.length === 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_ALLOWED, { 
            value, 
            forbiddenKeys: foundForbiddenKeys,
            errorMessage: `Object contains forbidden keys: ${foundForbiddenKeys.join(', ')}`
        });
    };
}

/**
 * 检查对象是否为空对象
 */
export function isEmptyObject(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
                value,
                expected: 'object',
                actual: typeof value,
                errorMessage: 'Value must be an object'
            });
        }

        const keys = Object.keys(value);
        if (keys.length === 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
            value,
            actualKeys: keys,
            errorMessage: 'Object must be empty'
        });
    };
}

/**
 * 检查对象是否为非空对象
 */
export function isNonEmptyObject(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isObject(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
                value,
                expected: 'object',
                actual: typeof value,
                errorMessage: 'Value must be an object'
            });
        }

        const keys = Object.keys(value);
        if (keys.length > 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.TOO_SMALL, { 
            value,
            min: 1,
            actual: keys.length,
            errorMessage: 'Object must not be empty'
        });
    };
}