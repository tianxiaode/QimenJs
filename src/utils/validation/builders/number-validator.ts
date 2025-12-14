import { ValidationResult, NumberValidationRules } from '../base';
import { isNumber, isInteger, isRequired } from '../primitives';
import { hasMinValue, hasMaxValue } from '../constraints';
import { allRules, conditionalRule } from '../composition';

/**
 * 构建数字验证器
 * @param rules 数字验证规则配置
 * @returns 验证函数
 */
export function buildNumberValidator(rules: NumberValidationRules): (value: number) => ValidationResult {
  const validators: Array<(value: number) => ValidationResult> = [];

  // 类型检查
  validators.push((value: number) => isNumber(value));

  // 必填验证（对于数字来说，通常是检查是否为 NaN 或 null/undefined）
  if (rules.required) {
    validators.push((value: number) => isRequired(value));
  }

  // 最小值验证
  if (rules.min !== undefined) {
    validators.push(
      conditionalRule(
        (value: number) => value !== null && value !== undefined && !isNaN(value),
        (value: number) => hasMinValue(rules.min!, true)(value)
      )
    );
  }

  // 最大值验证
  if (rules.max !== undefined) {
    validators.push(
      conditionalRule(
        (value: number) => value !== null && value !== undefined && !isNaN(value),
        (value: number) => hasMaxValue(rules.max!, true)(value)
      )
    );
  }

  // 整数验证
  if (rules.integer) {
    validators.push(
      conditionalRule(
        (value: number) => value !== null && value !== undefined && !isNaN(value),
        (value: number) => isInteger(value)
      )
    );
  }

  // 正数验证
  if (rules.positive) {
    validators.push(
      conditionalRule(
        (value: number) => value !== null && value !== undefined && !isNaN(value),
        (value: number) => hasMinValue(0, false)(value) // 大于0
      )
    );
  }

  // 负数验证
  if (rules.negative) {
    validators.push(
      conditionalRule(
        (value: number) => value !== null && value !== undefined && !isNaN(value),
        (value: number) => hasMaxValue(0, false)(value) // 小于0
      )
    );
  }

  // 自定义验证
  if (rules.custom) {
    validators.push(
      conditionalRule(
        (value: number) => value !== null && value !== undefined && !isNaN(value),
        rules.custom
      )
    );
  }

  return allRules(...validators);
}