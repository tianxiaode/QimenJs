// rules/primitives/types.ts
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../core';
import { ValidationErrorCode } from '../core/constants';

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

/**
 * 检查是否为undefined
 */
export function isUndefined(value: any): ValidationResult {
  if (value === undefined) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_UNDEFINED, { value });
}

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