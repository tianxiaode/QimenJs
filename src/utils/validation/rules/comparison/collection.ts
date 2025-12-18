import { createValidationFailure, createValidationSuccess, ValidationErrorCode, ValidationResult } from '../../core';

/**
 * 检查值是否在指定集合中
 */
export function isIn<T>(allowedValues: T[]): (value: T) => ValidationResult {
    return (value: T): ValidationResult => {
        const isValid = allowedValues.includes(value);
        if (isValid) {
            return createValidationSuccess();
        }
        
        return createValidationFailure(ValidationErrorCode.NOT_ALLOWED, { 
            value,
            allowedValues,
            errorMessage: 'Value is not in the allowed values list',
            expected: `one of [${allowedValues.map(v => String(v)).join(', ')}]`
        });
    };
}

/**
 * 检查值是否不在指定集合中
 */
export function isNotIn<T>(disallowedValues: T[]): (value: T) => ValidationResult {
    return (value: T): ValidationResult => {
        const isValid = !disallowedValues.includes(value);
        if (isValid) {
            return createValidationSuccess();
        }
        
        return createValidationFailure(ValidationErrorCode.NOT_ALLOWED, { 
            value,
            disallowedValues,
            errorMessage: 'Value is in the disallowed values list',
            expected: `not one of [${disallowedValues.map(v => String(v)).join(', ')}]`
        });
    };
}

/**
 * 检查值是否等于指定值之一（与isIn相同，但可能用于更语义化的场景）
 */
export function isOneOf<T>(allowedValues: T[]): (value: T) => ValidationResult {
    return isIn(allowedValues);
}