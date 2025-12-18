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
    if (isNaN(value.getTime())) {
      return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
        value, 
        reason: 'Invalid Date',
        errorMessage: 'Value must be a valid date'
      });
    }
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'Date',
    actual: typeof value,
    errorMessage: 'Value must be a Date object'
  });
}

/**
 * 检查是否为函数
 */
export function isFunction(value: any): ValidationResult {
  if (typeof value === 'function') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'function',
    actual: typeof value,
    errorMessage: 'Value must be a function'
  });
}

/**
 * 检查是否为正则表达式
 */
export function isRegExp(value: any): ValidationResult {
  if (value instanceof RegExp) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'RegExp',
    actual: typeof value,
    errorMessage: 'Value must be a RegExp object'
  });
}

/**
 * 检查是否为Symbol
 */
export function isSymbol(value: any): ValidationResult {
  if (typeof value === 'symbol') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
    value,
    expected: 'symbol',
    actual: typeof value,
    errorMessage: 'Value must be a symbol'
  });
}

/**
 * 检查是否为undefined
 */
export function isUndefined(value: any): ValidationResult {
  if (value === undefined) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.INVALID_VALUE, { 
    value,
    expected: 'undefined',
    actual: typeof value,
    errorMessage: 'Value must be undefined'
  });
}