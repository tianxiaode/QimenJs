import { BooleanValidationRules } from './types'
import {createBooleanValidator} from './builder'
import { assertValidation, ValidationResult } from '../../core';
/**
 * 快捷验证函数 - 简化调用
 * @param value 要验证的值
 * @param rules 验证规则
 * @returns 验证结果
 */
export function validateBoolean(value: any, rules: BooleanValidationRules): ValidationResult {
    const validator = createBooleanValidator(rules);
    return validator(value);
}

/**
 * 断言数字
 * @param value 要验证的值
 * @param rules 验证规则
 * @param context 验证上下文 
 * @returns 
 */
export function assertBoolean(
  value: any,
  rules: BooleanValidationRules,
  context?: Record<string, any>
): any {
  const result = validateBoolean(value, rules);
  assertValidation(result, context)
  
  return value; // 返回原始值，便于链式调用
}