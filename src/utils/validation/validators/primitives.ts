import { isString,isNumber,isFiniteNumber   } from '../types'
/**
 * 基本类型验证函数
 * 这些函数用于验证基本数据类型，并支持约束条件
 */

/**
 * 验证字符串
 * @param value 要验证的值
 * @param options 验证选项
 */
export function validateString(
  value: any,
  options: {
    nonEmpty?: boolean;          // 是否非空（排除空白字符）
    minLength?: number;          // 最小长度
    maxLength?: number;          // 最大长度
    trim?: boolean;              // 验证前是否修剪空白字符
    allowedValues?: string[];    // 允许的值列表
    disallowedValues?: string[]; // 不允许的值列表
  } = {}
): value is string {
  if (!isString(value)) {
    return false;
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
  
  // 如果需要，先修剪字符串
  if (trim) {
    validatedValue = validatedValue.trim();
  }
  
  // 检查非空
  if (nonEmpty && validatedValue.length === 0) {
    return false;
  }
  
  // 检查最小长度
  if (minLength !== undefined && validatedValue.length < minLength) {
    return false;
  }
  
  // 检查最大长度
  if (maxLength !== undefined && validatedValue.length > maxLength) {
    return false;
  }
  
  // 检查允许的值
  if (allowedValues !== undefined && !allowedValues.includes(validatedValue)) {
    return false;
  }
  
  // 检查不允许的值
  if (disallowedValues !== undefined && disallowedValues.includes(validatedValue)) {
    return false;
  }
  
  return true;
}

/**
 * 验证数字
 * @param value 要验证的值
 * @param options 验证选项
 */
export function validateNumber(
  value: any,
  options: {
    min?: number;               // 最小值
    max?: number;               // 最大值
    integer?: boolean;          // 是否为整数
    positive?: boolean;         // 是否为正数
    negative?: boolean;         // 是否为负数
    nonNegative?: boolean;      // 是否非负数
    finite?: boolean;           // 是否为有限数
    allowedValues?: number[];   // 允许的值列表
  } = {}
): value is number {
  if (!isNumber(value)) {
    return false;
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
  
  // 检查有限数
  if (finite && !isFiniteNumber(value)) {
    return false;
  }
  
  // 检查整数
  if (integer && !isInteger(value)) {
    return false;
  }
  
  // 检查正数
  if (positive && value <= 0) {
    return false;
  }
  
  // 检查负数
  if (negative && value >= 0) {
    return false;
  }
  
  // 检查非负数
  if (nonNegative && value < 0) {
    return false;
  }
  
  // 检查最小值
  if (min !== undefined && value < min) {
    return false;
  }
  
  // 检查最大值
  if (max !== undefined && value > max) {
    return false;
  }
  
  // 检查允许的值
  if (allowedValues !== undefined && !allowedValues.includes(value)) {
    return false;
  }
  
  return true;
}

/**
 * 验证布尔值
 * @param value 要验证的值
 */
export function validateBoolean(value: any): value is boolean {
  return isBoolean(value);
}

/**
 * 验证函数
 * @param value 要验证的值
 */
export function validateFunction(value: any): value is Function {
  return isFunction(value);
}

/**
 * 验证 Symbol
 * @param value 要验证的值
 */
export function validateSymbol(value: any): value is symbol {
  return isSymbol(value);
}

/**
 * 验证 BigInt
 * @param value 要验证的值
 */
export function validateBigInt(value: any): value is bigint {
  return isBigInt(value);
}

/**
 * 验证原始类型
 * @param value 要验证的值
 */
export function validatePrimitive(value: any): boolean {
  return isPrimitive(value);
}

/**
 * 验证真值
 * @param value 要验证的值
 */
export function validateTruthy(value: any): boolean {
  return isTruthy(value);
}

/**
 * 验证假值
 * @param value 要验证的值
 */
export function validateFalsy(value: any): boolean {
  return isFalsy(value);
}

/**
 * 验证整数
 * @param value 要验证的值
 * @param options 验证选项
 */
export function validateInteger(
  value: any,
  options: {
    min?: number;
    max?: number;
    positive?: boolean;
    negative?: boolean;
    nonNegative?: boolean;
  } = {}
): value is number {
  if (!isInteger(value)) {
    return false;
  }
  
  const {
    min,
    max,
    positive = false,
    negative = false,
    nonNegative = false
  } = options;
  
  // 检查正数
  if (positive && value <= 0) {
    return false;
  }
  
  // 检查负数
  if (negative && value >= 0) {
    return false;
  }
  
  // 检查非负数
  if (nonNegative && value < 0) {
    return false;
  }
  
  // 检查最小值
  if (min !== undefined && value < min) {
    return false;
  }
  
  // 检查最大值
  if (max !== undefined && value > max) {
    return false;
  }
  
  return true;
}

/**
 * 验证正整数
 * @param value 要验证的值
 * @param options 验证选项
 */
export function validatePositiveInteger(
  value: any,
  options: {
    min?: number;
    max?: number;
  } = {}
): value is number {
  if (!isPositiveInteger(value)) {
    return false;
  }
  
  const { min, max } = options;
  
  // 检查最小值
  if (min !== undefined && value < min) {
    return false;
  }
  
  // 检查最大值
  if (max !== undefined && value > max) {
    return false;
  }
  
  return true;
}

/**
 * 验证非负整数
 * @param value 要验证的值
 * @param options 验证选项
 */
export function validateNonNegativeInteger(
  value: any,
  options: {
    min?: number;
    max?: number;
  } = {}
): value is number {
  if (!isNonNegativeInteger(value)) {
    return false;
  }
  
  const { min, max } = options;
  
  // 检查最小值
  if (min !== undefined && value < min) {
    return false;
  }
  
  // 检查最大值
  if (max !== undefined && value > max) {
    return false;
  }
  
  return true;
}

/**
 * 验证有限数
 * @param value 要验证的值
 * @param options 验证选项
 */
export function validateFiniteNumber(
  value: any,
  options: {
    min?: number;
    max?: number;
  } = {}
): value is number {
  if (!isFiniteNumber(value)) {
    return false;
  }
  
  const { min, max } = options;
  
  // 检查最小值
  if (min !== undefined && value < min) {
    return false;
  }
  
  // 检查最大值
  if (max !== undefined && value > max) {
    return false;
  }
  
  return true;
}

/**
 * 验证 NaN
 * @param value 要验证的值
 */
export function validateNaN(value: any): value is number {
  return isNaNValue(value);
}

/**
 * 验证值是否等于指定值
 * @param value 要验证的值
 * @param expected 期望的值
 */
export function validateEqual<T>(value: any, expected: T): value is T {
  return value === expected;
}

/**
 * 验证值是否不等于指定值
 * @param value 要验证的值
 * @param notExpected 不期望的值
 */
export function validateNotEqual<T>(value: any, notExpected: T): boolean {
  return value !== notExpected;
}

/**
 * 验证值是否为 null 或 undefined
 * @param value 要验证的值
 */
export function validateNil(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * 验证值是否不为 null 或 undefined
 * @param value 要验证的值
 */
export function validateNotNil<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * 创建自定义验证器
 * @param predicate 验证谓词函数
 */
export function createValidator<T>(
  predicate: (value: any) => value is T
): (value: any) => value is T {
  return predicate;
}

/**
 * 创建带条件的验证器
 * @param validator 基础验证器
 * @param condition 额外条件函数
 */
export function createConditionalValidator<T>(
  validator: (value: any) => value is T,
  condition: (value: T) => boolean
): (value: any) => value is T {
  return (value: any): value is T => {
    return validator(value) && condition(value);
  };
}
