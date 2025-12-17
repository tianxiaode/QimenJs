import {
    // existence
    isRequired,
    isPresent,
    isOptional,
    isNullable,
    isEmpty,
    isNonEmpty,
    isTruthy,
    isFalsy,
} from '../existence'
import{    
    // types
    isString,
    isNumber,
    isBoolean,
    isPrimitive,
    isArray,
    isObject,
    isMap,
    isSet,
    isBigInt,
    isFiniteNumber,
    isInteger,
    isPositiveInteger,
    isNonNegativeInteger,
    isUndefined,
    isDate,
    isFunction,
    isRegExp,
} from '../types'
import { 
    // comparison
    isGreaterThan,
    isLessThan,
    isGreaterThanOrEqual,
    isLessThanOrEqual,
    isBetween,
    hasMinValue,
    hasMaxValue,
    isEqualTo,
    isNotEqualTo,
    isSameType,
} from '../comparison'
import {    
    // size
    hasMinLength,
    hasMaxLength,
    hasLengthBetween,
    hasExactLength,
    hasLengthOneOf,
    hasSize,
} from '../size'
import { 
    // patterns
    matchesPattern,
    isEmail,
    isURL,
    isPhoneNumber,
    isNumericString,
    isIntegerString,
    isUsername,
    isUUID,
    isIPv4,
    isIPv6,
    isMACAddress,
    hasPasswordStrength,
} from '../patterns'    

import {
    // structure
    hasKey,
    hasKeys,
    hasAnyKey,
    hasNoKey,
    isEmptyObject,
    isNonEmptyObject,
    hasSetValue,
    hasSetValues,
    hasAnySetValue,
    hasNoSetValue,
    isEmptySet,
    isNonEmptySet,
    hasMapKey,
    hasMapKeys,
    hasAnyMapKey,
    hasNoMapKey,
    isEmptyMap,
    isNonEmptyMap,
    isValidDate,
    isDateBefore,
    isDateAfter,
    isDateBetween,
    isExactDate,
    isToday,
    isPastDate,
    isFutureDate,
    isFormData,
    isURLSearchParams,
    isFile,
    isBlob,
    isIterable,
    isIterableButNotString,
    isArrayLike,
    isTypedArray,
    isBuffer,
    isPromise,
    isError,
    isThenable,
    isAsyncFunction,
    isGeneratorFunction,
    isPlainObject,
    hasMinArrayLength,
    hasMaxArrayLength,
    hasArrayLengthBetween,
    hasExactArrayLength,
    hasArrayLengthOneOf,
    isEmptyArray,
    isNonEmptyArray,
    hasItemType,
    hasItemTypeCheck,
    hasUniqueItems,
    hasUniqueItemsBy,
    isSorted,
    containsAll,
    containsAny,
    containsNone, 
    containsOnly,
} from '../structure';

/**
 * 预定义的关键词到验证函数的映射
 * 格式: { [keyword]: (ruleValue: any) => ValidationFunction }
 */
export const RULE_MAP = {
    // 基础验证关键词
    required: () => isRequired,
    present: () => isPresent,
    optional: () => isOptional,
    nullable: () => isNullable,
    empty: () => isEmpty,
    nonEmpty: () => isNonEmpty,
    truthy: () => isTruthy,
    falsy: () => isFalsy,

    // 类型验证关键词
    string: () => isString,
    number: () => isNumber,
    boolean: () => isBoolean,
    primitive: () => isPrimitive,
    array: () => isArray,
    object: () => isObject,
    map: () => isMap,
    set: () => isSet,
    bigInt: () => isBigInt,
    finite: () => isFiniteNumber,
    integer: () => isInteger,
    positiveInteger: () => isPositiveInteger,
    nonNegativeInteger: () => isNonNegativeInteger,
    undefined: () => isUndefined,
    date: () => isDate,
    function: () => isFunction,
    regexp: () => isRegExp,

    // 长度验证关键词
    min: (value: number) => hasMinLength(value),
    minimum: (value: number) => hasMinLength(value), // 别名
    max: (value: number) => hasMaxLength(value),
    maximum: (value: number) => hasMaxLength(value), // 别名
    exactLength: (value: number) => hasExactLength(value),
    length: (value: number) => hasExactLength(value), // 别名
    lengthBetween: (value: [number, number]) => hasLengthBetween(value[0], value[1]),
    lengthOneOf: (value: number[]) => hasLengthOneOf(value),

    // 数值比较关键词
    lessThan: (value: number) => isLessThan(value),
    lt: (value: number) => isLessThan(value), // 别名
    greaterThan: (value: number) => isGreaterThan(value),
    gt: (value: number) => isGreaterThan(value), // 别名
    lessThanOrEqual: (value: number) => isLessThanOrEqual(value),
    lte: (value: number) => isLessThanOrEqual(value), // 别名
    greaterThanOrEqual: (value: number) => isGreaterThanOrEqual(value),
    gte: (value: number) => isGreaterThanOrEqual(value), // 别名
    equal: (value: any) => isEqualTo(value),
    equalTo: (value: any) => isEqualTo(value), // 别名
    notEqual: (value: any) => isNotEqualTo(value),
    notEqualTo: (value: any) => isNotEqualTo(value), // 别名
    sameType: (value: any, other: any) => isSameType(value, other),
    between: (value: [number, number]) => isBetween(value[0], value[1]),

    // 数值范围验证关键词
    minValue: (value: number) => hasMinValue(value),
    maxValue: (value: number) => hasMaxValue(value),

    // 正则表达式相关关键词
    pattern: (value: RegExp | string) => matchesPattern(value),
    regex: (value: RegExp | string) => matchesPattern(value), // 别名

    // 预定义模式关键词
    email: () => isEmail,
    url: () => isURL,
    phone: () => isPhoneNumber,
    mobile: () => isPhoneNumber, // 别名
    numeric: () => isNumericString,
    integerString: () => isIntegerString,
    username: () => isUsername,
    uuid: () => isUUID,
    ipv4: () => isIPv4,
    ipv6: () => isIPv6,
    mac: () => isMACAddress,
    macAddress: () => isMACAddress, // 别名

    // 密码强度验证
    passwordStrength: (value: any) => hasPasswordStrength(value),

    // 对象结构验证
    hasKey: (value: string) => hasKey(value),
    hasKeys: (value: string[]) => hasKeys(value),
    hasAnyKey: (value: string[]) => hasAnyKey(value),
    hasNoKey: (value: any) => hasNoKey(value),
    emptyObject: () => isEmptyObject,
    nonEmptyObject: () => isNonEmptyObject,

    // Set结构验证
    hasSetValue: (value: any) => hasSetValue(value),
    hasSetValues: (value: any[]) => hasSetValues(value),
    hasAnySetValue: (value: any[]) => hasAnySetValue(value),
    hasNoSetValue: (value: any) => hasNoSetValue(value),
    emptySet: () => isEmptySet,
    nonEmptySet: () => isNonEmptySet,

    // Map结构验证
    hasMapKey: (value: any) => hasMapKey(value),
    hasMapKeys: (value: any[]) => hasMapKeys(value),
    hasAnyMapKey: (value: any[]) => hasAnyMapKey(value),
    hasNoMapKey: (value: any) => hasNoMapKey(value),
    emptyMap: () => isEmptyMap,
    nonEmptyMap: () => isNonEmptyMap,

    // 日期验证
    validDate: () => isValidDate,
    dateBefore: (value: any) => isDateBefore(value),
    dateAfter: (value: any) => isDateAfter(value),
    dateBetween: (value: any, other: any) => isDateBetween(value, other),
    exactDate: (value: any) => isExactDate(value),
    today: () => isToday,
    pastDate: () => isPastDate,
    futureDate: () => isFutureDate,

    // 浏览器API对象验证
    formData: () => isFormData,
    urlSearchParams: () => isURLSearchParams,
    file: () => isFile,
    blob: () => isBlob,

    // 可迭代对象验证
    iterable: () => isIterable,
    iterableButNotString: () => isIterableButNotString,
    arrayLike: () => isArrayLike,

    // Node.js特定类型验证
    typedArray: () => isTypedArray,
    buffer: () => isBuffer,

    // 特殊对象验证
    promise: () => isPromise,
    error: () => isError,
    thenable: () => isThenable,
    asyncFunction: () => isAsyncFunction,
    generatorFunction: () => isGeneratorFunction,
    plainObject: () => isPlainObject,

    // 数组长度验证
    minArrayLength: (value: number) => hasMinArrayLength(value),
    maxArrayLength: (value: number) => hasMaxArrayLength(value),
    arrayLengthBetween: (min: number, max: number) => hasArrayLengthBetween(min, max),
    exactArrayLength: (value: number) => hasExactArrayLength(value),
    arrayLengthOneOf: (value: number[]) => hasArrayLengthOneOf(value),
    emptyArray: () => isEmptyArray,
    nonEmptyArray: () => isNonEmptyArray,

    // 数组验证关键词
    unique: () => hasUniqueItems(),
    uniqueBy: (selector: (item: any) => any) => hasUniqueItemsBy(selector),
    sorted: (direction: 'asc' | 'desc' | boolean = true) => isSorted(direction),
    containsOnly: (values: any[]) => containsOnly(values),
    containsAll: (values: any[]) => containsAll(values),
    containsNone: (values: any[]) => containsNone(values),
    containsAny: (values: any[]) => containsAny(values),
    
    // 数组元素类型验证
    itemType: (type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function') => 
        hasItemType(type),
    itemTypeCheck: (checkFn: (item: any) => boolean) => hasItemTypeCheck(checkFn),

} as const;

// 预定义的关键词别名映射
export const RULE_ALIASES = {
    minimum: 'min',
    maximum: 'max',
    length: 'exactLength',
    regex: 'pattern',
    mobile: 'phone',
    macAddress: 'mac',
    includes: 'in',
    excludes: 'notIn',
    equal: 'equalTo',
    notEqual: 'notEqualTo',
    lt: 'lessThan',
    gt: 'greaterThan',
    lte: 'lessThanOrEqual',
    gte: 'greaterThanOrEqual',
} as const;


export const NON_RULE_KEYS = [
    'required', 'nullable', 'trim', 'skipIfEmpty',
    'toLowerCase', 'toUpperCase', 'custom',
    'message', 'errorCode', 'condition'  // 其他可能的非规则键
] as const;

export type NonRuleKey = typeof NON_RULE_KEYS[number];