import { ArrayValidationRules, ValidationResult } from '../base';
import { buildArrayValidator } from '../builders';
import { assert } from '../assertion';
/**
 * 快捷验证函数 - 简化调用
 * @param value 要验证的值
 * @param rules 验证规则
 * @returns 验证结果
 */
export function validateArray(value: any[], rules: ArrayValidationRules): ValidationResult {
    const validator = buildArrayValidator(rules);
    return validator(value);
}

/**
 * 断言数组
 * @param value 要验证的值
 * @param rules 验证规则
 * @param context 验证上下文 
 * @returns 
 */
export function assertArray(
  value: any[],
  rules: ArrayValidationRules,
  context?: Record<string, any>
): any[] {
  const result = validateArray(value, rules);
  assert(result, context)
  
  return value; // 返回原始值，便于链式调用
}