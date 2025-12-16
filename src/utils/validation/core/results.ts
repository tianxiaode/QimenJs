import { ValidationResult } from './types';
import { ValidationErrorCode } from './constants';

/**
 * 创建一个成功的验证结果
 * @returns {ValidationResult} 验证结果
 */
export function createValidationSuccess(): ValidationResult {
  return { isValid: true, errors: [] };
}

/**
 * 创建一个失败的验证结果
 * @param {ValidationErrorCode} errorCode 错误码
 * @param {Record<string, any>} [errorParams] 错误参数
 * @returns {ValidationResult} 验证结果
 */
export function createValidationFailure(
  errorCode: ValidationErrorCode,
  errorParams?: Record<string, any>
): ValidationResult {
  return {
    isValid: false,
    errors: [{ errorCode, errorParams }]
  };
}

/**
 * 合并多个验证结果
 * @param {...ValidationResult} results 多个验证结果
 * @returns {ValidationResult} 合并后的验证结果
 * 合并多个验证结果，只要有一个失败，则返回失败的结果，否则返回成功的结果
 * 合并的逻辑是，将所有错误合并到一起，然后返回一个新的结果，如果没有错误，则返回成功的结果
 */
export function mergeValidationResults(
  ...results: ValidationResult[]
): ValidationResult {
  const allErrors = results
    .filter(result => !result.isValid)
    .flatMap(result => result.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}