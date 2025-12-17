import { ObjectValidationRules } from './types'
import {createObjectValidator} from './builder'
import { assertValidation, ValidationResult } from '../../core';
/**
 * 快捷验证函数 - 简化调用
 * @param value 要验证的值
 * @param rules 验证规则
 * @returns 验证结果
 */
export function validateObject(value: any, rules: ObjectValidationRules): ValidationResult {
    const validator = createObjectValidator(rules);
    return validator(value);
}

/**
 * 断言数字
 * @param value 要验证的值
 * @param rules 验证规则
 * @param context 验证上下文 
 * @returns 
 */
export function assertObject(
  value: any,
  rules: ObjectValidationRules,
  context?: Record<string, any>
): string {
  const result = validateObject(value, rules);
  assertValidation(result, context)
  
  return value; // 返回原始值，便于链式调用
}