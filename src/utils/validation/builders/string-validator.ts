import { ValidationResult, StringValidationRules } from '../core';
import { isEmpty, hasMinLength, hasMaxLength } from '../constraints';
import { isString, isRequired } from '../rules';
import { matchesPattern } from '../patterns';
import { allRules, conditionalRule } from '../composition';

/**
 * 构建字符串验证器
 * @param rules 字符串验证规则配置
 * @returns 验证函数
 */
export function buildStringValidator(rules: StringValidationRules): (value: string) => ValidationResult {
  const validators: Array<(value: any) => ValidationResult> = [];
  // 类型检查
  validators.push((value: string) =>isString(value));

  // 必填验证
  if (rules.required) {
    validators.push((value: string) => isRequired(value));
  }

  // 最小长度验证
  if (rules.minLength !== undefined) {
    validators.push(
      conditionalRule(
        (value: string) => !isEmpty(value).isValid,
        (value: string) => hasMinLength(rules.minLength!)(value)
      )
    );
  }

  // 最大长度验证
  if (rules.maxLength !== undefined) {
    validators.push(
      conditionalRule(
        (value: string) => !isEmpty(value).isValid,
        (value: string) => hasMaxLength(rules.maxLength!)(value)
      )
    );
  }

  // 正则表达式验证
  if (rules.pattern) {
    validators.push(
      conditionalRule(
        (value: string) => !isEmpty(value).isValid,
        matchesPattern(rules.pattern!) // 直接传入 pattern，返回验证函数
      )
    );
  }

  // 自定义验证
  if (rules.custom) {
    validators.push(
      conditionalRule(
        (value: string) => !isEmpty(value).isValid,
        rules.custom
      )
    );
  }

  return allRules(...validators);
}