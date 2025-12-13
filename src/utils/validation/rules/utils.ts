// rules/utils.ts
import { ValidationRuleResult, ValidationRuleError } from './base';
import { ValidationErrorCode } from './error-codes';

/**
 * 构建验证失败的响应
 * @param errorCode 错误代码
 * @param errorParams 错误参数
 * @returns 验证结果
 */
export function createValidationFailure(
  errorCode: ValidationErrorCode,
  errorParams?: Record<string, any>
): ValidationRuleResult {
  return {
    isValid: false,
    errors: [{
      errorCode,
      errorParams
    }]
  };
}

/**
 * 构建验证成功的响应
 * @returns 验证结果
 */
export function createValidationSuccess(): ValidationRuleResult {
  return {
    isValid: true,
    errors: []
  };
}

/**
 * 构建类型检查失败的响应
 * @param expectedType 期望的类型
 * @param actualValue 实际值
 * @returns 验证结果
 */
export function createTypeValidationFailure(
  expectedType: string,
  actualValue: any
): ValidationRuleResult {
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING, {
    value: actualValue,
    expected: expectedType
  });
}

/**
 * 合并多个验证结果
 * @param results 验证结果数组
 * @returns 合并后的验证结果
 */
export function mergeValidationResults(
  ...results: ValidationRuleResult[]
): ValidationRuleResult {
  const allErrors = results
    .filter(result => !result.isValid)
    .flatMap(result => result.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}