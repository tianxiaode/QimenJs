import { InvalidInputError } from '../error';
import { isArray, isFunction, isBoolean, isNumber, isInteger,isString, isEmptyString,isObject,isEmptyArray  } from './types';

/**
 * 断言函数 - 验证失败时抛出错误
 */

/**
 * 断言值为数组
 */
export function assertArray(
  value: any, 
  paramName?: string, 
  functionName?: string
): asserts value is any[] {
  if (!isArray(value)) {
    const paramText = paramName ? `Parameter '${paramName}'` : 'Input';
    const functionText = functionName ? ` in ${functionName}` : '';
    throw new InvalidInputError(
      `${paramText} must be an array${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        expected: 'Array' 
      } as any
    );
  }
}

/**
 * 断言值为函数
 */
export function assertFunction(
  value: any, 
  paramName?: string, 
  functionName?: string
): asserts value is Function {
  if (!isFunction(value)) {
    const paramText = paramName ? `Parameter '${paramName}'` : 'Input';
    const functionText = functionName ? ` in ${functionName}` : '';
    throw new InvalidInputError(
      `${paramText} must be a function${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        expected: 'Function' 
      } as any
    );
  }
}

/**
 * 断言值为数字
 */
export function assertNumber(
  value: any, 
  paramName?: string, 
  functionName?: string,
  options?: {
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
  }
): asserts value is number {
  const paramText = paramName ? `Parameter '${paramName}'` : 'Input';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isNumber(value)) {
    throw new InvalidInputError(
      `${paramText} must be a number${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        expected: 'Number' 
      } as any
    );
  }
  
  const { min, max, integer, positive } = options || {};
  
  if (integer !== undefined && !isInteger(value)) {
    throw new InvalidInputError(
      `${paramText} must be an integer${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        expected: 'Integer' 
      } as any
    );
  }
  
  if (positive !== undefined && value <= 0) {
    throw new InvalidInputError(
      `${paramText} must be positive${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        min: 0 
      } as any
    );
  }
  
  if (min !== undefined && value < min) {
    throw new InvalidInputError(
      `${paramText} must be at least ${min}${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        min 
      } as any
    );
  }
  
  if (max !== undefined && value > max) {
    throw new InvalidInputError(
      `${paramText} must be at most ${max}${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        max 
      } as any
    );
  }
}

/**
 * 断言值为字符串
 */
export function assertString(
  value: any, 
  paramName?: string, 
  functionName?: string,
  options?: {
    nonEmpty?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }
): asserts value is string {
  const paramText = paramName ? `Parameter '${paramName}'` : 'Input';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      `${paramText} must be a string${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        expected: 'String' 
      } as any
    );
  }
  
  const { nonEmpty, minLength, maxLength, pattern } = options || {};
  
  if (nonEmpty && isEmptyString(value)) {
    throw new InvalidInputError(
      `${paramText} must be a non-empty string${functionText}`,
      { 
        value, 
        paramName, 
        functionName 
      } as any
    );
  }
  
  if (minLength !== undefined && value.length < minLength) {
    throw new InvalidInputError(
      `${paramText} must be at least ${minLength} characters${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        minLength 
      } as any
    );
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    throw new InvalidInputError(
      `${paramText} must be at most ${maxLength} characters${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        maxLength 
      } as any
    );
  }
  
  if (pattern !== undefined && !pattern.test(value)) {
    throw new InvalidInputError(
      `${paramText} must match pattern ${pattern}${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        pattern: pattern.toString() 
      } as any
    );
  }
}

/**
 * 断言值为对象
 */
export function assertObject(
  value: any, 
  paramName?: string, 
  functionName?: string
): asserts value is Record<string, any> {
  if (!isObject(value)) {
    const paramText = paramName ? `Parameter '${paramName}'` : 'Input';
    const functionText = functionName ? ` in ${functionName}` : '';
    throw new InvalidInputError(
      `${paramText} must be an object${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        expected: 'Object' 
      } as any
    );
  }
}

/**
 * 断言值为布尔值
 */
export function assertBoolean(
  value: any, 
  paramName?: string, 
  functionName?: string
): asserts value is boolean {
  if (!isBoolean(value)) {
    const paramText = paramName ? `Parameter '${paramName}'` : 'Input';
    const functionText = functionName ? ` in ${functionName}` : '';
    throw new InvalidInputError(
      `${paramText} must be a boolean${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        expected: 'Boolean' 
      } as any
    );
  }
}

/**
 * 断言数组不为空
 */
export function assertNonEmptyArray<T>(
  value: T[], 
  paramName?: string, 
  functionName?: string
): asserts value is [T, ...T[]] {
  assertArray(value, paramName, functionName);
  
  if (isEmptyArray(value)) {
    const paramText = paramName ? `Parameter '${paramName}'` : 'Array';
    const functionText = functionName ? ` in ${functionName}` : '';
    throw new InvalidInputError(
      `${paramText} must not be empty${functionText}`,
      { 
        value, 
        paramName, 
        functionName 
      } as any
    );
  }
}

/**
 * 断言值在指定范围内
 */
export function assertInRange(
  value: number,
  min: number,
  max: number,
  paramName?: string,
  functionName?: string
): void {
  assertNumber(value, paramName, functionName);
  
  if (value < min || value > max) {
    const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
    const functionText = functionName ? ` in ${functionName}` : '';
    throw new InvalidInputError(
      `${paramText} must be between ${min} and ${max}${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        min, 
        max 
      } as any
    );
  }
}

/**
 * 断言值在指定选项中
 */
export function assertOneOf<T>(
  value: any,
  allowedValues: T[],
  paramName?: string,
  functionName?: string
): asserts value is T {
  if (!allowedValues.includes(value)) {
    const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
    const functionText = functionName ? ` in ${functionName}` : '';
    throw new InvalidInputError(
      `${paramText} must be one of: ${allowedValues.join(', ')}${functionText}`,
      { 
        value, 
        paramName, 
        functionName, 
        allowedValues 
      } as any
    );
  }
}

/**
 * 自定义断言
 */
export function assert(
  condition: boolean,
  message: string,
  context?: Record<string, any>
): asserts condition {
  if (!condition) {
    throw new InvalidInputError(message, context);
  }
}
