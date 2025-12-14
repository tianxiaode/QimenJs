// rules/patterns/regex.ts
import { ValidationErrorCode } from '../constants/error-codes';
import { ValidationResult,createValidationFailure, createValidationSuccess } from '../base';

/**
 * 通用模式匹配规则
 * @param pattern 正则表达式或字符串模式
 */
export interface MatchesPatternOptions {
  caseSensitive?: boolean;
  global?: boolean;
  multiline?: boolean;
  ignoreCase?: boolean;
  sticky?: boolean;
  unicode?: boolean;
}

export function matchesPattern(pattern: RegExp | string): (value: any) => ValidationResult {
  return (value: any): ValidationResult => {
    // 首先检查是否为字符串
    if (typeof value !== 'string') {
      return createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING, { value });
    }

    let regex: RegExp;
    if (pattern instanceof RegExp) {
      regex = pattern;
    } else {
      regex = new RegExp(pattern);
    }

    if (regex.test(value)) {
      return createValidationSuccess();
    }

    const patternText = pattern instanceof RegExp ? pattern.source : pattern;
    return createValidationFailure(ValidationErrorCode.PATTERN_MISMATCH, { 
      pattern: patternText,
      patternText: `正则表达式: ${patternText}`,
      value
    });
  };
}