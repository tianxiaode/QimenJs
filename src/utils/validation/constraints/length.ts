// rules/constraints/length.ts
import { ValidationErrorCode } from '../constants';
import { isString, isArray, isObject, isMap, isSet } from '../primitives';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../base';

/**
 * 获取值的长度
 */
function getLength(value: any): number | undefined {
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
function checkLength(
    condition: (length: number) => boolean,
    errorCode: ValidationErrorCode,
    errorParams: Record<string, any>
): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const length = getLength(value);

        if (length === undefined) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_HAS_LENGTH, { value });
        }

        if (condition(length)) {
            return createValidationSuccess();
        }

        return createValidationFailure(errorCode, {
            ...errorParams,
            actualLength: length,
            value,
        });
    };
}

/**
 * 检查是否有最小长度
 */
export function hasMinLength(min: number): (value: any) => ValidationResult {
    return checkLength(length => length >= min, ValidationErrorCode.MIN_LENGTH, { min });
}

/**
 * 检查是否有最大长度
 */
export function hasMaxLength(max: number): (value: any) => ValidationResult {
    return checkLength(length => length <= max, ValidationErrorCode.MAX_LENGTH, { max });
}

/**
 * 长度是否在范围内
 */
export function hasLengthBetween(min: number, max: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const minLengthCheck = hasMinLength(min)(value);
        if (!minLengthCheck.isValid) {
            return minLengthCheck;
        }
        
        return hasMaxLength(max)(value);
    };
}

/**
 * 检查是否有精确长度
 */
export function hasExactLength(expectedLength: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const length = getLength(value);
        
        if (length === undefined) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_HAS_LENGTH, { value });
        }
        
        if (length === expectedLength) {
            return createValidationSuccess();
        }
        
        return createValidationFailure(ValidationErrorCode.LENGTH_MISMATCH, {
            value,
            expected: expectedLength,
            actual: length
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
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_HAS_LENGTH, { value });
        }
        
        if (allowedLengths.includes(length)) {
            return createValidationSuccess();
        }
        
        return createValidationFailure(ValidationErrorCode.LENGTH_NOT_ONE_OF, {
            value,
            allowedLengths,
            actual: length
        });
    };
}