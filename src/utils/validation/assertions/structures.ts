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
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is T[] {
  const ctx = createAssetErrorContext(contextOptions);
  
  // 先检查是否是数组
  if (!Array.isArray(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_ARRAY);
  }
  
  // 复用验证函数
  if (!validateArray(value, options)) {
    const {
      nonEmpty = false,
      minLength,
      maxLength,
      allowEmptyItems = true,
      unique = false
    } = options;
    
    // 检查非空
    if (nonEmpty && value.length === 0) {
      ctx.throwError(ValidationErrorCode.NON_EMPTY_ARRAY);
    }
    
    // 检查最小长度
    if (minLength !== undefined && value.length < minLength) {
      ctx.throwError(ValidationErrorCode.MIN_LENGTH, { 
        min: minLength, 
        actualLength: value.length 
      });
    }
    
    // 检查最大长度
    if (maxLength !== undefined && value.length > maxLength) {
      ctx.throwError(ValidationErrorCode.MAX_LENGTH, { 
        max: maxLength, 
        actualLength: value.length 
      });
    }
    
    // 检查是否允许空项目
    if (!allowEmptyItems) {
      for (let i = 0; i < value.length; i++) {
        if (value[i] === null || value[i] === undefined) {
          ctx.throwError(ValidationErrorCode.INVALID_ITEM, { 
            index: i,
            value: value[i]
          });
        }
      }
    }
    
    // 检查唯一性
    if (unique) {
      const seenRefs = new Set();
      const seenValues = new Set();
      
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item === 'object' && item !== null) {
          if (seenRefs.has(item)) {
            ctx.throwError(ValidationErrorCode.DUPLICATE_ITEM, { 
              index: i,
              duplicate: item
            });
          }
          seenRefs.add(item);
        } else {
          if (seenValues.has(item)) {
            ctx.throwError(ValidationErrorCode.DUPLICATE_ITEM, { 
              index: i,
              duplicate: item
            });
          }
          seenValues.add(item);
        }
      }
    }
    
    // 检查项目验证器
    if (options.itemValidator) {
      for (let i = 0; i < value.length; i++) {
        if (!options.itemValidator(value[i], i)) {
          ctx.throwError(ValidationErrorCode.INVALID_ITEM, { 
            index: i,
            value: value[i]
          });
        }
      }
    }
    
    // 未知原因
    ctx.throwError(ValidationErrorCode.TYPE_NOT_ARRAY);
  }
}

/**
 * 类数组对象断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertArrayLike(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is ArrayLike<any> {
  const ctx = createAssetErrorContext(contextOptions);
  
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
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is Record<string, any> {
  const ctx = createAssetErrorContext(contextOptions);
  
  // 先检查是否是对象
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    ctx.throwError(ValidationErrorCode.TYPE_NOT_OBJECT);
  }
  
  // 复用验证函数
  if (!validateObject(value, options)) {
    const {
      nonEmpty = false,
      requiredKeys,
      allowedKeys,
      disallowedKeys,
      minKeys,
      maxKeys
    } = options;
    
    const keys = Object.keys(value);
    
    // 检查非空
    if (nonEmpty && keys.length === 0) {
      ctx.throwError(ValidationErrorCode.NON_EMPTY_OBJECT);
    }
    
    // 检查最少键数
    if (minKeys !== undefined && keys.length < minKeys) {
      ctx.throwError(ValidationErrorCode.MIN_VALUE, { 
        min: minKeys, 
        actual: keys.length,
        value: 'keys'
      });
    }
    
    // 检查最多键数
    if (maxKeys !== undefined && keys.length > maxKeys) {
      ctx.throwError(ValidationErrorCode.MAX_VALUE, { 
        max: maxKeys, 
        actual: keys.length,
        value: 'keys'
      });
    }
    
    // 检查必需的键
    if (requiredKeys !== undefined) {
      for (const key of requiredKeys) {
        if (!(key in value)) {
          ctx.throwError(ValidationErrorCode.REQUIRED_KEY_MISSING, { 
            missingKey: key 
          });
        }
      }
    }
    
    // 检查允许的键
    if (allowedKeys !== undefined) {
      for (const key of keys) {
        if (!allowedKeys.includes(key)) {
          ctx.throwError(ValidationErrorCode.NOT_ALLOWED_KEY, { 
            forbiddenKey: key,
            allowedKeys
          });
        }
      }
    }
    
    // 检查不允许的键
    if (disallowedKeys !== undefined) {
      for (const key of keys) {
        if (disallowedKeys.includes(key)) {
          ctx.throwError(ValidationErrorCode.DISALLOWED_KEY_PRESENT, { 
            disallowedKey: key 
          });
        }
      }
    }
    
    // 检查值验证器
    if (options.valueValidator) {
      for (const key of keys) {
        if (!options.valueValidator(key, value[key])) {
          ctx.throwError(ValidationErrorCode.INVALID_VALUE, { 
            key,
            keyValue: value[key]
          });
        }
      }
    }
    
    // 未知原因
    ctx.throwError(ValidationErrorCode.TYPE_NOT_OBJECT);
  }
}

/**
 * 纯对象断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertPlainObject(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is Record<string, any> {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validatePlainObject(value)) {
    // 检查是否是对象
    if (typeof value !== 'object' || value === null) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_OBJECT);
    }
    
    // 如果是数组或其他对象类型
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
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is Date {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateDate(value, options)) {
    // 检查是否是日期对象
    if (!(value instanceof Date)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_DATE);
    }
    
    const { min, max, past = false, future = false } = options;
    const timestamp = value.getTime();
    
    // 检查最小日期
    if (min !== undefined && timestamp < min.getTime()) {
      ctx.throwError(ValidationErrorCode.DATE_TOO_EARLY, { 
        minDate: min,
        date: value
      });
    }
    
    // 检查最大日期
    if (max !== undefined && timestamp > max.getTime()) {
      ctx.throwError(ValidationErrorCode.DATE_TOO_LATE, { 
        maxDate: max,
        date: value
      });
    }
    
    const now = Date.now();
    
    // 检查过去日期
    if (past && timestamp >= now) {
      ctx.throwError(ValidationErrorCode.DATE_NOT_PAST, { 
        date: value 
      });
    }
    
    // 检查未来日期
    if (future && timestamp <= now) {
      ctx.throwError(ValidationErrorCode.DATE_NOT_FUTURE, { 
        date: value 
      });
    }
    
    // 未知原因
    ctx.throwError(ValidationErrorCode.TYPE_NOT_DATE);
  }
}

/**
 * 正则表达式断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertRegExp(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is RegExp {
  const ctx = createAssetErrorContext(contextOptions);
  
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
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is Map<K, V> {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateMap(value, options)) {
    // 检查是否是Map
    if (!(value instanceof Map)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_MAP);
    }
    
    const {
      nonEmpty = false,
      minSize,
      maxSize
    } = options;
    
    const size = value.size;
    
    // 检查非空
    if (nonEmpty && size === 0) {
      ctx.throwError(ValidationErrorCode.NON_EMPTY_MAP);
    }
    
    // 检查最小大小
    if (minSize !== undefined && size < minSize) {
      ctx.throwError(ValidationErrorCode.MIN_VALUE, { 
        min: minSize, 
        actual: size,
        value: 'size'
      });
    }
    
    // 检查最大大小
    if (maxSize !== undefined && size > maxSize) {
      ctx.throwError(ValidationErrorCode.MAX_VALUE, { 
        max: maxSize, 
        actual: size,
        value: 'size'
      });
    }
    
    // 检查键和值验证器
    if (options.keyValidator || options.valueValidator) {
      for (const [key, val] of value) {
        if (options.keyValidator && !options.keyValidator(key as K)) {
          ctx.throwError(ValidationErrorCode.INVALID_KEY, { 
            key,
            keyValue: key
          });
        }
        
        if (options.valueValidator && !options.valueValidator(val as V)) {
          ctx.throwError(ValidationErrorCode.INVALID_VALUE, { 
            key,
            keyValue: val
          });
        }
      }
    }
    
    // 未知原因
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
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is Set<T> {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateSet(value, options)) {
    // 检查是否是Set
    if (!(value instanceof Set)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_SET);
    }
    
    const {
      nonEmpty = false,
      minSize,
      maxSize
    } = options;
    
    const size = value.size;
    
    // 检查非空
    if (nonEmpty && size === 0) {
      ctx.throwError(ValidationErrorCode.NON_EMPTY_SET);
    }
    
    // 检查最小大小
    if (minSize !== undefined && size < minSize) {
      ctx.throwError(ValidationErrorCode.MIN_VALUE, { 
        min: minSize, 
        actual: size,
        value: 'size'
      });
    }
    
    // 检查最大大小
    if (maxSize !== undefined && size > maxSize) {
      ctx.throwError(ValidationErrorCode.MAX_VALUE, { 
        max: maxSize, 
        actual: size,
        value: 'size'
      });
    }
    
    // 检查项目验证器
    if (options.itemValidator) {
      for (const item of value) {
        if (!options.itemValidator(item as T)) {
          ctx.throwError(ValidationErrorCode.INVALID_ITEM, { 
            value: item
          });
        }
      }
    }
    
    // 未知原因
    ctx.throwError(ValidationErrorCode.TYPE_NOT_SET);
  }
}

/**
 * Promise断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertPromise(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is Promise<any> {
  const ctx = createAssetErrorContext(contextOptions);
  
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
  contextOptions?: AssertErrorContextOptions
): asserts value is Error {
  const ctx = createAssetErrorContext(contextOptions);
  
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
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
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
  contextOptions?: AssertErrorContextOptions
): asserts value is Buffer {
  const ctx = createAssetErrorContext(contextOptions);
  
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
  contextOptions?: AssertErrorContextOptions
): asserts value is FormData {
  const ctx = createAssetErrorContext(contextOptions);
  
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
  contextOptions?: AssertErrorContextOptions
): asserts value is URLSearchParams {
  const ctx = createAssetErrorContext(contextOptions);
  
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
  contextOptions?: AssertErrorContextOptions
): asserts value is File {
  const ctx = createAssetErrorContext(contextOptions);
  
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
  contextOptions?: AssertErrorContextOptions
): asserts value is Blob {
  const ctx = createAssetErrorContext(contextOptions);
  
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
  contextOptions?: AssertErrorContextOptions
): asserts value is [] {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateEmptyArray(value)) {
    // 检查是否是数组
    if (!Array.isArray(value)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_ARRAY);
    }
    
    // 如果不是空数组
    ctx.throwError(ValidationErrorCode.EMPTY_ARRAY);
  }
}

/**
 * 空对象断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEmptyObject(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is {} {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateEmptyObject(value)) {
    // 检查是否是对象
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_OBJECT);
    }
    
    // 如果不是空对象
    ctx.throwError(ValidationErrorCode.EMPTY_OBJECT);
  }
}

/**
 * 空Map断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEmptyMap(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is Map<any, any> {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateEmptyMap(value)) {
    // 检查是否是Map
    if (!(value instanceof Map)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_MAP);
    }
    
    // 如果不是空Map
    ctx.throwError(ValidationErrorCode.EMPTY_MAP);
  }
}

/**
 * 空Set断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEmptySet(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is Set<any> {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateEmptySet(value)) {
    // 检查是否是Set
    if (!(value instanceof Set)) {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_SET);
    }
    
    // 如果不是空Set
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
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateNested(value, schema)) {
    switch (schema.type) {
      case 'array':
        if (!Array.isArray(value)) {
          ctx.throwError(ValidationErrorCode.TYPE_NOT_ARRAY);
        }
        break;
        
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          ctx.throwError(ValidationErrorCode.TYPE_NOT_OBJECT);
        }
        break;
        
      case 'map':
        if (!(value instanceof Map)) {
          ctx.throwError(ValidationErrorCode.TYPE_NOT_MAP);
        }
        break;
        
      case 'set':
        if (!(value instanceof Set)) {
          ctx.throwError(ValidationErrorCode.TYPE_NOT_SET);
        }
        break;
    }
    
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
  } = {},
  contextOptions?: AssertErrorContextOptions
): (value: any) => asserts value is T[] {
  const ctx = createAssetErrorContext(contextOptions);
  
  return (value: any): asserts value is T[] => {
    if (!validateArray(value, options)) {
      if (!Array.isArray(value)) {
        ctx.throwError(ValidationErrorCode.TYPE_NOT_ARRAY);
      }
      
      // 检查具体失败原因
      const {
        nonEmpty = false,
        minLength,
        maxLength,
        allowEmptyItems = true,
        unique = false
      } = options;
      
      if (nonEmpty && value.length === 0) {
        ctx.throwError(ValidationErrorCode.NON_EMPTY_ARRAY);
      }
      
      if (minLength !== undefined && value.length < minLength) {
        ctx.throwError(ValidationErrorCode.MIN_LENGTH, { 
          min: minLength, 
          actualLength: value.length 
        });
      }
      
      if (maxLength !== undefined && value.length > maxLength) {
        ctx.throwError(ValidationErrorCode.MAX_LENGTH, { 
          max: maxLength, 
          actualLength: value.length 
        });
      }
      
      if (!allowEmptyItems) {
        for (let i = 0; i < value.length; i++) {
          if (value[i] === null || value[i] === undefined) {
            ctx.throwError(ValidationErrorCode.INVALID_ITEM, { 
              index: i,
              value: value[i]
            });
          }
        }
      }
      
      if (unique) {
        const seenRefs = new Set();
        const seenValues = new Set();
        
        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (typeof item === 'object' && item !== null) {
            if (seenRefs.has(item)) {
              ctx.throwError(ValidationErrorCode.DUPLICATE_ITEM, { 
                index: i,
                duplicate: item
              });
            }
            seenRefs.add(item);
          } else {
            if (seenValues.has(item)) {
              ctx.throwError(ValidationErrorCode.DUPLICATE_ITEM, { 
                index: i,
                duplicate: item
              });
            }
            seenValues.add(item);
          }
        }
      }
      
      if (options.itemValidator) {
        for (let i = 0; i < value.length; i++) {
          if (!options.itemValidator(value[i], i)) {
            ctx.throwError(ValidationErrorCode.INVALID_ITEM, { 
              index: i,
              value: value[i]
            });
          }
        }
      }
      
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
  } = {},
  contextOptions?: AssertErrorContextOptions
): (value: any) => asserts value is Record<string, any> {
  const ctx = createAssetErrorContext(contextOptions);
  
  return (value: any): asserts value is Record<string, any> => {
    if (!validateObject(value, options)) {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        ctx.throwError(ValidationErrorCode.TYPE_NOT_OBJECT);
      }
      
      // 检查具体失败原因
      const {
        nonEmpty = false,
        requiredKeys,
        allowedKeys,
        disallowedKeys,
        minKeys,
        maxKeys
      } = options;
      
      const keys = Object.keys(value);
      
      if (nonEmpty && keys.length === 0) {
        ctx.throwError(ValidationErrorCode.NON_EMPTY_OBJECT);
      }
      
      if (minKeys !== undefined && keys.length < minKeys) {
        ctx.throwError(ValidationErrorCode.MIN_VALUE, { 
          min: minKeys, 
          actual: keys.length,
          value: 'keys'
        });
      }
      
      if (maxKeys !== undefined && keys.length > maxKeys) {
        ctx.throwError(ValidationErrorCode.MAX_VALUE, { 
          max: maxKeys, 
          actual: keys.length,
          value: 'keys'
        });
      }
      
      if (requiredKeys !== undefined) {
        for (const key of requiredKeys) {
          if (!(key in value)) {
            ctx.throwError(ValidationErrorCode.REQUIRED_KEY_MISSING, { 
              missingKey: key 
            });
          }
        }
      }
      
      if (allowedKeys !== undefined) {
        for (const key of keys) {
          if (!allowedKeys.includes(key)) {
            ctx.throwError(ValidationErrorCode.NOT_ALLOWED_KEY, { 
              forbiddenKey: key,
              allowedKeys
            });
          }
        }
      }
      
      if (disallowedKeys !== undefined) {
        for (const key of keys) {
          if (disallowedKeys.includes(key)) {
            ctx.throwError(ValidationErrorCode.DISALLOWED_KEY_PRESENT, { 
              disallowedKey: key 
            });
          }
        }
      }
      
      if (options.valueValidator) {
        for (const key of keys) {
          if (!options.valueValidator(key, value[key])) {
            ctx.throwError(ValidationErrorCode.INVALID_VALUE, { 
              key,
              keyValue: value[key]
            });
          }
        }
      }
      
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
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
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