import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../../core';
import { isNumber } from '../basic';
import { isInteger } from './type-check';


/**
 * 检查数字是否为偶数
 */
export function isEven(): (value: any) => ValidationResult {
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
        
        if (!isInteger(value).isValid) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'integer',
              actual: value,
              errorMessage: 'Value must be an integer'
            });
        }
        
        if (value % 2 !== 0) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'even number',
              actual: value,
              errorMessage: 'Value must be even'
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为奇数
 */
export function isOdd(): (value: any) => ValidationResult {
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
        
        if (!isInteger(value).isValid) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'integer',
              actual: value,
              errorMessage: 'Value must be an integer'
            });
        }
        
        if (value % 2 === 0) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'odd number',
              actual: value,
              errorMessage: 'Value must be odd'
            });
        }
        
        return createValidationSuccess();
    };
}


/**
 * 检查数字是否为偶数或允许奇数
 */
export function isEvenOrAllowOdd(allowOdd: boolean = false): (value: any) => ValidationResult {
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
        
        if (!isInteger(value).isValid) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'integer',
              actual: value,
              errorMessage: 'Value must be an integer'
            });
        }
        
        if (value % 2 !== 0 && !allowOdd) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'even number',
              actual: value,
              errorMessage: 'Value must be even'
            });
        }
        
        return createValidationSuccess();
    };
}