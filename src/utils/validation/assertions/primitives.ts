// primitives.ts
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
  } & AssertErrorContextOptions = {}
): asserts value is string {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  // 复用现有的验证函数
  if (!validateString(value, validationOptions)) {
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
  } & AssertErrorContextOptions = {}
): asserts value is number {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateNumber(value, validationOptions)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
  }
}


/**
 * 布尔值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertBoolean(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is boolean {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): asserts value is Function {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): asserts value is symbol {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): asserts value is bigint {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  } & AssertErrorContextOptions = {}
): asserts value is number {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateInteger(value, validationOptions)) {
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
  } & AssertErrorContextOptions = {}
): asserts value is number {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validatePositiveInteger(value, validationOptions)) {
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
  } & AssertErrorContextOptions = {}
): asserts value is number {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateNonNegativeInteger(value, validationOptions)) {
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
  } & AssertErrorContextOptions = {}
): asserts value is number {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateFiniteNumber(value, validationOptions)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
  }
}

/**
 * NaN断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNaN(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is number {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): asserts value is T {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): asserts value is null | undefined {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): asserts value is T {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): (value: any) => asserts value is T {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): (value: any) => asserts value is T {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  if (value !== null && value !== undefined) {
    assertion(value);
  }
}