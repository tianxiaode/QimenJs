// rules/primitives/special.ts
import { ValidationErrorCode } from '../constants';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../base';import { isString } from './types';
/**
 * 检查是否为非空字符串（可选择是否trim）
 */
export interface IsNotEmptyStringOptions {
  trim?: boolean;
}

export function isNotEmptyString(value: any, options: IsNotEmptyStringOptions = {}): ValidationResult {
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
 * 检查是否为null
 */
export function isNull(value: any): ValidationResult {
  if (value === null) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_NULL, { value });
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
 * 检查是否为null或undefined
 */
export function isNil(value: any): ValidationResult {
  if (value === null || value === undefined) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_NULL_OR_UNDEFINED, { value });
}

/**
 * 检查值是否为真值（truthy）
 */
export function isTruthy(value: any): ValidationResult {
  if (!!value) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_TRUTHY, { value });
}

/**
 * 检查值是否为假值（falsy）
 */
export function isFalsy(value: any): ValidationResult {
  if (!value) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_FALSY, { value });
}

/**
 * 检查是否为 NaN（使用 Number.isNaN，比 isNaN 更严格）
 */
export function isNumericNaN(value: any): ValidationResult {
  if (Number.isNaN(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_EQUAL, { 
    expected: 'NaN', 
    actual: value 
  });
}

/**
 * 检查值是否为必填（非空）
 */
export function isRequired(value: any): ValidationResult {
  // 检查各种空值情况
  if (
    value === null || 
    value === undefined || 
    (typeof value === 'string' && value.trim() === '') ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (Array.isArray(value) && value.length === 0) ||
    (value instanceof Map && value.size === 0) ||
    (value instanceof Set && value.size === 0) ||
    (typeof value === 'number' && isNaN(value)) ||
    (value instanceof Date && isNaN(value.getTime())) // 添加对无效日期的检查
  ) {
    return createValidationFailure(ValidationErrorCode.REQUIRED, { 
      value,
      errorMessage: 'Value is required'
    });
  }

  return createValidationSuccess();
}