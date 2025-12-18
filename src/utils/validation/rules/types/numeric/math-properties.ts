import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../../core';
import { isNumber } from '../basic';
import { isInteger } from './type-check';


/**
 * 检查数字是否为质数
 */
export function isPrime(): (value: any) => ValidationResult {
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
        
        if (value <= 1) {
            return createValidationFailure(ValidationErrorCode.TOO_SMALL, { 
              value,
              min: 2,
              actual: value,
              errorMessage: 'Value must be greater than 1 to be prime'
            });
        }
        
        // 检查质数
        for (let i = 2, s = Math.sqrt(value); i <= s; i++) {
            if (value % i === 0) {
                return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
                  value,
                  expected: 'prime number',
                  actual: value,
                  errorMessage: 'Value must be a prime number'
                });
            }
        }
        
        return createValidationSuccess();
    };
}



/**
 * 检查数字是否为完美平方
 */
export function isPerfectSquare(): (value: any) => ValidationResult {
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
        
        if (value < 0) {
            return createValidationFailure(ValidationErrorCode.TOO_SMALL, { 
              value,
              min: 0,
              actual: value,
              errorMessage: 'Value must be non-negative'
            });
        }
        
        const sqrt = Math.sqrt(value);
        if (!Number.isInteger(sqrt)) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'perfect square',
              actual: value,
              errorMessage: 'Value must be a perfect square'
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为完美立方
 */
export function isPerfectCube(): (value: any) => ValidationResult {
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
        
        // 对于负数立方根也是可能的
        const cubeRoot = Math.cbrt(value);
        if (!Number.isInteger(cubeRoot)) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'perfect cube',
              actual: value,
              errorMessage: 'Value must be a perfect cube'
            });
        }
        
        return createValidationSuccess();
    };
}

