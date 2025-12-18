import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../core';

/**
 * 检查是否为数组
 */
export function isArray(value: any): ValidationResult {
  if (Array.isArray(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'array',
    actual: typeof value,
    errorMessage: 'Value must be an array'
  });
}

/**
 * 检查是否为对象（不包括数组和null）
 */
export function isObject(value: any): ValidationResult {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'object',
    actual: typeof value,
    errorMessage: 'Value must be an object'
  });
}

/**
 * 检查是否为 Map 对象
 */
export function isMap(value: any): ValidationResult {
  if (value instanceof Map) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'Map',
    actual: typeof value,
    errorMessage: 'Value must be a Map'
  });
}

/**
 * 检查是否为 Set 对象
 */
export function isSet(value: any): ValidationResult {
  if (value instanceof Set) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'Set',
    actual: typeof value,
    errorMessage: 'Value must be a Set'
  });
}