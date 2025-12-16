import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../core';


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
