import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../../core';
import { isNumber } from '../basic';

/**
 * 检查是否为BigInt
 */
export function isBigInt(value: any): ValidationResult {
  if (typeof value === 'bigint') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'bigint',
    actual: typeof value,
    errorMessage: 'Value must be a BigInt'
  });
}

/**
 * 检查是否为有限数字（排除 Infinity 和 NaN）
 */
export function isFinite(value: any): ValidationResult {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
    value, 
    expected: 'finite number',
    actual: typeof value,
    errorMessage: 'Value must be a finite number'
  });
}

/**
 * 检查是否为整数
 */
export function isInteger(value: any): ValidationResult {
  if (Number.isInteger(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
    value, 
    expected: 'integer',
    actual: typeof value,
    errorMessage: 'Value must be an integer'
  });
}

/**
 * 检查数字是否为安全整数
 */
export function isSafeInteger(): (value: any) => ValidationResult {
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
        
        if (!Number.isSafeInteger(value)) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
              value,
              expected: 'safe integer',
              actual: value,
              errorMessage: 'Value must be a safe integer'
            });
        }
        
        return createValidationSuccess();
    };
}
