import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../core';

/**
 * 检查是否为字符串
 */
export function isString(value: any): ValidationResult {
  if (typeof value === 'string') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'string',
    actual: typeof value,
    errorMessage: 'Value must be a string'
  });
}

/**
 * 检查是否为数字
 */
export function isNumber(value: any): ValidationResult {
  if (typeof value === 'number' && !isNaN(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'number',
    actual: typeof value,
    errorMessage: 'Value must be a number'
  });
}

/**
 * 检查是否为布尔值
 */
export function isBoolean(value: any): ValidationResult {
  if (typeof value === 'boolean') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'boolean',
    actual: typeof value,
    errorMessage: 'Value must be a boolean'
  });
}

/**
 * 检查是否为原始类型
 */
export function isPrimitive(value: any): ValidationResult {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    typeof value === 'bigint' ||
    value === null ||
    value === undefined
  ) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'primitive type',
    actual: typeof value,
    errorMessage: 'Value must be a primitive type'
  });
}