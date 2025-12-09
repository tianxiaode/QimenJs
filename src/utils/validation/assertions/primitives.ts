import { InvalidInputError } from '../../error';
import { 
  isString, 
  isNumber, 
  isBoolean, 
  isFunction,
  isSymbol,
  isBigInt,
  isPrimitive,
  isTruthy,
  isFalsy,
  isInteger,
  isPositiveInteger,
  isNonNegativeInteger,
  isFiniteNumber,
  isNaN as isNaNValue
} from '../types';

/**
 * 基本类型断言函数
 * 这些函数用于断言基本数据类型，验证失败时抛出 InvalidInputError
 */

/**
 * 断言值为字符串
 */
export function assertString(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    nonEmpty?: boolean;
    minLength?: number;
    maxLength?: number;
    trim?: boolean;
    allowedValues?: string[];
    disallowedValues?: string[];
  }
): asserts value is string {
  const {
    paramName,
    functionName,
    message,
    nonEmpty = false,
    minLength,
    maxLength,
    trim = false,
    allowedValues,
    disallowedValues
  } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  let validatedValue = value;
  
  // 如果需要，先修剪字符串
  if (trim) {
    validatedValue = validatedValue.trim();
  }
  
  // 检查非空
  if (nonEmpty && validatedValue.length === 0) {
    throw new InvalidInputError(
      message || `${paramText} must be a non-empty string${functionText}`,
      { value, paramName, functionName } as any
    );
  }
  
  // 检查最小长度
  if (minLength !== undefined && validatedValue.length < minLength) {
    throw new InvalidInputError(
      message || `${paramText} must be at least ${minLength} characters long${functionText}`,
      { value, paramName, functionName, minLength } as any
    );
  }
  
  // 检查最大长度
  if (maxLength !== undefined && validatedValue.length > maxLength) {
    throw new InvalidInputError(
      message || `${paramText} must be at most ${maxLength} characters long${functionText}`,
      { value, paramName, functionName, maxLength } as any
    );
  }
  
  // 检查允许的值
  if (allowedValues !== undefined && !allowedValues.includes(validatedValue)) {
    throw new InvalidInputError(
      message || `${paramText} must be one of: ${allowedValues.join(', ')}${functionText}`,
      { value, paramName, functionName, allowedValues } as any
    );
  }
  
  // 检查不允许的值
  if (disallowedValues !== undefined && disallowedValues.includes(validatedValue)) {
    throw new InvalidInputError(
      message || `${paramText} must not be one of: ${disallowedValues.join(', ')}${functionText}`,
      { value, paramName, functionName, disallowedValues } as any
    );
  }
}

/**
 * 断言值为数字
 */
export function assertNumber(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
    negative?: boolean;
    nonNegative?: boolean;
    finite?: boolean;
    allowedValues?: number[];
  }
): asserts value is number {
  const {
    paramName,
    functionName,
    message,
    min,
    max,
    integer = false,
    positive = false,
    negative = false,
    nonNegative = false,
    finite = true,
    allowedValues
  } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isNumber(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a number${functionText}`,
      { value, paramName, functionName, expected: 'number' } as any
    );
  }
  
  // 检查有限数
  if (finite && !isFiniteNumber(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a finite number${functionText}`,
      { value, paramName, functionName, expected: 'finite number' } as any
    );
  }
  
  // 检查整数
  if (integer && !isInteger(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be an integer${functionText}`,
      { value, paramName, functionName, expected: 'integer' } as any
    );
  }
  
  // 检查正数
  if (positive && value <= 0) {
    throw new InvalidInputError(
      message || `${paramText} must be positive${functionText}`,
      { value, paramName, functionName, min: 0 } as any
    );
  }
  
  // 检查负数
  if (negative && value >= 0) {
    throw new InvalidInputError(
      message || `${paramText} must be negative${functionText}`,
      { value, paramName, functionName, max: 0 } as any
    );
  }
  
  // 检查非负数
  if (nonNegative && value < 0) {
    throw new InvalidInputError(
      message || `${paramText} must be non-negative${functionText}`,
      { value, paramName, functionName, min: 0 } as any
    );
  }
  
  // 检查最小值
  if (min !== undefined && value < min) {
    throw new InvalidInputError(
      message || `${paramText} must be at least ${min}${functionText}`,
      { value, paramName, functionName, min } as any
    );
  }
  
  // 检查最大值
  if (max !== undefined && value > max) {
    throw new InvalidInputError(
      message || `${paramText} must be at most ${max}${functionText}`,
      { value, paramName, functionName, max } as any
    );
  }
  
  // 检查允许的值
  if (allowedValues !== undefined && !allowedValues.includes(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be one of: ${allowedValues.join(', ')}${functionText}`,
      { value, paramName, functionName, allowedValues } as any
    );
  }
}

/**
 * 断言值为布尔值
 */
export function assertBoolean(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is boolean {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isBoolean(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a boolean${functionText}`,
      { value, paramName, functionName, expected: 'boolean' } as any
    );
  }
}

/**
 * 断言值为函数
 */
export function assertFunction(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is Function {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isFunction(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a function${functionText}`,
      { value, paramName, functionName, expected: 'function' } as any
    );
  }
}

/**
 * 断言值为 Symbol
 */
export function assertSymbol(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is symbol {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isSymbol(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a symbol${functionText}`,
      { value, paramName, functionName, expected: 'symbol' } as any
    );
  }
}

/**
 * 断言值为 BigInt
 */
export function assertBigInt(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is bigint {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isBigInt(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a bigint${functionText}`,
      { value, paramName, functionName, expected: 'bigint' } as any
    );
  }
}

/**
 * 断言值为原始类型
 */
export function assertPrimitive(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isPrimitive(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a primitive type${functionText}`,
      { value, paramName, functionName, expected: 'primitive' } as any
    );
  }
}

/**
 * 断言值为真值
 */
export function assertTruthy(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isTruthy(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be truthy${functionText}`,
      { value, paramName, functionName, expected: 'truthy' } as any
    );
  }
}

/**
 * 断言值为假值
 */
export function assertFalsy(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isFalsy(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be falsy${functionText}`,
      { value, paramName, functionName, expected: 'falsy' } as any
    );
  }
}

/**
 * 断言值为整数
 */
export function assertInteger(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    min?: number;
    max?: number;
    positive?: boolean;
    negative?: boolean;
    nonNegative?: boolean;
  }
): asserts value is number {
  const {
    paramName,
    functionName,
    message,
    min,
    max,
    positive = false,
    negative = false,
    nonNegative = false
  } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isInteger(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be an integer${functionText}`,
      { value, paramName, functionName, expected: 'integer' } as any
    );
  }
  
  // 检查正数
  if (positive && value <= 0) {
    throw new InvalidInputError(
      message || `${paramText} must be positive integer${functionText}`,
      { value, paramName, functionName, min: 1 } as any
    );
  }
  
  // 检查负数
  if (negative && value >= 0) {
    throw new InvalidInputError(
      message || `${paramText} must be negative integer${functionText}`,
      { value, paramName, functionName, max: -1 } as any
    );
  }
  
  // 检查非负数
  if (nonNegative && value < 0) {
    throw new InvalidInputError(
      message || `${paramText} must be non-negative integer${functionText}`,
      { value, paramName, functionName, min: 0 } as any
    );
  }
  
  // 检查最小值
  if (min !== undefined && value < min) {
    throw new InvalidInputError(
      message || `${paramText} must be at least ${min}${functionText}`,
      { value, paramName, functionName, min } as any
    );
  }
  
  // 检查最大值
  if (max !== undefined && value > max) {
    throw new InvalidInputError(
      message || `${paramText} must be at most ${max}${functionText}`,
      { value, paramName, functionName, max } as any
    );
  }
}

/**
 * 断言值为正整数
 */
export function assertPositiveInteger(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    min?: number;
    max?: number;
  }
): asserts value is number {
  const { paramName, functionName, message, min, max } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isPositiveInteger(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a positive integer${functionText}`,
      { value, paramName, functionName, min: 1 } as any
    );
  }
  
  // 检查最小值
  if (min !== undefined && value < min) {
    throw new InvalidInputError(
      message || `${paramText} must be at least ${min}${functionText}`,
      { value, paramName, functionName, min } as any
    );
  }
  
  // 检查最大值
  if (max !== undefined && value > max) {
    throw new InvalidInputError(
      message || `${paramText} must be at most ${max}${functionText}`,
      { value, paramName, functionName, max } as any
    );
  }
}

/**
 * 断言值为非负整数
 */
export function assertNonNegativeInteger(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    min?: number;
    max?: number;
  }
): asserts value is number {
  const { paramName, functionName, message, min, max } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isNonNegativeInteger(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a non-negative integer${functionText}`,
      { value, paramName, functionName, min: 0 } as any
    );
  }
  
  // 检查最小值
  if (min !== undefined && value < min) {
    throw new InvalidInputError(
      message || `${paramText} must be at least ${min}${functionText}`,
      { value, paramName, functionName, min } as any
    );
  }
  
  // 检查最大值
  if (max !== undefined && value > max) {
    throw new InvalidInputError(
      message || `${paramText} must be at most ${max}${functionText}`,
      { value, paramName, functionName, max } as any
    );
  }
}

/**
 * 断言值为有限数
 */
export function assertFiniteNumber(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    min?: number;
    max?: number;
  }
): asserts value is number {
  const { paramName, functionName, message, min, max } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isFiniteNumber(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a finite number${functionText}`,
      { value, paramName, functionName, expected: 'finite number' } as any
    );
  }
  
  // 检查最小值
  if (min !== undefined && value < min) {
    throw new InvalidInputError(
      message || `${paramText} must be at least ${min}${functionText}`,
      { value, paramName, functionName, min } as any
    );
  }
  
  // 检查最大值
  if (max !== undefined && value > max) {
    throw new InvalidInputError(
      message || `${paramText} must be at most ${max}${functionText}`,
      { value, paramName, functionName, max } as any
    );
  }
}

/**
 * 断言值为 NaN
 */
export function assertNaN(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is number {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isNaNValue(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be NaN${functionText}`,
      { value, paramName, functionName, expected: 'NaN' } as any
    );
  }
}

/**
 * 断言值等于指定值
 */
export function assertEqual<T>(
  value: any,
  expected: T,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is T {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (value !== expected) {
    throw new InvalidInputError(
      message || `${paramText} must equal ${expected}${functionText}`,
      { value, paramName, functionName, expected } as any
    );
  }
}

/**
 * 断言值不等于指定值
 */
export function assertNotEqual<T>(
  value: any,
  notExpected: T,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (value === notExpected) {
    throw new InvalidInputError(
      message || `${paramText} must not equal ${notExpected}${functionText}`,
      { value, paramName, functionName, notExpected } as any
    );
  }
}

/**
 * 断言值为 null 或 undefined
 */
export function assertNil(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is null | undefined {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (value !== null && value !== undefined) {
    throw new InvalidInputError(
      message || `${paramText} must be null or undefined${functionText}`,
      { value, paramName, functionName, expected: 'null or undefined' } as any
    );
  }
}

/**
 * 断言值不为 null 或 undefined
 */
export function assertNotNil<T>(
  value: T | null | undefined,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is T {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (value === null || value === undefined) {
    throw new InvalidInputError(
      message || `${paramText} must not be null or undefined${functionText}`,
      { value, paramName, functionName } as any
    );
  }
}

/**
 * 创建自定义断言器
 */
export function createAssertion<T>(
  predicate: (value: any) => value is T,
  message: string | ((value: any, paramName?: string, functionName?: string) => string)
): (value: any, paramName?: string, functionName?: string) => asserts value is T {
  return (value: any, paramName?: string, functionName?: string): asserts value is T => {
    const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
    const functionText = functionName ? ` in ${functionName}` : '';
    
    if (!predicate(value)) {
      const errorMessage = typeof message === 'function' 
        ? message(value, paramName, functionName)
        : `${paramText} ${message}${functionText}`;
      
      throw new InvalidInputError(
        errorMessage,
        { value, paramName, functionName } as any
      );
    }
  };
}
