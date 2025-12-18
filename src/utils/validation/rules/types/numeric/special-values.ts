import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../../core';
import { isNumber } from '../basic';

/**
 * 检查数字是否为允许的值之一
 */
export function isOneOf(allowedValues: number[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
              value,
              expected: 'number',
              actual: typeof value,
              errorMessage: 'Value must be a number'
            });
        }
        
        if (!allowedValues.includes(value)) {
            return createValidationFailure(ValidationErrorCode.NOT_ALLOWED, {
                value,
                allowedValues,
                errorMessage: `Value must be one of: ${allowedValues.join(', ')}`
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为不允许的值
 */
export function isNotOneOf(disallowedValues: number[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
              value,
              expected: 'number',
              actual: typeof value,
              errorMessage: 'Value must be a number'
            });
        }
        
        if (disallowedValues.includes(value)) {
            return createValidationFailure(ValidationErrorCode.NOT_ALLOWED, {
                value,
                disallowedValues,
                errorMessage: `Value ${value} is not allowed`
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为非 NaN（允许 Infinity）
 */
export function isNotNaN(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
              value,
              expected: 'number',
              actual: typeof value,
              errorMessage: 'Value must be a number'
            });
        }
        
        if (isNaN(value)) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'non-NaN number',
              actual: value,
              errorMessage: 'Value must not be NaN'
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为非 Infinity（允许 NaN）
 */
export function isNotInfinite(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
              value,
              expected: 'number',
              actual: typeof value,
              errorMessage: 'Value must be a number'
            });
        }
        
        if (!Number.isFinite(value)) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'finite number',
              actual: value,
              errorMessage: 'Value must be finite'
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为有限数或允许的特殊值（NaN/Infinity）
 */
export function isFiniteOrSpecial(allowNaN: boolean = false, allowInfinite: boolean = false): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
              value,
              expected: 'number',
              actual: typeof value,
              errorMessage: 'Value must be a number'
            });
        }
        
        if (isNaN(value) && !allowNaN) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'non-NaN number',
              actual: value,
              errorMessage: 'NaN is not allowed'
            });
        }
        
        if (!Number.isFinite(value) && !allowInfinite) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'finite number',
              actual: value,
              errorMessage: 'Infinity is not allowed'
            });
        }
        
        return createValidationSuccess();
    };
}
