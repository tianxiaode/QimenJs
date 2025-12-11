import { ValidationErrorCode, ValidationErrorParams } from './error-codes';
import { createAssetErrorContext, AssertErrorContextOptions } from './error-context';
import {
  validateString,
  validateNumber,
  validateBoolean,
  validateFunction,
  validateSymbol,
  validateBigInt,
  validatePrimitive,
  validateTruthy,
  validateFalsy,
  validateInteger,
  validatePositiveInteger,
  validateNonNegativeInteger,
  validateFiniteNumber,
  validateNaN,
  validateEqual,
  validateNotEqual,
  validateNil,
  validateNotNil,
  createValidator,
  createConditionalValidator
} from '../validators';

/**
 * 字符串断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertString(
  value: any,
  options: {
    nonEmpty?: boolean;
    minLength?: number;
    maxLength?: number;
    trim?: boolean;
    allowedValues?: string[];
    disallowedValues?: string[];
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  // 复用现有的验证函数
  if (!validateString(value, options)) {
    // 根据失败原因抛出适当的错误
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    const { nonEmpty = false, minLength, maxLength, allowedValues, disallowedValues } = options;
    let validatedValue = value;
    
    if (options.trim) {
      validatedValue = validatedValue.trim();
    }
    
    // 检查具体失败原因
    if (nonEmpty && validatedValue.length === 0) {
      ctx.throwError(ValidationErrorCode.NOT_EMPTY);
    }
    
    if (minLength !== undefined && validatedValue.length < minLength) {
      ctx.throwError(ValidationErrorCode.MIN_LENGTH, { 
        min: minLength, 
        actualLength: validatedValue.length 
      });
    }
    
    if (maxLength !== undefined && validatedValue.length > maxLength) {
      ctx.throwError(ValidationErrorCode.MAX_LENGTH, { 
        max: maxLength, 
        actualLength: validatedValue.length 
      });
    }
    
    if (allowedValues !== undefined && !allowedValues.includes(validatedValue)) {
      ctx.throwError(ValidationErrorCode.NOT_IN_COLLECTION, { 
        collection: allowedValues,
        collectionText: `[${allowedValues.join(', ')}]`
      });
    }
    
    if (disallowedValues !== undefined && disallowedValues.includes(validatedValue)) {
      ctx.throwError(ValidationErrorCode.IN_COLLECTION, { 
        collection: disallowedValues,
        collectionText: `[${disallowedValues.join(', ')}]`
      });
    }
    
    // 未知原因
    ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
  }
}

/**
 * 数字断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNumber(
  value: any,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
    negative?: boolean;
    nonNegative?: boolean;
    finite?: boolean;
    allowedValues?: number[];
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateNumber(value, options)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    const { 
      min, max, integer, positive, negative, nonNegative, finite = true, allowedValues 
    } = options;
    
    // 检查具体失败原因
    if (finite && !Number.isFinite(value)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER, { expected: 'finite number' });
    }
    
    if (integer && !Number.isInteger(value)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER, { expected: 'integer' });
    }
    
    if (positive && value <= 0) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN, { min: 0, actual: value });
    }
    
    if (negative && value >= 0) {
      ctx.throwError(ValidationErrorCode.NOT_LESS_THAN, { max: 0, actual: value });
    }
    
    if (nonNegative && value < 0) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { min: 0, actual: value });
    }
    
    if (min !== undefined && value < min) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { min, actual: value });
    }
    
    if (max !== undefined && value > max) {
      ctx.throwError(ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL, { max, actual: value });
    }
    
    if (allowedValues !== undefined && !allowedValues.includes(value)) {
      ctx.throwError(ValidationErrorCode.NOT_IN_COLLECTION, { 
        collection: allowedValues,
        collectionText: `[${allowedValues.join(', ')}]`
      });
    }
    
    ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
  }
}

/**
 * 布尔值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertBoolean(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is boolean {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateBoolean(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_BOOLEAN);
  }
}

/**
 * 函数断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertFunction(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is Function {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateFunction(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_FUNCTION);
  }
}

/**
 * Symbol断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertSymbol(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is symbol {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateSymbol(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_SYMBOL);
  }
}

/**
 * BigInt断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertBigInt(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is bigint {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateBigInt(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_BIGINT);
  }
}

/**
 * 原始类型断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertPrimitive(
  value: any,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validatePrimitive(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_PRIMITIVE);
  }
}

/**
 * 真值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertTruthy(
  value: any,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateTruthy(value)) {
    ctx.throwError(ValidationErrorCode.NOT_TRUTHY);
  }
}

/**
 * 假值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertFalsy(
  value: any,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateFalsy(value)) {
    ctx.throwError(ValidationErrorCode.NOT_FALSY);
  }
}

/**
 * 整数断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertInteger(
  value: any,
  options: {
    min?: number;
    max?: number;
    positive?: boolean;
    negative?: boolean;
    nonNegative?: boolean;
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateInteger(value, options)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    if (!Number.isInteger(value)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER, { expected: 'integer' });
    }
    
    const { min, max, positive, negative, nonNegative } = options;
    
    // 检查具体失败原因
    if (positive && value <= 0) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN, { min: 0, actual: value });
    }
    
    if (negative && value >= 0) {
      ctx.throwError(ValidationErrorCode.NOT_LESS_THAN, { max: 0, actual: value });
    }
    
    if (nonNegative && value < 0) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { min: 0, actual: value });
    }
    
    if (min !== undefined && value < min) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { min, actual: value });
    }
    
    if (max !== undefined && value > max) {
      ctx.throwError(ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL, { max, actual: value });
    }
    
    ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
  }
}

/**
 * 正整数断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertPositiveInteger(
  value: any,
  options: {
    min?: number;
    max?: number;
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validatePositiveInteger(value, options)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    if (!Number.isInteger(value)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER, { expected: 'integer' });
    }
    
    if (value <= 0) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN, { min: 0, actual: value });
    }
    
    const { min, max } = options;
    
    if (min !== undefined && value < min) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { min, actual: value });
    }
    
    if (max !== undefined && value > max) {
      ctx.throwError(ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL, { max, actual: value });
    }
    
    ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
  }
}

/**
 * 非负整数断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNonNegativeInteger(
  value: any,
  options: {
    min?: number;
    max?: number;
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateNonNegativeInteger(value, options)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    if (!Number.isInteger(value)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER, { expected: 'integer' });
    }
    
    if (value < 0) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { min: 0, actual: value });
    }
    
    const { min, max } = options;
    
    if (min !== undefined && value < min) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { min, actual: value });
    }
    
    if (max !== undefined && value > max) {
      ctx.throwError(ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL, { max, actual: value });
    }
    
    ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
  }
}

/**
 * 有限数断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertFiniteNumber(
  value: any,
  options: {
    min?: number;
    max?: number;
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateFiniteNumber(value, options)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    if (!Number.isFinite(value)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER, { expected: 'finite number' });
    }
    
    const { min, max } = options;
    
    if (min !== undefined && value < min) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { min, actual: value });
    }
    
    if (max !== undefined && value > max) {
      ctx.throwError(ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL, { max, actual: value });
    }
    
    ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
  }
}

/**
 * NaN断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNaN(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateNaN(value)) {
    ctx.throwError(ValidationErrorCode.NOT_EQUAL, { expected: 'NaN', actual: value });
  }
}

/**
 * 相等断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEqual<T>(
  value: any,
  expected: T,
  contextOptions?: AssertErrorContextOptions
): asserts value is T {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateEqual(value, expected)) {
    ctx.throwError(ValidationErrorCode.NOT_EQUAL, { expected, actual: value } as any);
  }
}

/**
 * 不相等断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNotEqual<T>(
  value: any,
  notExpected: T,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateNotEqual(value, notExpected)) {
    ctx.throwError(ValidationErrorCode.EQUAL, { expected: notExpected, actual: value } as any);
  }
}

/**
 * null或undefined断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNil(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is null | undefined {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateNil(value)) {
    ctx.throwError(ValidationErrorCode.NOT_NULL_OR_UNDEFINED, { actual: value });
  }
}

/**
 * 非null或undefined断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNotNil<T>(
  value: T | null | undefined,
  contextOptions?: AssertErrorContextOptions
): asserts value is T {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateNotNil(value)) {
    ctx.throwError(ValidationErrorCode.NULL_OR_UNDEFINED, { actual: value });
  }
}

/**
 * 创建自定义断言器
 */
export function createAssert<T>(
  validator: (value: any) => value is T,
  errorCode: ValidationErrorCode = ValidationErrorCode.NOT_SATISFY_CONDITION,
  contextOptions?: AssertErrorContextOptions
): (value: any) => asserts value is T {
  const ctx = createAssetErrorContext(contextOptions);
  
  return (value: any): asserts value is T => {
    if (!validator(value)) {
      ctx.throwError(errorCode, { value });
    }
  };
}

/**
 * 创建带条件的断言器
 */
export function createConditionalAssert<T>(
  validator: (value: any) => value is T,
  condition: (value: T) => boolean,
  errorCode: ValidationErrorCode = ValidationErrorCode.NOT_SATISFY_CONDITION,
  contextOptions?: AssertErrorContextOptions
): (value: any) => asserts value is T {
  const ctx = createAssetErrorContext(contextOptions);
  
  return (value: any): asserts value is T => {
    if (!validator(value)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
    }
    
    if (!condition(value)) {
      ctx.throwError(errorCode, { value });
    }
  };
}

/**
 * 批量断言函数，用于一次验证多个条件
 * @throws {InvalidInputError} 当任意验证失败时
 */
export function assertAll(
  assertions: Array<() => void>,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  for (const assertion of assertions) {
    try {
      assertion();
    } catch (error) {
      // 重新抛出第一个错误
      throw error;
    }
  }
}

/**
 * 可选断言函数，仅当值不为null或undefined时进行断言
 */
export function assertOptional<T>(
  value: T | null | undefined,
  assertion: (value: T) => void,
  contextOptions?: AssertErrorContextOptions
): void {
  if (value !== null && value !== undefined) {
    assertion(value);
  }
}