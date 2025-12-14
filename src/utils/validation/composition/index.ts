// rules/composition/index.ts
import { ValidationResult, ValidationError } from '../base';

/**
 * 组合多个规则，全部通过才算通过 (AND 逻辑)
 * @param rules 规则函数数组
 * @returns 组合后的规则函数
 */
export function allRules<T>(...rules: Array<(value: T) => ValidationResult>): (value: T) => ValidationResult {
  return (value: T): ValidationResult => {
    const allErrors: ValidationError[] = [];
    let isValid = true;
    
    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        isValid = false;
        allErrors.push(...result.errors);
      }
    }
    
    return {
      isValid,
      errors: allErrors
    };
  };
}

/**
 * 组合多个规则，任一通过就算通过 (OR 逻辑)
 * @param rules 规则函数数组
 * @returns 组合后的规则函数
 */
export function anyRules<T>(...rules: Array<(value: T) => ValidationResult>): (value: T) => ValidationResult {
  return (value: T): ValidationResult => {
    const failedResults: ValidationResult[] = [];
    
    for (const rule of rules) {
      const result = rule(value);
      if (result.isValid) {
        return { isValid: true, errors: [] };
      }
      failedResults.push(result);
    }
    
    // 如果所有规则都失败，合并所有错误
    const allErrors = failedResults.flatMap(r => r.errors);
    return {
      isValid: false,
      errors: allErrors
    };
  };
}

/**
 * 反转规则结果 (NOT 逻辑)
 * @param rule 规则函数
 * @returns 反转后的规则函数
 */
export function notRule<T>(rule: (value: T) => ValidationResult): (value: T) => ValidationResult {
  return (value: T): ValidationResult => {
    const result = rule(value);
    if (result.isValid) {
      return {
        isValid: false,
        errors: [{
          errorCode: 'NOT_SATISFY_CONDITION',
          errorParams: { value }
        }]
      };
    } else {
      return {
        isValid: true,
        errors: []
      };
    }
  };
}

/**
 * 条件规则：仅当条件满足时才应用规则
 * @param condition 条件函数
 * @param rule 规则函数
 * @returns 条件规则函数
 */
export function conditionalRule<T>(
  condition: (value: T) => boolean,
  rule: (value: T) => ValidationResult
): (value: T) => ValidationResult {
  return (value: T): ValidationResult => {
    if (condition(value)) {
      return rule(value);
    }
    return { isValid: true, errors: [] };
  };
}