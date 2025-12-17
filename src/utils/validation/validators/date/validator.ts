import { DateValidationRules } from './types'
import {createDateValidator} from './builder'
import { assertValidation, ValidationResult } from '../../core';
/**
 * 快捷验证函数 - 简化调用
 * @param value 要验证的值
 * @param rules 验证规则
 * @returns 验证结果
 */
export function validateDate(value: Date, rules: DateValidationRules): ValidationResult {
    const validator = createDateValidator(rules);
    return validator(value);
}

/**
 * 断言数字
 * @param value 要验证的值
 * @param rules 验证规则
 * @param context 验证上下文 
 * @returns 
 */
export function assertDate(
  value: Date,
  rules: DateValidationRules,
  context?: Record<string, any>
): Date {
  const result = validateDate(value, rules);
  assertValidation(result, context)
  
  return value; // 返回原始值，便于链式调用
}