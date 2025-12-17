import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../core';

/**
 * 检查是否为日期对象
 */
export function isDate(value: any): ValidationResult {
  if (value instanceof Date) {
    // 检查是否为有效日期
    if (globalThis.isNaN(value.getTime())) {
      return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, { 
        value, 
        reason: 'Invalid Date' 
      });
    }
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, { value });
}


/**
 * 检查是否为函数
 */
export function isFunction(value: any): ValidationResult {
  if (typeof value === 'function') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_FUNCTION, { value });
}

/**
 * 检查是否为正则表达式
 */
export function isRegExp(value: any): ValidationResult {
  if (value instanceof RegExp) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_REGEXP, { value });
}

/**
 * 检查是否为Symbol
 */
export function isSymbol(value: any): ValidationResult {
  if (typeof value === 'symbol') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_SYMBOL, { value });
}

/**
 * 检查是否为undefined
 */
export function isUndefined(value: any): ValidationResult {
  if (value === undefined) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_UNDEFINED, { value });
}
