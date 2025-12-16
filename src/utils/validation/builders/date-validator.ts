import { ValidationResult, DateValidationRules } from '../core';
import { isDate, isRequired } from '../rules';
import { isGreaterThan, isLessThan } from '../constraints';
import { allRules, conditionalRule } from '../composition';

/**
 * 构建日期验证器
 * @param rules 日期验证规则配置
 * @returns 验证函数
 */
export function buildDateValidator(rules: DateValidationRules): (value: Date) => ValidationResult {
  const validators: Array<(value: Date) => ValidationResult> = [];

  // 类型检查
  validators.push((value: Date) => isDate(value));

  // 必填验证
  if (rules.required) {
    validators.push((value: Date) => isRequired(value));
  }

  // 最小日期验证
  if (rules.min instanceof Date) {
    validators.push(
      conditionalRule(
        (value: Date) => value instanceof Date && !isNaN(value.getTime()),
        (value: Date) => isGreaterThan(rules.min!.getTime(), true)(value.getTime())
      )
    );
  }

  // 最大日期验证
  if (rules.max instanceof Date) {
    validators.push(
      conditionalRule(
        (value: Date) => value instanceof Date && !isNaN(value.getTime()),
        (value: Date) => isLessThan(rules.max!.getTime(), true)(value.getTime())
      )
    );
  }

  // 未来日期验证
  if (rules.future) {
    validators.push(
      conditionalRule(
        (value: Date) => value instanceof Date && !isNaN(value.getTime()),
        (value: Date) => isGreaterThan(Date.now(), false)(value.getTime())
      )
    );
  }

  // 过去日期验证
  if (rules.past) {
    validators.push(
      conditionalRule(
        (value: Date) => value instanceof Date && !isNaN(value.getTime()),
        (value: Date) => isLessThan(Date.now(), false)(value.getTime())
      )
    );
  }

  // 自定义验证
  if (rules.custom) {
    validators.push(
      conditionalRule(
        (value: Date) => value instanceof Date && !isNaN(value.getTime()),
        rules.custom
      )
    );
  }

  return allRules(...validators);
}