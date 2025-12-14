// rules/primitives/numbers.ts
import { ValidationErrorCode } from '../constants';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../base';

/**
 * 检查是否为有限数字（排除 Infinity 和 NaN）
 */
export function isFiniteNumber(value: any): ValidationResult {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { 
    value, 
    expected: 'finite number' 
  });
}

/**
 * 检查是否为整数
 */
export function isInteger(value: any): ValidationResult {
  if (Number.isInteger(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { 
    value, 
    expected: 'integer' 
  });
}

/**
 * 检查是否为正整数（大于0的整数）
 */
export function isPositiveInteger(value: any): ValidationResult {
  if (Number.isInteger(value) && value > 0) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_GREATER_THAN, { 
    min: 0, 
    actual: value 
  });
}

/**
 * 检查是否为非负整数（大于等于0的整数）
 */
export function isNonNegativeInteger(value: any): ValidationResult {
  if (Number.isInteger(value) && value >= 0) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { 
    min: 0, 
    actual: value 
  });
}