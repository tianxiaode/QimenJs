import { create } from 'domain';
import { createValidationFailure, createValidationSuccess, ValidationErrorCode, ValidationResult } from '../../core';

/**
 * 检查值是否在指定集合中
 */
export function isIn<T>(allowedValues: T[]): (value: T) => ValidationResult {
    return (value: T): ValidationResult => {
        const isValid = allowedValues.includes(value);
        return isValid ? createValidationSuccess() :
            createValidationFailure(ValidationErrorCode.NOT_IN_ALLOWED_VALUES, { allowedValues, actualValue: value })
    };
}

/**
 * 检查值是否不在指定集合中
 */
export function isNotIn<T>(disallowedValues: T[]): (value: T) => ValidationResult {
    return (value: T): ValidationResult => {
        const isValid = !disallowedValues.includes(value);
        return isValid ? createValidationSuccess() :
            createValidationFailure(ValidationErrorCode.IN_DISALLOWED_VALUES, { disallowedValues, actualValue: value })
    };
}

/**
 * 检查值是否等于指定值之一（与isIn相同，但可能用于更语义化的场景）
 */
export function isOneOf<T>(allowedValues: T[]): (value: T) => ValidationResult {
    return isIn(allowedValues);
}