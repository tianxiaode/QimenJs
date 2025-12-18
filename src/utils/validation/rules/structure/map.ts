import { ValidationErrorCode } from '../../core';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';
import { isMap } from '../types';

/**
 * 检查Map是否具有指定的键
 */
export function hasMapKey(key: any): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Map',
                actual: typeof value,
                errorMessage: 'Value must be a Map',
            });
        }

        if (value.has(key)) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.MISSING_FIELD, {
            value,
            key,
            errorMessage: `Map is missing required key: ${String(key)}`,
        });
    };
}

/**
 * 检查Map是否具有所有指定的键
 */
export function hasMapKeys(requiredKeys: any[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Map',
                actual: typeof value,
                errorMessage: 'Value must be a Map',
            });
        }

        const missingKeys: any[] = [];
        for (const key of requiredKeys) {
            if (!value.has(key)) {
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
            errorMessage: `Map is missing required keys: ${missingKeys.map(k => String(k)).join(', ')}`,
        });
    };
}

/**
 * 检查Map是否具有至少一个指定的键
 */
export function hasAnyMapKey(keys: any[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Map',
                actual: typeof value,
                errorMessage: 'Value must be a Map',
            });
        }

        for (const key of keys) {
            if (value.has(key)) {
                return createValidationSuccess();
            }
        }

        return createValidationFailure(ValidationErrorCode.MISSING_FIELD, {
            value,
            keys,
            errorMessage: `Map must have at least one of the specified keys: ${keys.map(k => String(k)).join(', ')}`,
        });
    };
}

/**
 * 检查Map是否不包含指定的键
 */
export function hasNoMapKey(forbiddenKeys: any[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Map',
                actual: typeof value,
                errorMessage: 'Value must be a Map',
            });
        }

        const foundForbiddenKeys: any[] = [];
        for (const key of forbiddenKeys) {
            if (value.has(key)) {
                foundForbiddenKeys.push(key);
            }
        }

        if (foundForbiddenKeys.length === 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_ALLOWED, {
            value,
            forbiddenKeys: foundForbiddenKeys,
            errorMessage: `Map contains forbidden keys: ${foundForbiddenKeys.map(k => String(k)).join(', ')}`,
        });
    };
}

/**
 * 检查Map是否为空
 */
export function isEmptyMap(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Map',
                actual: typeof value,
                errorMessage: 'Value must be a Map',
            });
        }

        if (value.size === 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
            value,
            actualSize: value.size,
            errorMessage: 'Map must be empty',
        });
    };
}

/**
 * 检查Map是否为非空
 */
export function isNonEmptyMap(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isMap(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Map',
                actual: typeof value,
                errorMessage: 'Value must be a Map',
            });
        }

        if (value.size > 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.TOO_SMALL, {
            value,
            min: 1,
            actual: value.size,
            errorMessage: 'Map must not be empty',
        });
    };
}
