import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../core';


/**
 * 检查是否为null
 */
export function isNullable(value: any): ValidationResult {
  if (value === null || value === undefined) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_NULL, { value });
}


/**
 * 验证值是否为空
 * @param value 要验证的值
 * @returns 验证结果
 */
export function isEmpty(value: any): ValidationResult {
  // 检查各种类型的空状态
  let empty = false;
  
  if (value === undefined || value === null) {
    empty = true;  // 通常 undefined/null 被认为是空的
  } else if (typeof value === 'string') {
    empty = value.trim() === '';
  } else if (Array.isArray(value)) {
    empty = value.length === 0;
  } else if (typeof value === 'object') {
    empty = Object.keys(value).length === 0;
  } else if (typeof value === 'number') {
    empty = false;  // 数字不空
  } else if (typeof value === 'boolean') {
    empty = false;  // 布尔值不空
  } else {
    empty = !value; // 其他类型根据真值判断
  }
  
  return { 
    isValid: empty, 
    errors: empty ? [] : [{ errorCode: ValidationErrorCode.NOT_EMPTY }] 
  };
}

/**
 * 验证值是否为非空
 * @param value 要验证的值
 * @returns 验证结果
 */
export function isNonEmpty(value: any): ValidationResult {
  const result = isEmpty(value);
  return { 
    isValid: !result.isValid, 
    errors: !result.isValid ? [] : [{ errorCode: ValidationErrorCode.EMPTY }] 
  };
}
