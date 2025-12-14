// rules/primitives/collections.ts
import { ValidationErrorCode } from '../constants';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../base';

/**
 * 检查是否为空数组
 */
export function isEmptyArray(value: any): ValidationResult {
  if (Array.isArray(value) && value.length === 0) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.ARRAY_IS_NOT_EMPTY, { value });
}

/**
 * 检查是否为空对象
 */
export function isEmptyObject(value: any): ValidationResult {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    if (Object.keys(value).length === 0) {
      return createValidationSuccess();
    }
  }
  
  return createValidationFailure(ValidationErrorCode.OBJECT_IS_NOT_EMPTY, { value });
}

/**
 * 检查是否为空 Map
 */
export function isEmptyMap(value: any): ValidationResult {
  if (value instanceof Map && value.size === 0) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.MAP_IS_NOT_EMPTY, { value });
}

/**
 * 检查是否为空 Set
 */
export function isEmptySet(value: any): ValidationResult {
  if (value instanceof Set && value.size === 0) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.SET_IS_NOT_EMPTY, { value });
}

