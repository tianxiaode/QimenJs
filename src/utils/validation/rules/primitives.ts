// rules/primitives.ts
import { ValidationRuleResult } from './base';
import { ValidationErrorCode } from './error-codes';
import { createValidationFailure, createValidationSuccess } from './utils';

/**
 * 检查是否为字符串
 */
export function isString(value: any): ValidationRuleResult {
  if (typeof value === 'string') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING, { value });
}

/**
 * 检查是否为非空字符串（可选择是否trim）
 */
export interface IsNotEmptyStringOptions {
  trim?: boolean;
}

export function isNotEmptyString(value: any, options: IsNotEmptyStringOptions = {}): ValidationRuleResult {
  // 首先检查是否为字符串
  const stringCheck = isString(value);
  if (!stringCheck.isValid) {
    return stringCheck;
  }
  
  const { trim = false } = options;
  const stringValue = trim ? value.trim() : value;
  
  if (stringValue.length > 0) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 检查是否为数字
 */
export function isNumber(value: any): ValidationRuleResult {
  if (typeof value === 'number') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
}

/**
 * 检查是否为布尔值
 */
export function isBoolean(value: any): ValidationRuleResult {
  if (typeof value === 'boolean') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_BOOLEAN, { value });
}

/**
 * 检查是否为日期对象
 */
export function isDate(value: any): ValidationRuleResult {
  if (value instanceof Date) {
    // 检查是否为有效日期
    if (isNaN(value.getTime())) {
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
export function isArray(value: any): ValidationRuleResult {
  if (Array.isArray(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
}

/**
 * 检查是否为对象（不包括数组和null）
 */
export function isObject(value: any): ValidationRuleResult {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_OBJECT, { value });
}

/**
 * 检查是否为函数
 */
export function isFunction(value: any): ValidationRuleResult {
  if (typeof value === 'function') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_FUNCTION, { value });
}

/**
 * 检查是否为正则表达式
 */
export function isRegExp(value: any): ValidationRuleResult {
  if (value instanceof RegExp) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_REGEXP, { value });
}

/**
 * 检查是否为Symbol
 */
export function isSymbol(value: any): ValidationRuleResult {
  if (typeof value === 'symbol') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_SYMBOL, { value });
}

/**
 * 检查是否为BigInt
 */
export function isBigInt(value: any): ValidationRuleResult {
  if (typeof value === 'bigint') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_BIGINT, { value });
}

/**
 * 检查是否为null
 */
export function isNull(value: any): ValidationRuleResult {
  if (value === null) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_NULL, { value });
}

/**
 * 检查是否为undefined
 */
export function isUndefined(value: any): ValidationRuleResult {
  if (value === undefined) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_UNDEFINED, { value });
}

/**
 * 检查是否为原始类型
 */
export function isPrimitive(value: any): ValidationRuleResult {
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
 * 检查是否为null或undefined
 */
export function isNil(value: any): ValidationRuleResult {
  if (value === null || value === undefined) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_NULL_OR_UNDEFINED, { value });
}

/**
 * 检查是否为有限数字（排除 Infinity 和 NaN）
 */
export function isFiniteNumber(value: any): ValidationRuleResult {
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
export function isInteger(value: any): ValidationRuleResult {
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
export function isPositiveInteger(value: any): ValidationRuleResult {
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
export function isNonNegativeInteger(value: any): ValidationRuleResult {
  if (Number.isInteger(value) && value >= 0) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { 
    min: 0, 
    actual: value 
  });
}

/**
 * 检查值是否为真值（truthy）
 */
export function isTruthy(value: any): ValidationRuleResult {
  if (!!value) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_TRUTHY, { value });
}

/**
 * 检查值是否为假值（falsy）
 */
export function isFalsy(value: any): ValidationRuleResult {
  if (!value) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_FALSY, { value });
}

/**
 * 检查是否为 NaN（使用 Number.isNaN，比 isNaN 更严格）
 */
export function isNaN(value: any): ValidationRuleResult {
  if (Number.isNaN(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_EQUAL, { 
    expected: 'NaN', 
    actual: value 
  });
}