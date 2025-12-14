// rules/primitives/types.ts
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../base';
import { ValidationErrorCode } from '../constants';

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
  if (typeof value === 'number') {
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
 * 检查是否为BigInt
 */
export function isBigInt(value: any): ValidationResult {
  if (typeof value === 'bigint') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_BIGINT, { value });
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
