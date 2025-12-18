import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../core';

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
            errorMessage: 'Value is required',
        });
    }

    return createValidationSuccess();
}


/**
 * 检查值是否允许为空
 * @param value 要验证的值
 * @returns 
 */
export function isOptional(value: any): ValidationResult {
  // isOptional 单独使用时：允许值为空
  if (value === undefined || value === null || value === '') {
    return createValidationSuccess();
  }
  return createValidationSuccess();
}


/**
 * 检查值是否为非null
 */
export function isPresent(value: any): ValidationResult {
  if (value === undefined || value === null) {
    return createValidationFailure(ValidationErrorCode.REQUIRED, {
      value,
      errorMessage: 'Value must be present',
      expected: 'non-null value'
    });
  }
  return createValidationSuccess();
}