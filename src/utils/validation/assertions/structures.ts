// structures.ts
import { ValidationErrorCode, ValidationErrorParams } from './error-codes';
import { createAssetErrorContext, AssertErrorContextOptions } from './error-context';
import {
  validateArray,
  validateArrayLike,
  validateObject,
  validatePlainObject,
  validateDate,
  validateRegExp,
  validateMap,
  validateSet,
  validatePromise,
  validateError,
  validateTypedArray,
  validateBuffer,
  validateFormData,
  validateURLSearchParams,
  validateFile,
  validateBlob,
  validateEmptyArray,
  validateEmptyObject,
  validateEmptyMap,
  validateEmptySet,
  validateNested
} from '../validators';
import { getLength } from './error-context';

/**
 * 数组断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertArray<T = any>(
  value: any,
  options: {
    nonEmpty?: boolean;
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: any, index: number) => boolean;
    allowEmptyItems?: boolean;
    unique?: boolean;
  } & AssertErrorContextOptions = {}
): asserts value is T[] {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateArray(value, validationOptions)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_ARRAY);
  }
}

/**
 * 类数组对象断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertArrayLike(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is ArrayLike<any> {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateArrayLike(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_ARRAY_LIKE);
  }
}

/**
 * 对象断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertObject(
  value: any,
  options: {
    nonEmpty?: boolean;
    requiredKeys?: string[];
    allowedKeys?: string[];
    disallowedKeys?: string[];
    minKeys?: number;
    maxKeys?: number;
    valueValidator?: (key: string, value: any) => boolean;
  } & AssertErrorContextOptions = {}
): asserts value is Record<string, any> {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateObject(value, validationOptions)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_OBJECT);
  }
}

/**
 * 纯对象断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertPlainObject(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is Record<string, any> {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validatePlainObject(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_PLAIN_OBJECT);
  }
}

/**
 * 日期断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertDate(
  value: any,
  options: {
    min?: Date;
    max?: Date;
    past?: boolean;
    future?: boolean;
  } & AssertErrorContextOptions = {}
): asserts value is Date {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateDate(value, validationOptions)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_DATE);
  }
}

/**
 * 正则表达式断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertRegExp(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is RegExp {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateRegExp(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_REGEXP);
  }
}

/**
 * Map断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertMap<K = any, V = any>(
  value: any,
  options: {
    nonEmpty?: boolean;
    minSize?: number;
    maxSize?: number;
    keyValidator?: (key: K) => boolean;
    valueValidator?: (value: V) => boolean;
  } & AssertErrorContextOptions = {}
): asserts value is Map<K, V> {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateMap(value, validationOptions)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_MAP);
  }
}

/**
 * Set断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertSet<T = any>(
  value: any,
  options: {
    nonEmpty?: boolean;
    minSize?: number;
    maxSize?: number;
    itemValidator?: (item: T) => boolean;
  } & AssertErrorContextOptions = {}
): asserts value is Set<T> {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateSet(value, validationOptions)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_SET);
  }
}

/**
 * Promise断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertPromise(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is Promise<any> {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validatePromise(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_PROMISE);
  }
}

/**
 * Error断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertError(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is Error {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateError(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_ERROR);
  }
}

/**
 * TypedArray断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertTypedArray(
  value: any,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateTypedArray(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_TYPED_ARRAY);
  }
}

/**
 * Buffer断言函数（Node.js 环境）
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertBuffer(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is Buffer {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateBuffer(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_BUFFER);
  }
}

/**
 * FormData断言函数（浏览器环境）
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertFormData(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is FormData {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateFormData(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_FORM_DATA);
  }
}

/**
 * URLSearchParams断言函数（浏览器环境）
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertURLSearchParams(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is URLSearchParams {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateURLSearchParams(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_URL_SEARCH_PARAMS);
  }
}

/**
 * File断言函数（浏览器环境）
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertFile(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is File {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateFile(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_FILE);
  }
}

/**
 * Blob断言函数（浏览器环境）
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertBlob(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is Blob {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateBlob(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_BLOB);
  }
}

/**
 * 空数组断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEmptyArray(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is [] {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateEmptyArray(value)) {
    ctx.throwError(ValidationErrorCode.EMPTY_ARRAY);
  }
}

/**
 * 空对象断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEmptyObject(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is {} {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateEmptyObject(value)) {
    ctx.throwError(ValidationErrorCode.EMPTY_OBJECT);
  }
}

/**
 * 空Map断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEmptyMap(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is Map<any, any> {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateEmptyMap(value)) {
    ctx.throwError(ValidationErrorCode.EMPTY_MAP);
  }
}

/**
 * 空Set断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEmptySet(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is Set<any> {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateEmptySet(value)) {
    ctx.throwError(ValidationErrorCode.EMPTY_SET);
  }
}

/**
 * 嵌套结构断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNested(
  value: any,
  schema: {
    type: 'array' | 'object' | 'map' | 'set';
    itemSchema?: any;
    keySchema?: any;
    valueSchema?: any;
  },
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateNested(value, schema)) {
    ctx.throwError(ValidationErrorCode.NOT_SATISFY_CONDITION, { schema });
  }
}

/**
 * 创建数组断言器
 */
export function createArrayAssert<T>(
  options: {
    nonEmpty?: boolean;
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: any, index: number) => boolean;
    allowEmptyItems?: boolean;
    unique?: boolean;
  } & AssertErrorContextOptions = {}
): (value: any) => asserts value is T[] {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  return (value: any): asserts value is T[] => {
    if (!validateArray(value, validationOptions)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_ARRAY);
    }
  };
}

/**
 * 创建对象断言器
 */
export function createObjectAssert(
  options: {
    nonEmpty?: boolean;
    requiredKeys?: string[];
    allowedKeys?: string[];
    disallowedKeys?: string[];
    minKeys?: number;
    maxKeys?: number;
    valueValidator?: (key: string, value: any) => boolean;
  } & AssertErrorContextOptions = {}
): (value: any) => asserts value is Record<string, any> {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  return (value: any): asserts value is Record<string, any> => {
    if (!validateObject(value, validationOptions)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_OBJECT);
    }
  };
}

/**
 * 组合结构验证：同时验证多个结构属性
 */
export function assertStructure(
  value: any,
  validations: Array<(value: any) => void>
): void {
  for (const validation of validations) {
    validation(value);
  }
}

/**
 * 深度断言：验证整个嵌套结构
 */
export function deepAssert(
  value: any,
  validator: (value: any) => boolean,
  errorCode: ValidationErrorCode = ValidationErrorCode.NOT_SATISFY_CONDITION,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  const validateRecursive = (val: any, path: string[] = []): void => {
    if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        validateRecursive(val[i], [...path, `[${i}]`]);
      }
    } else if (val && typeof val === 'object' && !(val instanceof Date) && !(val instanceof RegExp)) {
      for (const key in val) {
        if (val.hasOwnProperty(key)) {
          validateRecursive(val[key], [...path, `.${key}`]);
        }
      }
    }
    
    if (!validator(val)) {
      const pathStr = path.join('');
      ctx.throwError(errorCode, { 
        value: val,
        path: pathStr || '.',
        fullPath: pathStr ? `value${pathStr}` : 'value'
      });
    }
  };
  
  validateRecursive(value);
}