import { NumberValidationRules, ValidationResult } from '../base';
import { buildNumberValidator } from '../builders';
import { assert } from '../assertion';
/**
 * 快捷验证函数 - 简化调用
 * @param value 要验证的值
 * @param rules 验证规则
 * @returns 验证结果
 */
export function validateNumber(value: number, rules: NumberValidationRules): ValidationResult {
    const validator = buildNumberValidator(rules);
    return validator(value);
}

/**
 * 断言数字
 * @param value 要验证的值
 * @param rules 验证规则
 * @param context 验证上下文 
 * @returns 
 */
export function assertNumber(
  value: number,
  rules: NumberValidationRules,
  context?: Record<string, any>
): number {
  const result = validateNumber(value, rules);
  assert(result, context)
  
  return value; // 返回原始值，便于链式调用
}