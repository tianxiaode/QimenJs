import { ValidationErrorCode } from '../../core';
import { isString, isArray, isObject, isMap, isSet } from '../types';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';

/**
 * 获取值的长度
 */
export function getLength(value: any): number | undefined {
    if (isString(value).isValid) {
        return value.length;
    }

    if (isArray(value).isValid) {
        return value.length;
    }

    if (isMap(value).isValid) {
        return value.size;
    }

    if (isSet(value).isValid) {
        return value.size;
    }

    if (isObject(value).isValid) {
        return Object.keys(value).length;
    }

    return undefined;
}

/**
 * 检查长度是否满足条件
 */
export function checkLength(
    condition: (length: number) => boolean,
    errorCode: ValidationErrorCode,
    errorParams: Record<string, any>
): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const length = getLength(value);

        if (length === undefined) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
                value,
                expected: 'type with length property',
                actual: typeof value,
                errorMessage: 'Value must have a length property'
            });
        }

        if (condition(length)) {
            return createValidationSuccess();
        }

        return createValidationFailure(errorCode, {
            ...errorParams,
            actualLength: length,
            value,
            errorMessage: 'Length check failed'
        });
    };
}

/**
 * 检查是否有最小长度
 */
export function hasMinLength(min: number): (value: any) => ValidationResult {
    return checkLength(
        length => length >= min, 
        ValidationErrorCode.TOO_SMALL, 
        { 
            min,
            errorMessage: `Length must be at least ${min}`
        }
    );
}

/**
 * 检查是否有最大长度
 */
export function hasMaxLength(max: number): (value: any) => ValidationResult {
    return checkLength(
        length => length <= max, 
        ValidationErrorCode.TOO_LARGE, 
        { 
            max,
            errorMessage: `Length must be at most ${max}`
        }
    );
}

/**
 * 长度是否在范围内
 */
export function hasLengthBetween(min: number, max: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const minLengthCheck = hasMinLength(min)(value);
        if (!minLengthCheck.isValid) {
            return createValidationFailure(
                ValidationErrorCode.TOO_SMALL,
                {
                    value,
                    min,
                    errorMessage: `Length must be between ${min} and ${max}`
                }
            );
        }

        const maxLengthCheck = hasMaxLength(max)(value);
        if (!maxLengthCheck.isValid) {
            return createValidationFailure(
                ValidationErrorCode.TOO_LARGE,
                {
                    value,
                    max,
                    errorMessage: `Length must be between ${min} and ${max}`
                }
            );
        }

        return createValidationSuccess();
    };
}

/**
 * 检查是否有精确长度
 */
export function hasExactLength(expectedLength: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const length = getLength(value);

        if (length === undefined) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
                value,
                expected: 'type with length property',
                actual: typeof value,
                errorMessage: 'Value must have a length property'
            });
        }

        if (length === expectedLength) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
            value,
            expected: expectedLength,
            actual: length,
            errorMessage: `Length must be exactly ${expectedLength}, but got ${length}`
        });
    };
}

/**
 * 检查长度是否为指定值之一
 */
export function hasLengthOneOf(allowedLengths: number[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const length = getLength(value);

        if (length === undefined) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
                value,
                expected: 'type with length property',
                actual: typeof value,
                errorMessage: 'Value must have a length property'
            });
        }

        if (allowedLengths.includes(length)) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_ALLOWED, {
            value,
            allowedLengths,
            actual: length,
            errorMessage: `Length must be one of [${allowedLengths.join(', ')}], but got ${length}`
        });
    };
}