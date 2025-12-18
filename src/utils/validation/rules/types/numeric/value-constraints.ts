import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../../core';
import { isNumber } from '../basic';

/**
 * 检查是否为正整数（大于0的整数）
 */
export function isPositiveInteger(value: any): ValidationResult {
  if (Number.isInteger(value) && value > 0) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TOO_SMALL, { 
    value,
    min: 1,
    actual: value,
    errorMessage: 'Value must be a positive integer'
  });
}

/**
 * 检查是否为非负整数（大于等于0的整数）
 */
export function isNonNegativeInteger(value: any): ValidationResult {
  if (Number.isInteger(value) && value >= 0) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TOO_SMALL, { 
    value,
    min: 0,
    actual: value,
    errorMessage: 'Value must be a non-negative integer'
  });
}

/**
 * 检查数字是否为正数
 */
export function isPositive(): (value: any) => ValidationResult {
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
        
        if (value <= 0) {
            return createValidationFailure(ValidationErrorCode.TOO_SMALL, { 
              value,
              min: 0,
              actual: value,
              errorMessage: 'Value must be positive'
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为负数
 */
export function isNegative(): (value: any) => ValidationResult {
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
        
        if (value >= 0) {
            return createValidationFailure(ValidationErrorCode.TOO_LARGE, { 
              value,
              max: 0,
              actual: value,
              errorMessage: 'Value must be negative'
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为零
 */
export function isZero(): (value: any) => ValidationResult {
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
        
        if (value !== 0) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 0,
              actual: value,
              errorMessage: 'Value must be zero'
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为非零
 */
export function isNonZero(): (value: any) => ValidationResult {
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
        
        if (value === 0) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'non-zero number',
              actual: value,
              errorMessage: 'Value must be non-zero'
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为非负数（大于等于0）
 */
export function isNonNegative(): (value: any) => ValidationResult {
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
        
        if (value < 0) {
            return createValidationFailure(ValidationErrorCode.TOO_SMALL, { 
              value,
              min: 0,
              actual: value,
              errorMessage: 'Value must be non-negative'
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为非正数（小于等于0）
 */
export function isNonPositive(): (value: any) => ValidationResult {
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
        
        if (value > 0) {
            return createValidationFailure(ValidationErrorCode.TOO_LARGE, { 
              value,
              max: 0,
              actual: value,
              errorMessage: 'Value must be non-positive'
            });
        }
        
        return createValidationSuccess();
    };
}
