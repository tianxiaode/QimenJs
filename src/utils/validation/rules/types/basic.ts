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
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING, { value });
}

/**
 * 检查是否为数字
 */
export function isNumber(value: any): ValidationResult {
  if (typeof value === 'number' && !isNaN(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
}

/**
 * 检查是否为布尔值
 */
export function isBoolean(value: any): ValidationResult {
  if (typeof value === 'boolean') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_BOOLEAN, { value });
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
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_PRIMITIVE, { value });
}
