import {
    ValidationResult,
    UPPERCASE_PATTERN,
    LOWERCASE_PATTERN,
    DIGIT_PATTERN,
    SPECIAL_CHAR_PATTERN,    
} from '../../core';

import { hasMinLength, } from '../size';
import { matchesPattern } from './regex';
import { allRules } from '../../composition';

/**
 * 密码强度验证选项
 */
export interface PasswordStrengthOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireDigits?: boolean;
  requireSpecial?: boolean;
}

/**
 * 密码强度验证规则构建器
 */
export function hasPasswordStrength(options: PasswordStrengthOptions = {}): (value: any) => ValidationResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireDigits = true,
    requireSpecial = false
  } = options;

  // 构建规则数组
  const rules: Array<(value: any) => ValidationResult> = [];
  
  // 添加长度规则
  rules.push(hasMinLength(minLength));
  
  // 根据选项添加其他规则，都使用通用的模式匹配规则
  if (requireUppercase) {
    rules.push(matchesPattern(UPPERCASE_PATTERN));
  }
  
  if (requireLowercase) {
    rules.push(matchesPattern(LOWERCASE_PATTERN));
  }
  
  if (requireDigits) {
    rules.push(matchesPattern(DIGIT_PATTERN));
  }
  
  if (requireSpecial) {
    rules.push(matchesPattern(SPECIAL_CHAR_PATTERN));
  }
  
  // 使用 allRules 组合所有规则
  return allRules(...rules);
}