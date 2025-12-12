// rules/primitives.ts
import { ValidationErrorCode } from '../assertions/error-codes';
import { RuleResult } from './base';

/**
 * 字符串验证规则
 */
export interface StringRuleOptions {
  nonEmpty?: boolean;
  minLength?: number;
  maxLength?: number;
  trim?: boolean;
  allowedValues?: string[];
  disallowedValues?: string[];
}

export function stringRule(value: any, options: StringRuleOptions = {}): RuleResult {
  // 检查是否为字符串
  if (typeof value !== 'string') {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_STRING,
        errorParams: { value }
      }]
    };
  }

  const { 
    nonEmpty = false, 
    minLength, 
    maxLength, 
    trim = false,
    allowedValues,
    disallowedValues
  } = options;

  let validatedValue = value;
  if (trim) {
    validatedValue = validatedValue.trim();
  }

  // 检查非空
  if (nonEmpty && validatedValue.length === 0) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_EMPTY,
        errorParams: { value }
      }]
    };
  }

  // 检查最小长度
  if (minLength !== undefined && validatedValue.length < minLength) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.MIN_LENGTH,
        errorParams: { 
          min: minLength, 
          actualLength: validatedValue.length,
          value
        }
      }]
    };
  }

  // 检查最大长度
  if (maxLength !== undefined && validatedValue.length > maxLength) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.MAX_LENGTH,
        errorParams: { 
          max: maxLength, 
          actualLength: validatedValue.length,
          value
        }
      }]
    };
  }

  // 检查允许的值
  if (allowedValues !== undefined && !allowedValues.includes(validatedValue)) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_IN_COLLECTION,
        errorParams: { 
          collection: allowedValues,
          collectionText: `[${allowedValues.join(', ')}]`,
          value
        }
      }]
    };
  }

  // 检查不允许的值
  if (disallowedValues !== undefined && disallowedValues.includes(validatedValue)) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.IN_COLLECTION,
        errorParams: { 
          collection: disallowedValues,
          collectionText: `[${disallowedValues.join(', ')}]`,
          value
        }
      }]
    };
  }

  // 验证通过
  return { isValid: true, errors: [] };
}

/**
 * 数字验证规则
 */
export interface NumberRuleOptions {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
  nonNegative?: boolean;
  finite?: boolean;
  allowedValues?: number[];
}

export function numberRule(value: any, options: NumberRuleOptions = {}): RuleResult {
  // 检查是否为数字
  if (typeof value !== 'number') {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_NUMBER,
        errorParams: { value }
      }]
    };
  }

  const { 
    min, 
    max, 
    integer = false, 
    positive = false, 
    negative = false, 
    nonNegative = false,
    finite = true,
    allowedValues
  } = options;

  // 检查是否为有限数
  if (finite && !Number.isFinite(value)) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_NUMBER,
        errorParams: { value, expected: 'finite number' }
      }]
    };
  }

  // 检查是否为整数
  if (integer && !Number.isInteger(value)) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_NUMBER,
        errorParams: { value, expected: 'integer' }
      }]
    };
  }

  // 检查正数
  if (positive && value <= 0) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_GREATER_THAN,
        errorParams: { min: 0, actual: value }
      }]
    };
  }

  // 检查负数
  if (negative && value >= 0) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_LESS_THAN,
        errorParams: { max: 0, actual: value }
      }]
    };
  }

  // 检查非负数
  if (nonNegative && value < 0) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL,
        errorParams: { min: 0, actual: value }
      }]
    };
  }

  // 检查最小值
  if (min !== undefined && value < min) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL,
        errorParams: { min, actual: value }
      }]
    };
  }

  // 检查最大值
  if (max !== undefined && value > max) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL,
        errorParams: { max, actual: value }
      }]
    };
  }

  // 检查允许的值
  if (allowedValues !== undefined && !allowedValues.includes(value)) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_IN_COLLECTION,
        errorParams: { 
          collection: allowedValues,
          collectionText: `[${allowedValues.join(', ')}]`,
          value
        }
      }]
    };
  }

  // 验证通过
  return { isValid: true, errors: [] };
}

/**
 * 布尔值验证规则
 */
export function booleanRule(value: any): RuleResult {
  if (typeof value !== 'boolean') {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_BOOLEAN,
        errorParams: { value }
      }]
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * 日期验证规则
 */
export interface DateRuleOptions {
  min?: Date;
  max?: Date;
  past?: boolean;
  future?: boolean;
}

export function dateRule(value: any, options: DateRuleOptions = {}): RuleResult {
  // 检查是否为日期对象
  if (!(value instanceof Date)) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_DATE,
        errorParams: { value }
      }]
    };
  }

  // 检查是否为有效日期
  if (isNaN(value.getTime())) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_DATE,
        errorParams: { value, reason: 'Invalid Date' }
      }]
    };
  }

  const { min, max, past = false, future = false } = options;
  const timestamp = value.getTime();

  // 检查最小日期
  if (min !== undefined && timestamp < min.getTime()) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.DATE_TOO_EARLY,
        errorParams: { minDate: min, date: value }
      }]
    };
  }

  // 检查最大日期
  if (max !== undefined && timestamp > max.getTime()) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.DATE_TOO_LATE,
        errorParams: { maxDate: max, date: value }
      }]
    };
  }

  const now = Date.now();

  // 检查过去日期
  if (past && timestamp >= now) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.DATE_NOT_PAST,
        errorParams: { date: value }
      }]
    };
  }

  // 检查未来日期
  if (future && timestamp <= now) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.DATE_NOT_FUTURE,
        errorParams: { date: value }
      }]
    };
  }

  // 验证通过
  return { isValid: true, errors: [] };
}

/**
 * 正则表达式验证规则
 */
export function regexpRule(value: any): RuleResult {
  if (!(value instanceof RegExp)) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_REGEXP,
        errorParams: { value }
      }]
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * Symbol验证规则
 */
export function symbolRule(value: any): RuleResult {
  if (typeof value !== 'symbol') {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_SYMBOL,
        errorParams: { value }
      }]
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * BigInt验证规则
 */
export function bigIntRule(value: any): RuleResult {
  if (typeof value !== 'bigint') {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_BIGINT,
        errorParams: { value }
      }]
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * 原始类型验证规则
 */
export function primitiveRule(value: any): RuleResult {
  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    typeof value !== 'boolean' &&
    typeof value !== 'symbol' &&
    typeof value !== 'bigint' &&
    value !== null &&
    value !== undefined &&
    !(value instanceof Date) &&
    !(value instanceof RegExp)
  ) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_PRIMITIVE,
        errorParams: { value }
      }]
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * 真值验证规则
 */
export function truthyRule(value: any): RuleResult {
  if (!value) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_TRUTHY,
        errorParams: { value }
      }]
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * 假值验证规则
 */
export function falsyRule(value: any): RuleResult {
  if (value) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_FALSY,
        errorParams: { value }
      }]
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * 整数验证规则
 */
export interface IntegerRuleOptions {
  min?: number;
  max?: number;
  positive?: boolean;
  negative?: boolean;
  nonNegative?: boolean;
}

export function integerRule(value: any, options: IntegerRuleOptions = {}): RuleResult {
  // 检查是否为数字
  if (typeof value !== 'number') {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_NUMBER,
        errorParams: { value }
      }]
    };
  }

  // 检查是否为整数
  if (!Number.isInteger(value)) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_NUMBER,
        errorParams: { value, expected: 'integer' }
      }]
    };
  }

  const { min, max, positive, negative, nonNegative } = options;

  // 检查正整数
  if (positive && value <= 0) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_GREATER_THAN,
        errorParams: { min: 0, actual: value }
      }]
    };
  }

  // 检查负整数
  if (negative && value >= 0) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_LESS_THAN,
        errorParams: { max: 0, actual: value }
      }]
    };
  }

  // 检查非负整数
  if (nonNegative && value < 0) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL,
        errorParams: { min: 0, actual: value }
      }]
    };
  }

  // 检查最小值
  if (min !== undefined && value < min) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL,
        errorParams: { min, actual: value }
      }]
    };
  }

  // 检查最大值
  if (max !== undefined && value > max) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL,
        errorParams: { max, actual: value }
      }]
    };
  }

  // 验证通过
  return { isValid: true, errors: [] };
}

/**
 * 有限数验证规则
 */
export interface FiniteNumberRuleOptions {
  min?: number;
  max?: number;
}

export function finiteNumberRule(value: any, options: FiniteNumberRuleOptions = {}): RuleResult {
  // 检查是否为数字
  if (typeof value !== 'number') {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_NUMBER,
        errorParams: { value }
      }]
    };
  }

  // 检查是否为有限数
  if (!Number.isFinite(value)) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_NUMBER,
        errorParams: { value, expected: 'finite number' }
      }]
    };
  }

  const { min, max } = options;

  // 检查最小值
  if (min !== undefined && value < min) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL,
        errorParams: { min, actual: value }
      }]
    };
  }

  // 检查最大值
  if (max !== undefined && value > max) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL,
        errorParams: { max, actual: value }
      }]
    };
  }

  // 验证通过
  return { isValid: true, errors: [] };
}

/**
 * NaN验证规则
 */
export function nanRule(value: any): RuleResult {
  if (!Number.isNaN(value)) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.NOT_EQUAL,
        errorParams: { expected: 'NaN', actual: value }
      }]
    };
  }

  return { isValid: true, errors: [] };
}