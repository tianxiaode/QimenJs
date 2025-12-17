import { ValidationResult } from '../../core';
import { DateValidationRules } from './types';
import { isEmpty, hasMinLength, hasMaxLength,isString, isRequired,matchesPattern } from '../../rules';
import { allRules, conditionalRule } from '../../composition';

/**
 * 构建字符串验证器
 * @param rules 字符串验证规则配置
 * @returns 验证函数
 */
export function createDateValidator(rules: DateValidationRules): (value: any) => ValidationResult {
  const validators: Array<(value: any) => ValidationResult> = [];
  // 类型检查
  validators.push((value: string) =>isString(value));

  // 必填验证
  if (rules.required) {
    validators.push((value: string) => isRequired(value));
  }

  return allRules(...validators);
}