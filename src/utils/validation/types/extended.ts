import { isString, isFunction, isPrimitive, isNonNegativeInteger } from './primitives';
import { isArray, isObject, isMap, isSet, isPlainObject, isDate } from './structures';

/**
 * 扩展类型检查函数
 * 这些函数用于检查更复杂或特殊的类型条件
 */

/**
 * 检查是否为 null 或 undefined
 */
export function isNil(value: any): value is null | undefined {
    return value === null || value === undefined;
}

/**
 * 检查是否为 null
 */
export function isNull(value: any): value is null {
    return value === null;
}

/**
 * 检查是否为 undefined
 */
export function isUndefined(value: any): value is undefined {
    return value === undefined;
}

/**
 * 检查字符串是否为空（包括空白字符）
 */
export function isEmptyString(value: any): boolean {
    return isString(value) && value.trim().length === 0;
}

/**
 * 检查数组是否为空
 */
export function isEmptyArray(value: any): boolean {
    return isArray(value) && value.length === 0;
}

/**
 * 检查对象是否为空（没有自有属性）
 */
export function isEmptyObject(value: any): boolean {
    return isObject(value) && Object.keys(value).length === 0;
}

/**
 * 检查 Map 是否为空
 */
export function isEmptyMap(value: any): boolean {
    return isMap(value) && value.size === 0;
}

/**
 * 检查 Set 是否为空
 */
export function isEmptySet(value: any): boolean {
    return isSet(value) && value.size === 0;
}

/**
 * 通用检查：值是否为空
 * 适用于：字符串、数组、对象、Map、Set、null、undefined
 */
export function isEmpty(value: any): boolean {
    if (isNil(value)) {
        return true;
    }

    if (isString(value)) {
        return isEmptyString(value);
    }

    if (isArray(value)) {
        return isEmptyArray(value);
    }

    if (isMap(value)) {
        return isEmptyMap(value);
    }

    if (isSet(value)) {
        return isEmptySet(value);
    }

    if (isObject(value)) {
        return isEmptyObject(value);
    }

    // 其他类型视为非空
    return false;
}

/**
 * 检查值是否可迭代（实现了 Symbol.iterator）
 */
export function isIterable(value: any): value is Iterable<any> {
    return !isNil(value) && typeof value[Symbol.iterator] === 'function';
}

/**
 * 检查值是否为可迭代对象（但不是字符串）
 */
export function isIterableButNotString(value: any): value is Iterable<any> {
    return isIterable(value) && !isString(value);
}

/**
 * 检查值是否为类 Promise 对象（有 then 方法）
 */
export function isThenable(value: any): value is { then: Function } {
    return !isNil(value) && typeof value === 'object' && typeof value.then === 'function';
}

/**
 * 检查是否为异步函数
 */
export function isAsyncFunction(value: any): value is Function {
    return isFunction(value) && value.constructor && value.constructor.name === 'AsyncFunction';
}

/**
 * 检查是否为生成器函数
 */
export function isGeneratorFunction(value: any): value is GeneratorFunction {
    return isFunction(value) && value.constructor && value.constructor.name === 'GeneratorFunction';
}

/**
 * 检查值是否可序列化为 JSON
 */
export function isJSONSerializable(value: any): boolean {
 
    if (value === undefined || typeof value === 'symbol') {
        return false;
    }
          
    if (isPrimitive(value)) {
        return true;
    }

    if (isArray(value)) {
        return value.every(isJSONSerializable);
    }

    if (isPlainObject(value)) {
        return Object.values(value).every(isJSONSerializable);
    }

    // Date 对象会转换为 ISO 字符串
    if (isDate(value)) {
        return true;
    }

    // 其他对象类型不可序列化
    return false;
}

/**
 * 检查是否为有效索引（非负整数）
 */
export function isArrayIndex(value: any): value is number {
    return isNonNegativeInteger(value) && value < 2 ** 32 - 1;
}

/**
 * 检查是否为有效属性键（字符串、符号或数字）
 */
export function isPropertyKey(value: any): value is string | symbol | number {
    return typeof value === 'string' || typeof value === 'symbol' || typeof value === 'number';
}

/**
 * 检查是否为有效的数字字符串
 */
export function isNumericString(value: any): boolean {
    if (!isString(value)) {
        return false;
    }

    // 检查是否为数字字符串（包括小数、科学计数法）
    return !isNaN(Number(value)) && value.trim() !== '';
}

/**
 * 检查是否为有效的整数字符串
 */
export function isIntegerString(value: any): boolean {
    if (!isString(value)) {
        return false;
    }

    const num = Number(value);
    return Number.isInteger(num) && !isNaN(num) && value.trim() !== '';
}

/**
 * 检查两个值是否为相同类型
 */
export function isSameType(a: any, b: any): boolean {
    if (isNil(a) || isNil(b)) {
        return a === b; // null 和 undefined 只有与自身类型相同
    }

    // 特殊处理数组
    if (isArray(a) && isArray(b)) {
        return true;
    }

    if (isArray(a) !== isArray(b)) {
        return false;
    }    

    // 特殊处理对象
    if (isObject(a) && isObject(b)) {
        return true;
    }

    // 其他类型使用 typeof
    return typeof a === typeof b;
}
