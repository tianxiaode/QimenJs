// rules/structures.ts
import { ValidationRuleResult } from './base';
import { ValidationErrorCode } from './error-codes';
import { isString, isNil } from './primitives';

/**
 * 检查是否为类数组对象（有 length 属性）
 */
export function isArrayLike(value: any): ValidationRuleResult {
  // 特殊处理字符串 - 它们是类数组的
  if (typeof value === 'string') {
    return { isValid: true, errors: [] };
  }
        
  const isValid = (
    value != null &&
    typeof value === 'object' &&
    typeof value.length === 'number' &&
    value.length >= 0 &&
    (value.length === 0 ||
      (value.length > 0 && (value.length - 1) in value))
  );
  
  if (isValid) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_ARRAY_LIKE,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为纯对象（plain object，通过 {} 或 new Object() 创建）
 */
export function isPlainObject(value: any): ValidationRuleResult {
  // 首先检查基本类型
  if (typeof value !== 'object' || value === null) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_OBJECT,
        errorParams: { value }
      }]
    };
  }

  // 排除数组
  if (Array.isArray(value)) {
    return {
      isValid: false,
      errors: [{
        errorCode: ValidationErrorCode.TYPE_NOT_PLAIN_OBJECT,
        errorParams: { value }
      }]
    };
  }

  // 检查原型链
  const proto = Object.getPrototypeOf(value);
  const isValid = proto === null || proto === Object.prototype;

  if (isValid) {
    return { isValid: true, errors: [] };
  }

  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_PLAIN_OBJECT,
      errorParams: { value }
    }]
  };
}
/**
 * 检查是否为 Map 对象
 */
export function isMap(value: any): ValidationRuleResult {
  if (value instanceof Map) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_MAP,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为 Set 对象
 */
export function isSet(value: any): ValidationRuleResult {
  if (value instanceof Set) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_SET,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为 Promise 对象
 */
export function isPromise(value: any): ValidationRuleResult {
  const isPromiseObj = (
    value instanceof Promise ||
    (value && typeof value === 'object' && 
     typeof value.then === 'function' && 
     typeof value.catch === 'function')
  );
  
  if (isPromiseObj) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_PROMISE,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为 Error 对象
 */
export function isError(value: any): ValidationRuleResult {
  if (value instanceof Error) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_ERROR,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为 TypedArray（如 Uint8Array, Float32Array 等）
 */
export function isTypedArray(value: any): ValidationRuleResult {
  const isValid = ArrayBuffer.isView(value) && !(value instanceof DataView);
  
  if (isValid) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_TYPED_ARRAY,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为 Buffer（Node.js 环境）
 */
export function isBuffer(value: any): ValidationRuleResult {
  const isBufferObj = (
    typeof Buffer !== 'undefined' &&
    Buffer.isBuffer &&
    Buffer.isBuffer(value)
  );
  
  if (isBufferObj) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_BUFFER,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为 FormData 对象（浏览器环境）
 */
export function isFormData(value: any): ValidationRuleResult {
  const isFormDataObj = typeof FormData !== 'undefined' && value instanceof FormData;
  
  if (isFormDataObj) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_FORM_DATA,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为 URLSearchParams 对象（浏览器环境）
 */
export function isURLSearchParams(value: any): ValidationRuleResult {
  const isURLSearchParamsObj = typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
  
  if (isURLSearchParamsObj) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_URL_SEARCH_PARAMS,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为 File 对象（浏览器环境）
 */
export function isFile(value: any): ValidationRuleResult {
  const isFileObj = typeof File !== 'undefined' && value instanceof File;
  
  if (isFileObj) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_FILE,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为 Blob 对象（浏览器环境）
 */
export function isBlob(value: any): ValidationRuleResult {
  const isBlobObj = typeof Blob !== 'undefined' && value instanceof Blob;
  
  if (isBlobObj) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_BLOB,
      errorParams: { value }
    }]
  };
}

/**
 * 检查值是否可迭代（实现了 Symbol.iterator）
 */
export function isIterable(value: any): ValidationRuleResult {
  const isValid = !isNil(value).isValid && typeof value[Symbol.iterator] === 'function';
  
  if (isValid) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_ITERABLE,
      errorParams: { value }
    }]
  };
}

/**
 * 检查值是否为可迭代对象（但不是字符串）
 */
export function isIterableButNotString(value: any): ValidationRuleResult {
  const iterableCheck = isIterable(value);
  const stringCheck = isString(value);
  
  const isValid = iterableCheck.isValid && !stringCheck.isValid;
  
  if (isValid) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_ITERABLE_BUT_NOT_STRING,
      errorParams: { value }
    }]
  };
}

/**
 * 检查值是否为类 Promise 对象（有 then 方法）
 */
export function isThenable(value: any): ValidationRuleResult {
  const isValid = !isNil(value).isValid && typeof value === 'object' && typeof value.then === 'function';
  
  if (isValid) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_THENABLE,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为异步函数
 */
export function isAsyncFunction(value: any): ValidationRuleResult {
  const isValid = typeof value === 'function' && value.constructor && value.constructor.name === 'AsyncFunction';
  
  if (isValid) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_ASYNC_FUNCTION,
      errorParams: { value }
    }]
  };
}

/**
 * 检查是否为生成器函数
 */
export function isGeneratorFunction(value: any): ValidationRuleResult {
  const isValid = typeof value === 'function' && value.constructor && value.constructor.name === 'GeneratorFunction';
  
  if (isValid) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: [{
      errorCode: ValidationErrorCode.TYPE_NOT_GENERATOR_FUNCTION,
      errorParams: { value }
    }]
  };
}