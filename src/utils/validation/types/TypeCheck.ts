
// 从 primitives.ts 导出基本类型检查函数
import { 
  isString,
  isNumber,
  isFiniteNumber,
  isInteger,
  isPositiveInteger,
  isNonNegativeInteger,
  isBoolean,
  isFunction,
  isSymbol,
  isBigInt,
  isPrimitive,
  isTruthy,
  isFalsy,
  isNaN
} from './primitives';

// 从 structures.ts 导出结构类型检查函数
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
  isBlob
} from './structures';

// 从 extended.ts 导出扩展类型检查函数
import {
  isNil,
  isNull,
  isUndefined,
  isEmptyString,
  isEmptyArray,
  isEmptyObject,
  isEmptyMap,
  isEmptySet,
  isEmpty,
  isIterable,
  isIterableButNotString,
  isThenable,
  isAsyncFunction,
  isGeneratorFunction,
  isJSONSerializable,
  isArrayIndex,
  isPropertyKey,
  isNumericString,
  isIntegerString,
  isSameType
} from './extended';

/**
 * 类型检查工具对象（可选，方便链式调用）
 */
export const TypeCheck = {
  // 基本类型
  string: isString,
  number: isNumber,
  finiteNumber: isFiniteNumber,
  integer: isInteger,
  positiveInteger: isPositiveInteger,
  nonNegativeInteger: isNonNegativeInteger,
  boolean: isBoolean,
  function: isFunction,
  symbol: isSymbol,
  bigint: isBigInt,
  primitive: isPrimitive,
  truthy: isTruthy,
  falsy: isFalsy,
  nan: isNaN,
  
  // 结构类型
  array: isArray,
  arrayLike: isArrayLike,
  object: isObject,
  plainObject: isPlainObject,
  date: isDate,
  regExp: isRegExp,
  map: isMap,
  set: isSet,
  promise: isPromise,
  error: isError,
  typedArray: isTypedArray,
  buffer: isBuffer,
  formData: isFormData,
  urlSearchParams: isURLSearchParams,
  file: isFile,
  blob: isBlob,
  
  // 扩展类型
  nil: isNil,
  null: isNull,
  undefined: isUndefined,
  emptyString: isEmptyString,
  emptyArray: isEmptyArray,
  emptyObject: isEmptyObject,
  emptyMap: isEmptyMap,
  emptySet: isEmptySet,
  empty: isEmpty,
  iterable: isIterable,
  iterableButNotString: isIterableButNotString,
  thenable: isThenable,
  asyncFunction: isAsyncFunction,
  generatorFunction: isGeneratorFunction,
  jsonSerializable: isJSONSerializable,
  arrayIndex: isArrayIndex,
  propertyKey: isPropertyKey,
  numericString: isNumericString,
  integerString: isIntegerString,
  sameType: isSameType,
  
  /**
   * 获取值的类型名称
   */
  getType(value: any): string {
    if (isNil(value)) {
      return String(value);
    }
    
    if (isArray(value)) {
      return 'Array';
    }
    
    if (isDate(value)) {
      return 'Date';
    }
    
    if (isRegExp(value)) {
      return 'RegExp';
    }
    
    if (isMap(value)) {
      return 'Map';
    }
    
    if (isSet(value)) {
      return 'Set';
    }
    
    if (isPromise(value)) {
      return 'Promise';
    }
    
    if (isError(value)) {
      return 'Error';
    }
    
    return typeof value;
  },
  
  /**
   * 检查值是否为指定类型
   */
  is(value: any, type: string): boolean {
    const typeName = type.toLowerCase();
    
    switch (typeName) {
      case 'string':
        return isString(value);
      case 'number':
        return isNumber(value);
      case 'boolean':
        return isBoolean(value);
      case 'function':
        return isFunction(value);
      case 'array':
        return isArray(value);
      case 'object':
        return isObject(value);
      case 'null':
        return isNull(value);
      case 'undefined':
        return isUndefined(value);
      case 'date':
        return isDate(value);
      case 'regexp':
      case 'regex':
        return isRegExp(value);
      case 'map':
        return isMap(value);
      case 'set':
        return isSet(value);
      case 'promise':
        return isPromise(value);
      case 'error':
        return isError(value);
      default:
        return typeof value === typeName;
    }
  }
} as const;