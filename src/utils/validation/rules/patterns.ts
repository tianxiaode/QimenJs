// rules/patterns.ts
import { ValidationRuleResult } from './base';
import { ValidationErrorCode } from './error-codes';
import { allRules } from './composition';
import { hasMinLength } from './constraints';

// 预定义的正则表达式模式
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const URL_PATTERN = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
export const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
export const IPV6_PATTERN = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
export const MAC_ADDRESS_PATTERN = /^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/;
export const PHONE_PATTERN = /^[\+]?[1-9][\d]{0,15}$/;
export const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
export const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
export const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
export const RGB_COLOR_PATTERN = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
export const RGBA_COLOR_PATTERN = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;
export const CREDIT_CARD_PATTERN = /^[\d\s\-]{13,19}$/;
export const CHINESE_ID_PATTERN = /(^\d{15}$)|(^\d{17}([0-9]|X)$)/;
export const CHINESE_POSTCODE_PATTERN = /^[1-9]\d{5}$/;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

// 密码相关模式
const UPPERCASE_PATTERN = /[A-Z]/;
const LOWERCASE_PATTERN = /[a-z]/;
const DIGIT_PATTERN = /\d/;
const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

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

export function matchesPattern(pattern: RegExp | string): (value: any) => ValidationRuleResult {
  return (value: any): ValidationRuleResult => {
    // 首先检查是否为字符串
    if (typeof value !== 'string') {
      return {
        isValid: false,
        errors: [{
          errorCode: ValidationErrorCode.TYPE_NOT_STRING,
          errorParams: { value }
        }]
      };
    }

    let regex: RegExp;
    if (pattern instanceof RegExp) {
      regex = pattern;
    } else {
      regex = new RegExp(pattern);
    }

    if (regex.test(value)) {
      return { isValid: true, errors: [] };
    }

    const patternText = pattern instanceof RegExp ? pattern.source : pattern;
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.PATTERN_MISMATCH,
        errorParams: { 
          pattern: patternText,
          patternText: `正则表达式: ${patternText}`,
          value
        }
      }]
    };
  };
}

/**
 * 创建基于特定模式和错误代码的验证函数
 * @param pattern 正则表达式模式
 * @param errorCode 错误代码
 * @param additionalValidation 额外验证函数（可选）
 */
function createPatternValidator(
  pattern: RegExp,
  errorCode: ValidationErrorCode,
  additionalValidation?: (value: string) => boolean
): (value: any) => ValidationRuleResult {
  return (value: any): ValidationRuleResult => {
    const patternRule = matchesPattern(pattern);
    const result = patternRule(value);
    
    if (!result.isValid) {
      return {
        isValid: false,
        errors: [{
          errorCode,
          errorParams: { value }
        }]
      };
    }
    
    // 如果提供了额外验证函数，则执行额外验证
    if (additionalValidation && typeof value === 'string' && !additionalValidation(value)) {
      return {
        isValid: false,
        errors: [{
          errorCode,
          errorParams: { value }
        }]
      };
    }
    
    return { isValid: true, errors: [] };
  };
}

// 使用工厂函数重构所有验证函数
export const isEmail = createPatternValidator(EMAIL_PATTERN, ValidationErrorCode.EMAIL_INVALID);
export const isURL = createPatternValidator(URL_PATTERN, ValidationErrorCode.URL_INVALID);
export const isMACAddress = createPatternValidator(MAC_ADDRESS_PATTERN, ValidationErrorCode.MAC_INVALID);
export const isPhoneNumber = createPatternValidator(PHONE_PATTERN, ValidationErrorCode.PHONE_INVALID);
export const isUUID = createPatternValidator(UUID_PATTERN, ValidationErrorCode.UUID_INVALID);
export const isBase64 = createPatternValidator(BASE64_PATTERN, ValidationErrorCode.BASE64_INVALID);
export const isHexColor = createPatternValidator(HEX_COLOR_PATTERN, ValidationErrorCode.HEX_COLOR_INVALID);
export const isRGBColor = createPatternValidator(RGB_COLOR_PATTERN, ValidationErrorCode.RGB_COLOR_INVALID);
export const isRGBAColor = createPatternValidator(RGBA_COLOR_PATTERN, ValidationErrorCode.RGBA_COLOR_INVALID);
export const isCreditCard = createPatternValidator(CREDIT_CARD_PATTERN, ValidationErrorCode.CREDIT_CARD_INVALID);
export const isChineseID = createPatternValidator(CHINESE_ID_PATTERN, ValidationErrorCode.CHINESE_ID_INVALID);
export const isChinesePostcode = createPatternValidator(CHINESE_POSTCODE_PATTERN, ValidationErrorCode.CHINESE_POSTCODE_INVALID);
export const isUsername = createPatternValidator(USERNAME_PATTERN, ValidationErrorCode.USERNAME_INVALID);

// 对于IPv4这样需要额外验证的，传入额外验证函数
export const isIPv4 = createPatternValidator(IPV4_PATTERN, ValidationErrorCode.IPV4_INVALID, (value: string) => {
  const parts = value.split('.');
  for (const part of parts) {
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) {
      return false;
    }
  }
  return true;
});

// IPv6保持简单形式
export const isIPv6 = createPatternValidator(IPV6_PATTERN, ValidationErrorCode.IPV6_INVALID);

/**
 * 检查是否为有效的数字字符串
 */
export function isNumericString(value: any): ValidationRuleResult {
  // 首先检查是否为字符串
  if (typeof value !== 'string') {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_STRING,
        errorParams: { value }
      }]
    };
  }

  // 检查是否为数字字符串（包括小数、科学计数法）
  const num = Number(value);
  if (isNaN(num) || value.trim() === '') {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.PATTERN_MISMATCH,
        errorParams: { 
          pattern: 'numeric string',
          patternText: '数字字符串',
          value
        }
      }]
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * 检查是否为有效的整数字符串
 */
export function isIntegerString(value: any): ValidationRuleResult {
  // 首先检查是否为字符串
  if (typeof value !== 'string') {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_STRING,
        errorParams: { value }
      }]
    };
  }

  const num = Number(value);
  if (!Number.isInteger(num) || isNaN(num) || value.trim() === '') {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.PATTERN_MISMATCH,
        errorParams: { 
          pattern: 'integer string',
          patternText: '整数字符串',
          value
        }
      }]
    };
  }

  return { isValid: true, errors: [] };
}

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
export function hasPasswordStrength(options: PasswordStrengthOptions = {}): (value: any) => ValidationRuleResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireDigits = true,
    requireSpecial = false
  } = options;

  // 构建规则数组
  const rules: Array<(value: any) => ValidationRuleResult> = [];
  
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