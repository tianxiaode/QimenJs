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
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
}

/**
 * 检查是否为对象（不包括数组和null）
 */
export function isObject(value: any): ValidationResult {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_OBJECT, { value });
}

/**
 * 检查是否为 Map 对象
 */
export function isMap(value: any): ValidationResult {
  if (value instanceof Map) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_MAP,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为 Set 对象
 */
export function isSet(value: any): ValidationResult {
  if (value instanceof Set) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_SET,
      errorParams: { value }
    }]
  };
}
