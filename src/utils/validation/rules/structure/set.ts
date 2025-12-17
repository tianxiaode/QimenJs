import { ValidationErrorCode } from '../../core';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';
import { isSet } from '../types';

/**
 * 检查Set是否具有指定的值
 */
export function hasSetValue(valueToCheck: any): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isSet(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_SET, { value });
        }

        if (value.has(valueToCheck)) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.MISSING_VALUE, { value, valueToCheck });
    };
}

/**
 * 检查Set是否具有所有指定的值
 */
export function hasSetValues(requiredValues: any[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isSet(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_SET, { value });
        }

        for (const val of requiredValues) {
            if (!value.has(val)) {
                return createValidationFailure(ValidationErrorCode.MISSING_VALUE, {
                    value,
                    origin: val,
                });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 检查Set是否具有至少一个指定的值
 */
export function hasAnySetValue(values: any[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isSet(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_SET, { value });
        }

        for (const val of values) {
            if (value.has(val)) {
                return createValidationSuccess();
            }
        }

        return createValidationFailure(ValidationErrorCode.MISSING_VALUES, { value, values });
    };
}

/**
 * 检查Set是否不包含指定的值
 */
export function hasNoSetValue(forbiddenValues: any[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isSet(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_SET, { value });
        }

        for (const val of forbiddenValues) {
            if (value.has(val)) {
                return createValidationFailure(ValidationErrorCode.FORBIDDEN_VALUE, {
                    value,
                    origin: val,
                });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 检查Set是否为空
 */
export function isEmptySet(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isSet(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_SET, { value });
        }

        if (value.size === 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_EMPTY_SET, {
            value,
            actualSize: value.size,
        });
    };
}

/**
 * 检查Set是否为非空
 */
export function isNonEmptySet(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isSet(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_SET, { value });
        }

        if (value.size > 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.EMPTY_SET, { value });
    };
}
