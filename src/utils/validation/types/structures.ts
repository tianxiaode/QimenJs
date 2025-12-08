import { isFunction } from "../types";
/**
 * 结构类型检查函数
 * 这些函数用于检查 JavaScript 的结构化数据类型
 */

/**
 * 检查是否为数组
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * 检查是否为类数组对象（有 length 属性）
 */
export function isArrayLike(value: any): value is ArrayLike<any> {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof value.length === 'number' &&
    value.length >= 0 &&
    (value.length === 0 ||
      (value.length > 0 && (value.length - 1) in value))
  );
}

/**
 * 检查是否为对象（排除 null 和数组）
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 检查是否为纯对象（plain object，通过 {} 或 new Object() 创建）
 */
export function isPlainObject(value: any): value is Record<string, any> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * 检查是否为 Date 对象
 */
export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * 检查是否为 RegExp 对象
 */
export function isRegExp(value: any): value is RegExp {
  return value instanceof RegExp;
}

/**
 * 检查是否为 Map 对象
 */
export function isMap(value: any): value is Map<any, any> {
  return value instanceof Map;
}

/**
 * 检查是否为 Set 对象
 */
export function isSet(value: any): value is Set<any> {
  return value instanceof Set;
}

/**
 * 检查是否为 Promise 对象
 */
export function isPromise(value: any): value is Promise<any> {
  return (
    value instanceof Promise ||
    (isObject(value) && isFunction(value.then) && isFunction(value.catch))
  );
}

/**
 * 检查是否为 Error 对象
 */
export function isError(value: any): value is Error {
  return value instanceof Error;
}

/**
 * 检查是否为 TypedArray（如 Uint8Array, Float32Array 等）
 */
export function isTypedArray(value: any): value is
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

/**
 * 检查是否为 Buffer（Node.js 环境）
 */
export function isBuffer(value: any): value is Buffer {
  return (
    typeof Buffer !== 'undefined' &&
    Buffer.isBuffer &&
    Buffer.isBuffer(value)
  );
}

/**
 * 检查是否为 FormData 对象（浏览器环境）
 */
export function isFormData(value: any): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

/**
 * 检查是否为 URLSearchParams 对象（浏览器环境）
 */
export function isURLSearchParams(value: any): value is URLSearchParams {
  return typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
}

/**
 * 检查是否为 File 对象（浏览器环境）
 */
export function isFile(value: any): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

/**
 * 检查是否为 Blob 对象（浏览器环境）
 */
export function isBlob(value: any): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}