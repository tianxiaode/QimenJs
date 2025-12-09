import { InvalidInputError } from '../../error';
import {
  isArray,
  isArrayLike,
  isObject,
  isPlainObject,
  isDate,
  isRegExp,
  isMap,
  isSet,
  isPromise,
  isError,
  isTypedArray,
  isBuffer,
  isFormData,
  isURLSearchParams,
  isFile,
  isBlob,
  isEmptyArray,
  isEmptyObject,
  isEmptyMap,
  isEmptySet
} from '../types';

/**
 * 结构类型断言函数
 * 这些函数用于断言结构化数据类型，验证失败时抛出 InvalidInputError
 */

/**
 * 断言值为数组
 */
export function assertArray<T = any>(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    nonEmpty?: boolean;
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: any, index: number) => boolean;
    allowEmptyItems?: boolean;
    unique?: boolean;
  }
): asserts value is T[] {
  const {
    paramName,
    functionName,
    message,
    nonEmpty = false,
    minLength,
    maxLength,
    itemValidator,
    allowEmptyItems = true,
    unique = false
  } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isArray(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be an array${functionText}`,
      { value, paramName, functionName, expected: 'array' } as any
    );
  }
  
  // 检查非空
  if (nonEmpty && isEmptyArray(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a non-empty array${functionText}`,
      { value, paramName, functionName } as any
    );
  }
  
  // 检查最小长度
  if (minLength !== undefined && value.length < minLength) {
    throw new InvalidInputError(
      message || `${paramText} must have at least ${minLength} items${functionText}`,
      { value, paramName, functionName, minLength } as any
    );
  }
  
  // 检查最大长度
  if (maxLength !== undefined && value.length > maxLength) {
    throw new InvalidInputError(
      message || `${paramText} must have at most ${maxLength} items${functionText}`,
      { value, paramName, functionName, maxLength } as any
    );
  }
  
  // 检查元素唯一性
  if (unique) {
    const seen = new Set();
    for (const item of value) {
      const key = typeof item === 'object' && item !== null ? 
        Symbol.for('object') : item;
      if (seen.has(key)) {
        throw new InvalidInputError(
          message || `${paramText} must contain unique items${functionText}`,
          { value, paramName, functionName, duplicate: item } as any
        );
      }
      seen.add(key);
    }
  }
  
  // 检查项目验证器
  if (itemValidator) {
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      
      // 检查是否允许空项目
      if (!allowEmptyItems && (item === null || item === undefined)) {
        throw new InvalidInputError(
          message || `${paramText}[${i}] must not be null or undefined${functionText}`,
          { value, paramName, functionName, index: i } as any
        );
      }
      
      // 使用项目验证器
      if (!itemValidator(item, i)) {
        throw new InvalidInputError(
          message || `${paramText}[${i}] is invalid${functionText}`,
          { value, paramName, functionName, index: i, item } as any
        );
      }
    }
  }
}

/**
 * 断言值为类数组对象
 */
export function assertArrayLike(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is ArrayLike<any> {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isArrayLike(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be an array-like object${functionText}`,
      { value, paramName, functionName, expected: 'array-like' } as any
    );
  }
}

/**
 * 断言值为对象
 */
export function assertObject(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    nonEmpty?: boolean;
    requiredKeys?: string[];
    allowedKeys?: string[];
    disallowedKeys?: string[];
    minKeys?: number;
    maxKeys?: number;
    valueValidator?: (key: string, value: any) => boolean;
  }
): asserts value is Record<string, any> {
  const {
    paramName,
    functionName,
    message,
    nonEmpty = false,
    requiredKeys,
    allowedKeys,
    disallowedKeys,
    minKeys,
    maxKeys,
    valueValidator
  } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isObject(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be an object${functionText}`,
      { value, paramName, functionName, expected: 'object' } as any
    );
  }
  
  const keys = Object.keys(value);
  
  // 检查非空
  if (nonEmpty && isEmptyObject(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a non-empty object${functionText}`,
      { value, paramName, functionName } as any
    );
  }
  
  // 检查最少键数
  if (minKeys !== undefined && keys.length < minKeys) {
    throw new InvalidInputError(
      message || `${paramText} must have at least ${minKeys} keys${functionText}`,
      { value, paramName, functionName, minKeys, actualKeys: keys.length } as any
    );
  }
  
  // 检查最多键数
  if (maxKeys !== undefined && keys.length > maxKeys) {
    throw new InvalidInputError(
      message || `${paramText} must have at most ${maxKeys} keys${functionText}`,
      { value, paramName, functionName, maxKeys, actualKeys: keys.length } as any
    );
  }
  
  // 检查必需的键
  if (requiredKeys !== undefined) {
    for (const key of requiredKeys) {
      if (!(key in value)) {
        throw new InvalidInputError(
          message || `${paramText} must have required key '${key}'${functionText}`,
          { value, paramName, functionName, missingKey: key } as any
        );
      }
    }
  }
  
  // 检查允许的键
  if (allowedKeys !== undefined) {
    for (const key of keys) {
      if (!allowedKeys.includes(key)) {
        throw new InvalidInputError(
          message || `${paramText} contains disallowed key '${key}'${functionText}`,
          { value, paramName, functionName, disallowedKey: key, allowedKeys } as any
        );
      }
    }
  }
  
  // 检查不允许的键
  if (disallowedKeys !== undefined) {
    for (const key of keys) {
      if (disallowedKeys.includes(key)) {
        throw new InvalidInputError(
          message || `${paramText} contains forbidden key '${key}'${functionText}`,
          { value, paramName, functionName, forbiddenKey: key, disallowedKeys } as any
        );
      }
    }
  }
  
  // 检查值验证器
  if (valueValidator) {
    for (const key of keys) {
      if (!valueValidator(key, value[key])) {
        throw new InvalidInputError(
          message || `${paramText}.${key} has invalid value${functionText}`,
          { value, paramName, functionName, key, keyValue: value[key] } as any
        );
      }
    }
  }
}

/**
 * 断言值为纯对象
 */
export function assertPlainObject(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is Record<string, any> {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isPlainObject(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a plain object${functionText}`,
      { value, paramName, functionName, expected: 'plain object' } as any
    );
  }
}

/**
 * 断言值为日期
 */
export function assertDate(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    min?: Date;
    max?: Date;
    past?: boolean;
    future?: boolean;
  }
): asserts value is Date {
  const {
    paramName,
    functionName,
    message,
    min,
    max,
    past = false,
    future = false
  } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isDate(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a valid date${functionText}`,
      { value, paramName, functionName, expected: 'Date' } as any
    );
  }
  
  const timestamp = value.getTime();
  
  // 检查最小日期
  if (min !== undefined && timestamp < min.getTime()) {
    throw new InvalidInputError(
      message || `${paramText} must be on or after ${min.toISOString()}${functionText}`,
      { value, paramName, functionName, min } as any
    );
  }
  
  // 检查最大日期
  if (max !== undefined && timestamp > max.getTime()) {
    throw new InvalidInputError(
      message || `${paramText} must be on or before ${max.toISOString()}${functionText}`,
      { value, paramName, functionName, max } as any
    );
  }
  
  const now = Date.now();
  
  // 检查过去日期
  if (past && timestamp >= now) {
    throw new InvalidInputError(
      message || `${paramText} must be in the past${functionText}`,
      { value, paramName, functionName } as any
    );
  }
  
  // 检查未来日期
  if (future && timestamp <= now) {
    throw new InvalidInputError(
      message || `${paramText} must be in the future${functionText}`,
      { value, paramName, functionName } as any
    );
  }
}

/**
 * 断言值为正则表达式
 */
export function assertRegExp(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is RegExp {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isRegExp(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a regular expression${functionText}`,
      { value, paramName, functionName, expected: 'RegExp' } as any
    );
  }
}

/**
 * 断言值为 Map
 */
export function assertMap<K = any, V = any>(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    nonEmpty?: boolean;
    minSize?: number;
    maxSize?: number;
    keyValidator?: (key: K) => boolean;
    valueValidator?: (value: V) => boolean;
  }
): asserts value is Map<K, V> {
  const {
    paramName,
    functionName,
    message,
    nonEmpty = false,
    minSize,
    maxSize,
    keyValidator,
    valueValidator
  } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isMap(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a Map${functionText}`,
      { value, paramName, functionName, expected: 'Map' } as any
    );
  }
  
  // 检查非空
  if (nonEmpty && isEmptyMap(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a non-empty Map${functionText}`,
      { value, paramName, functionName } as any
    );
  }
  
  const size = value.size;
  
  // 检查最小大小
  if (minSize !== undefined && size < minSize) {
    throw new InvalidInputError(
      message || `${paramText} must have at least ${minSize} entries${functionText}`,
      { value, paramName, functionName, minSize, actualSize: size } as any
    );
  }
  
  // 检查最大大小
  if (maxSize !== undefined && size > maxSize) {
    throw new InvalidInputError(
      message || `${paramText} must have at most ${maxSize} entries${functionText}`,
      { value, paramName, functionName, maxSize, actualSize: size } as any
    );
  }
  
  // 检查键和值验证器
  if (keyValidator || valueValidator) {
    let index = 0;
    for (const [key, val] of value as Map<K, V>) {
      if (keyValidator && !keyValidator(key)) {
        throw new InvalidInputError(
          message || `${paramText} has invalid key at index ${index}${functionText}`,
          { value, paramName, functionName, index, key } as any
        );
      }
      
      if (valueValidator && !valueValidator(val)) {
        throw new InvalidInputError(
          message || `${paramText} has invalid value at index ${index}${functionText}`,
          { value, paramName, functionName, index, origin: val } as any
        );
      }
      index++;
    }
  }
}

/**
 * 断言值为 Set
 */
export function assertSet<T = any>(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    nonEmpty?: boolean;
    minSize?: number;
    maxSize?: number;
    itemValidator?: (item: T) => boolean;
  }
): asserts value is Set<T> {
  const {
    paramName,
    functionName,
    message,
    nonEmpty = false,
    minSize,
    maxSize,
    itemValidator
  } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isSet(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a Set${functionText}`,
      { value, paramName, functionName, expected: 'Set' } as any
    );
  }
  
  // 检查非空
  if (nonEmpty && isEmptySet(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a non-empty Set${functionText}`,
      { value, paramName, functionName } as any
    );
  }
  
  const size = value.size;
  
  // 检查最小大小
  if (minSize !== undefined && size < minSize) {
    throw new InvalidInputError(
      message || `${paramText} must have at least ${minSize} items${functionText}`,
      { value, paramName, functionName, minSize, actualSize: size } as any
    );
  }
  
  // 检查最大大小
  if (maxSize !== undefined && size > maxSize) {
    throw new InvalidInputError(
      message || `${paramText} must have at most ${maxSize} items${functionText}`,
      { value, paramName, functionName, maxSize, actualSize: size } as any
    );
  }
  
  // 检查项目验证器
  if (itemValidator) {
    let index = 0;
    for (const item of value as Set<T>) {
      if (!itemValidator(item)) {
        throw new InvalidInputError(
          message || `${paramText} contains invalid item at index ${index}${functionText}`,
          { value, paramName, functionName, index, item } as any
        );
      }
      index++;
    }
  }
}

/**
 * 断言值为 Promise
 */
export function assertPromise(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is Promise<any> {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isPromise(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a Promise${functionText}`,
      { value, paramName, functionName, expected: 'Promise' } as any
    );
  }
}

/**
 * 断言值为 Error
 */
export function assertError(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is Error {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isError(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be an Error${functionText}`,
      { value, paramName, functionName, expected: 'Error' } as any
    );
  }
}

/**
 * 断言值为 TypedArray
 */
export function assertTypedArray(
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
  
  if (!isTypedArray(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a TypedArray${functionText}`,
      { value, paramName, functionName, expected: 'TypedArray' } as any
    );
  }
}

/**
 * 断言值为 Buffer（Node.js 环境）
 */
export function assertBuffer(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is Buffer {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isBuffer(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a Buffer${functionText}`,
      { value, paramName, functionName, expected: 'Buffer' } as any
    );
  }
}

/**
 * 断言值为 FormData（浏览器环境）
 */
export function assertFormData(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is FormData {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isFormData(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a FormData${functionText}`,
      { value, paramName, functionName, expected: 'FormData' } as any
    );
  }
}

/**
 * 断言值为 URLSearchParams（浏览器环境）
 */
export function assertURLSearchParams(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is URLSearchParams {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isURLSearchParams(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a URLSearchParams${functionText}`,
      { value, paramName, functionName, expected: 'URLSearchParams' } as any
    );
  }
}

/**
 * 断言值为 File（浏览器环境）
 */
export function assertFile(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is File {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isFile(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a File${functionText}`,
      { value, paramName, functionName, expected: 'File' } as any
    );
  }
}

/**
 * 断言值为 Blob（浏览器环境）
 */
export function assertBlob(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is Blob {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isBlob(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a Blob${functionText}`,
      { value, paramName, functionName, expected: 'Blob' } as any
    );
  }
}

/**
 * 断言数组为空
 */
export function assertEmptyArray(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is [] {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isEmptyArray(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be an empty array${functionText}`,
      { value, paramName, functionName } as any
    );
  }
}

/**
 * 断言对象为空
 */
export function assertEmptyObject(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is {} {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isEmptyObject(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be an empty object${functionText}`,
      { value, paramName, functionName } as any
    );
  }
}

/**
 * 断言 Map 为空
 */
export function assertEmptyMap(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is Map<any, any> {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isEmptyMap(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be an empty Map${functionText}`,
      { value, paramName, functionName } as any
    );
  }
}

/**
 * 断言 Set 为空
 */
export function assertEmptySet(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is Set<any> {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isEmptySet(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be an empty Set${functionText}`,
      { value, paramName, functionName } as any
    );
  }
}

/**
 * 断言嵌套结构
 */
export function assertNested(
  value: any,
  schema: {
    type: 'array' | 'object' | 'map' | 'set';
    itemSchema?: any;
    keySchema?: any;
    valueSchema?: any;
  },
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  switch (schema.type) {
    case 'array':
      assertArray(value, { paramName, functionName, message });
      if (schema.itemSchema) {
        const array = value as any[];
        for (let i = 0; i < array.length; i++) {
          try {
            assertNested(array[i], schema.itemSchema, {
              paramName: `${paramName}[${i}]`,
              functionName,
              message
            });
          } catch (error) {
            if (error instanceof InvalidInputError) {
              throw error;
            }
            throw new InvalidInputError(
              message || `${paramText}[${i}] has invalid structure${functionText}`,
              { value: array[i], paramName: `${paramName}[${i}]`, functionName, index: i } as any
            );
          }
        }
      }
      break;
      
    case 'object':
      assertObject(value, { paramName, functionName, message });
      if (schema.valueSchema) {
        const obj = value as Record<string, any>;
        for (const key in obj) {
          try {
            assertNested(obj[key], schema.valueSchema, {
              paramName: `${paramName}.${key}`,
              functionName,
              message
            });
          } catch (error) {
            if (error instanceof InvalidInputError) {
              throw error;
            }
            throw new InvalidInputError(
              message || `${paramText}.${key} has invalid structure${functionText}`,
              { value: obj[key], paramName: `${paramName}.${key}`, functionName, key } as any
            );
          }
        }
      }
      break;
      
    case 'map':
      assertMap(value, { paramName, functionName, message });
      if (schema.keySchema || schema.valueSchema) {
        const map = value as Map<any, any>;
        let index = 0;
        for (const [key, val] of map) {
          if (schema.keySchema) {
            try {
              assertNested(key, schema.keySchema, {
                paramName: `${paramName}[key@${index}]`,
                functionName,
                message
              });
            } catch (error) {
              if (error instanceof InvalidInputError) {
                throw error;
              }
              throw new InvalidInputError(
                message || `${paramText} has invalid key at index ${index}${functionText}`,
                { value: key, paramName: `${paramName}[key@${index}]`, functionName, index } as any
              );
            }
          }
          
          if (schema.valueSchema) {
            try {
              assertNested(val, schema.valueSchema, {
                paramName: `${paramName}[value@${index}]`,
                functionName,
                message
              });
            } catch (error) {
              if (error instanceof InvalidInputError) {
                throw error;
              }
              throw new InvalidInputError(
                message || `${paramText} has invalid value at index ${index}${functionText}`,
                { value: val, paramName: `${paramName}[value@${index}]`, functionName, index } as any
              );
            }
          }
          index++;
        }
      }
      break;
      
    case 'set':
      assertSet(value, { paramName, functionName, message });
      if (schema.itemSchema) {
        const set = value as Set<any>;
        let index = 0;
        for (const item of set) {
          try {
            assertNested(item, schema.itemSchema, {
              paramName: `${paramName}[${index}]`,
              functionName,
              message
            });
          } catch (error) {
            if (error instanceof InvalidInputError) {
              throw error;
            }
            throw new InvalidInputError(
              message || `${paramText} has invalid item at index ${index}${functionText}`,
              { value: item, paramName: `${paramName}[${index}]`, functionName, index } as any
            );
          }
          index++;
        }
      }
      break;
      
    default:
      throw new InvalidInputError(
        message || `${paramText} has unsupported schema type '${(schema as any).type}'${functionText}`,
        { value, paramName, functionName, schemaType: (schema as any).type } as any
      );
  }
}
