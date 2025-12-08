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
 * 结构类型验证函数
 * 这些函数用于验证结构化数据类型，并支持约束条件
 */

/**
 * 验证数组
 * @param value 要验证的值
 * @param options 验证选项
 */
export function validateArray<T = any>(
  value: any,
  options: {
    nonEmpty?: boolean;              // 是否非空
    minLength?: number;              // 最小长度
    maxLength?: number;              // 最大长度
    itemValidator?: (item: any, index: number) => boolean; // 项目验证器
    allowEmptyItems?: boolean;       // 是否允许空项目（null/undefined）
    unique?: boolean;                // 是否要求元素唯一
  } = {}
): value is T[] {
  if (!isArray(value)) {
    return false;
  }
  
  const {
    nonEmpty = false,
    minLength,
    maxLength,
    itemValidator,
    allowEmptyItems = true,
    unique = false
  } = options;
  
  // 检查非空
  if (nonEmpty && isEmptyArray(value)) {
    return false;
  }
  
  // 检查最小长度
  if (minLength !== undefined && value.length < minLength) {
    return false;
  }
  
  // 检查最大长度
  if (maxLength !== undefined && value.length > maxLength) {
    return false;
  }
  
  // 检查元素唯一性
  if (unique) {
    const seen = new Set();
    for (const item of value) {
      // 对于对象，使用引用相等性
      const key = typeof item === 'object' && item !== null ? 
        Symbol.for('object') : item;
      if (seen.has(key)) {
        return false;
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
        return false;
      }
      
      // 使用项目验证器
      if (!itemValidator(item, i)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * 验证类数组对象
 * @param value 要验证的值
 */
export function validateArrayLike(value: any): value is ArrayLike<any> {
  return isArrayLike(value);
}

/**
 * 验证对象
 * @param value 要验证的值
 * @param options 验证选项
 */
export function validateObject(
  value: any,
  options: {
    nonEmpty?: boolean;              // 是否非空
    requiredKeys?: string[];         // 必需的键
    allowedKeys?: string[];          // 允许的键
    disallowedKeys?: string[];       // 不允许的键
    minKeys?: number;                // 最少键数
    maxKeys?: number;                // 最多键数
    valueValidator?: (key: string, value: any) => boolean; // 值验证器
  } = {}
): value is Record<string, any> {
  if (!isObject(value)) {
    return false;
  }
  
  const {
    nonEmpty = false,
    requiredKeys,
    allowedKeys,
    disallowedKeys,
    minKeys,
    maxKeys,
    valueValidator
  } = options;
  
  const keys = Object.keys(value);
  
  // 检查非空
  if (nonEmpty && isEmptyObject(value)) {
    return false;
  }
  
  // 检查最少键数
  if (minKeys !== undefined && keys.length < minKeys) {
    return false;
  }
  
  // 检查最多键数
  if (maxKeys !== undefined && keys.length > maxKeys) {
    return false;
  }
  
  // 检查必需的键
  if (requiredKeys !== undefined) {
    for (const key of requiredKeys) {
      if (!(key in value)) {
        return false;
      }
    }
  }
  
  // 检查允许的键
  if (allowedKeys !== undefined) {
    for (const key of keys) {
      if (!allowedKeys.includes(key)) {
        return false;
      }
    }
  }
  
  // 检查不允许的键
  if (disallowedKeys !== undefined) {
    for (const key of keys) {
      if (disallowedKeys.includes(key)) {
        return false;
      }
    }
  }
  
  // 检查值验证器
  if (valueValidator) {
    for (const key of keys) {
      if (!valueValidator(key, value[key])) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * 验证纯对象
 * @param value 要验证的值
 */
export function validatePlainObject(value: any): value is Record<string, any> {
  return isPlainObject(value);
}

/**
 * 验证日期
 * @param value 要验证的值
 * @param options 验证选项
 */
export function validateDate(
  value: any,
  options: {
    min?: Date;      // 最小日期
    max?: Date;      // 最大日期
    past?: boolean;  // 是否为过去日期
    future?: boolean; // 是否为未来日期
  } = {}
): value is Date {
  if (!isDate(value)) {
    return false;
  }
  
  const { min, max, past = false, future = false } = options;
  const timestamp = value.getTime();
  
  // 检查最小日期
  if (min !== undefined && timestamp < min.getTime()) {
    return false;
  }
  
  // 检查最大日期
  if (max !== undefined && timestamp > max.getTime()) {
    return false;
  }
  
  const now = Date.now();
  
  // 检查过去日期
  if (past && timestamp >= now) {
    return false;
  }
  
  // 检查未来日期
  if (future && timestamp <= now) {
    return false;
  }
  
  return true;
}

/**
 * 验证正则表达式
 * @param value 要验证的值
 */
export function validateRegExp(value: any): value is RegExp {
  return isRegExp(value);
}

/**
 * 验证 Map
 * @param value 要验证的值
 * @param options 验证选项
 */
export function validateMap<K = any, V = any>(
  value: any,
  options: {
    nonEmpty?: boolean;              // 是否非空
    minSize?: number;                // 最小大小
    maxSize?: number;                // 最大大小
    keyValidator?: (key: K) => boolean;    // 键验证器
    valueValidator?: (value: V) => boolean; // 值验证器
  } = {}
): value is Map<K, V> {
  if (!isMap(value)) {
    return false;
  }
  
  const {
    nonEmpty = false,
    minSize,
    maxSize,
    keyValidator,
    valueValidator
  } = options;
  
  // 检查非空
  if (nonEmpty && isEmptyMap(value)) {
    return false;
  }
  
  const size = value.size;
  
  // 检查最小大小
  if (minSize !== undefined && size < minSize) {
    return false;
  }
  
  // 检查最大大小
  if (maxSize !== undefined && size > maxSize) {
    return false;
  }
  
  // 检查键和值验证器
  if (keyValidator || valueValidator) {
    for (const [key, val] of value) {
      if (keyValidator && !keyValidator(key as K)) {
        return false;
      }
      
      if (valueValidator && !valueValidator(val as V)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * 验证 Set
 * @param value 要验证的值
 * @param options 验证选项
 */
export function validateSet<T = any>(
  value: any,
  options: {
    nonEmpty?: boolean;              // 是否非空
    minSize?: number;                // 最小大小
    maxSize?: number;                // 最大大小
    itemValidator?: (item: T) => boolean; // 项目验证器
  } = {}
): value is Set<T> {
  if (!isSet(value)) {
    return false;
  }
  
  const {
    nonEmpty = false,
    minSize,
    maxSize,
    itemValidator
  } = options;
  
  // 检查非空
  if (nonEmpty && isEmptySet(value)) {
    return false;
  }
  
  const size = value.size;
  
  // 检查最小大小
  if (minSize !== undefined && size < minSize) {
    return false;
  }
  
  // 检查最大大小
  if (maxSize !== undefined && size > maxSize) {
    return false;
  }
  
  // 检查项目验证器
  if (itemValidator) {
    for (const item of value) {
      if (!itemValidator(item as T)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * 验证 Promise
 * @param value 要验证的值
 */
export function validatePromise(value: any): value is Promise<any> {
  return isPromise(value);
}

/**
 * 验证 Error
 * @param value 要验证的值
 */
export function validateError(value: any): value is Error {
  return isError(value);
}

/**
 * 验证 TypedArray
 * @param value 要验证的值
 */
export function validateTypedArray(value: any): boolean {
  return isTypedArray(value);
}

/**
 * 验证 Buffer（Node.js 环境）
 * @param value 要验证的值
 */
export function validateBuffer(value: any): value is Buffer {
  return isBuffer(value);
}

/**
 * 验证 FormData（浏览器环境）
 * @param value 要验证的值
 */
export function validateFormData(value: any): value is FormData {
  return isFormData(value);
}

/**
 * 验证 URLSearchParams（浏览器环境）
 * @param value 要验证的值
 */
export function validateURLSearchParams(value: any): value is URLSearchParams {
  return isURLSearchParams(value);
}

/**
 * 验证 File（浏览器环境）
 * @param value 要验证的值
 */
export function validateFile(value: any): value is File {
  return isFile(value);
}

/**
 * 验证 Blob（浏览器环境）
 * @param value 要验证的值
 */
export function validateBlob(value: any): value is Blob {
  return isBlob(value);
}

/**
 * 验证空数组
 * @param value 要验证的值
 */
export function validateEmptyArray(value: any): value is [] {
  return isEmptyArray(value);
}

/**
 * 验证空对象
 * @param value 要验证的值
 */
export function validateEmptyObject(value: any): value is {} {
  return isEmptyObject(value);
}

/**
 * 验证空 Map
 * @param value 要验证的值
 */
export function validateEmptyMap(value: any): value is Map<any, any> {
  return isEmptyMap(value);
}

/**
 * 验证空 Set
 * @param value 要验证的值
 */
export function validateEmptySet(value: any): value is Set<any> {
  return isEmptySet(value);
}

/**
 * 验证嵌套结构
 * @param value 要验证的值
 * @param schema 模式描述符
 */
export function validateNested(
  value: any,
  schema: {
    type: 'array' | 'object' | 'map' | 'set';
    itemSchema?: any;
    keySchema?: any;
    valueSchema?: any;
  }
): boolean {
  switch (schema.type) {
    case 'array':
      if (!validateArray(value)) {
        return false;
      }
      if (schema.itemSchema) {
        for (const item of value as any[]) {
          if (!validateNested(item, schema.itemSchema)) {
            return false;
          }
        }
      }
      return true;
      
    case 'object':
      if (!validateObject(value)) {
        return false;
      }
      if (schema.valueSchema) {
        for (const key in value as Record<string, any>) {
          if (!validateNested((value as Record<string, any>)[key], schema.valueSchema)) {
            return false;
          }
        }
      }
      return true;
      
    case 'map':
      if (!validateMap(value)) {
        return false;
      }
      if (schema.keySchema || schema.valueSchema) {
        for (const [key, val] of value as Map<any, any>) {
          if (schema.keySchema && !validateNested(key, schema.keySchema)) {
            return false;
          }
          if (schema.valueSchema && !validateNested(val, schema.valueSchema)) {
            return false;
          }
        }
      }
      return true;
      
    case 'set':
      if (!validateSet(value)) {
        return false;
      }
      if (schema.itemSchema) {
        for (const item of value as Set<any>) {
          if (!validateNested(item, schema.itemSchema)) {
            return false;
          }
        }
      }
      return true;
      
    default:
      return false;
  }
}
