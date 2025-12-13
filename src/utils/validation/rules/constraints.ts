// rules/constraints.ts
import { ValidationRuleResult } from './base';
import { allRules } from './composition';
import { ValidationErrorCode } from './error-codes';
import { isString, isArray, isObject, isNumber } from './primitives';
import { isIterable, isMap, isSet } from './structures';
import { createValidationFailure, createValidationSuccess } from './utils';

/**
 * 严格比较两个值
 * @param value 第一个值
 * @param other 第二个值
 * @returns 比较结果：-1 表示 value < other，0 表示相等，1 表示 value > other，NaN 表示无法比较
 */
function strictCompare(value: any, other: any): number {
    try {
        // 类型不同直接返回无法比较
        if (typeof value !== typeof other) {
            return NaN;
        }

        // 只有全等才算相等
        if (value === other) {
            return 0;
        }

        // 相同类型直接比较
        // 数字比较
        if (typeof value === 'number') {
            if (isNaN(value) || isNaN(other)) return NaN;
            return value === other ? 0 : value < other ? -1 : 1;
        }

        // 字符串比较（严格模式下只进行字典序比较）
        if (typeof value === 'string') {
            return value === other ? 0 : value < other ? -1 : 1;
        }

        // Date对象比较
        if (value instanceof Date && other instanceof Date) {
            if (isNaN(value.getTime()) || isNaN(other.getTime())) return NaN;
            const diff = value.getTime() - other.getTime();
            return diff === 0 ? 0 : diff < 0 ? -1 : 1;
        }

        // 布尔值比较
        if (typeof value === 'boolean') {
            return value === other ? 0 : value ? 1 : -1;
        }

        // 其他类型无法比较
        return NaN;
    } catch (e) {
        return NaN;
    }
}

/**
 * 宽松比较两个值
 * @param value 第一个值
 * @param other 第二个值
 * @returns 比较结果：-1 表示 value < other，0 表示相等，1 表示 value > other，NaN 表示无法比较
 */
function looseCompare(value: any, other: any): number {
    try {
        // 首先检查宽松相等性
        // eslint-disable-next-line eqeqeq
        if (value == other) {
            return 0;
        }

        // 相同类型直接比较
        if (typeof value === typeof other) {
            // 数字比较
            if (typeof value === 'number') {
                if (isNaN(value) || isNaN(other)) return NaN;
                return value === other ? 0 : value < other ? -1 : 1;
            }

            // 字符串比较（宽松模式下尝试数字比较）
            if (typeof value === 'string') {
                // 尝试数字比较
                const numValue = Number(value);
                const numOther = Number(other);

                if (!isNaN(numValue) && !isNaN(numOther)) {
                    return numValue === numOther ? 0 : numValue < numOther ? -1 : 1;
                }

                // 字典序比较
                return value === other ? 0 : value < other ? -1 : 1;
            }

            // Date对象比较
            if (value instanceof Date && other instanceof Date) {
                if (isNaN(value.getTime()) || isNaN(other.getTime())) return NaN;
                const diff = value.getTime() - other.getTime();
                return diff === 0 ? 0 : diff < 0 ? -1 : 1;
            }

            // 布尔值比较
            if (typeof value === 'boolean') {
                return value === other ? 0 : value ? 1 : -1;
            }
        }

        // 不同类型尝试转换比较
        // 如果value是Date，尝试将other转为Date
        if (value instanceof Date && !isNaN(value.getTime())) {
            if (typeof other === 'string') {
                const dateOther = new Date(other);
                if (!isNaN(dateOther.getTime())) {
                    const diff = value.getTime() - dateOther.getTime();
                    return diff === 0 ? 0 : diff < 0 ? -1 : 1;
                }
            }

            if (typeof other === 'number') {
                const dateOther = new Date(other);
                if (!isNaN(dateOther.getTime())) {
                    const diff = value.getTime() - dateOther.getTime();
                    return diff === 0 ? 0 : diff < 0 ? -1 : 1;
                }
            }
        }

        // 如果other是Date，尝试将value转为Date
        if (other instanceof Date && !isNaN(other.getTime())) {
            if (typeof value === 'string') {
                const dateValue = new Date(value);
                if (!isNaN(dateValue.getTime())) {
                    const diff = dateValue.getTime() - other.getTime();
                    return diff === 0 ? 0 : diff < 0 ? -1 : 1;
                }
            }

            if (typeof value === 'number') {
                const dateValue = new Date(value);
                if (!isNaN(dateValue.getTime())) {
                    const diff = dateValue.getTime() - other.getTime();
                    return diff === 0 ? 0 : diff < 0 ? -1 : 1;
                }
            }
        }

        // 如果other是数字，尝试将value转为数字
        if (typeof other === 'number' && !isNaN(other)) {
            if (typeof value === 'string') {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    return numValue === other ? 0 : numValue < other ? -1 : 1;
                }
            }
        }

        // 如果value是数字，尝试将other转为数字
        if (typeof value === 'number' && !isNaN(value)) {
            if (typeof other === 'string') {
                const numOther = Number(other);
                if (!isNaN(numOther)) {
                    return value === numOther ? 0 : value < numOther ? -1 : 1;
                }
            }
        }

        // 尝试通用数字转换
        const numValue = Number(value);
        const numOther = Number(other);

        if (!isNaN(numValue) && !isNaN(numOther)) {
            return numValue === numOther ? 0 : numValue < numOther ? -1 : 1;
        }

        // 无法比较
        return NaN;
    } catch (e) {
        return NaN;
    }
}

/**
 * 智能比较两个值
 * @param value 第一个值
 * @param other 第二个值
 * @param strict 是否使用严格比较，默认为true
 * @returns 比较结果：-1 表示 value < other，0 表示相等，1 表示 value > other，NaN 表示无法比较
 */
export function smartCompare(value: any, other: any, strict: boolean = true): number {
    if (strict) {
        return strictCompare(value, other);
    } else {
        return looseCompare(value, other);
    }
}

/**
 * 创建基于比较结果的验证结果
 */
function createComparisonValidationResult(
    comparisonResult: number,
    errorCode: ValidationErrorCode,
    expected: any,
    actual: any,
    additionalData: Record<string, any> = {}
): ValidationRuleResult {
    if (isNaN(comparisonResult)) {
        return createValidationFailure(ValidationErrorCode.CANNOT_COMPARE, {
            value: actual,
            other: expected,
            ...additionalData,
        });
    }

    return createValidationFailure(errorCode, {
        expected,
        actual,
        ...additionalData,
    });
}

/**
 * 比较操作枚举
 */
enum ComparisonOperation {
    GREATER_THAN,
    GREATER_THAN_OR_EQUAL,
    LESS_THAN,
    LESS_THAN_OR_EQUAL,
    EQUAL,
    NOT_EQUAL,
}

/**
 * 创建比较验证器的工厂函数
 */
function createComparisonValidator(
    operation: ComparisonOperation,
    compareValue: any,
    strict: boolean = true
): (value: any) => ValidationRuleResult {
    return (value: any): ValidationRuleResult => {
        // 对于相等性比较，不需要必须是数字
        // 但对于大小比较，仍需要检查是否为数字
        if (
            [
                ComparisonOperation.GREATER_THAN,
                ComparisonOperation.GREATER_THAN_OR_EQUAL,
                ComparisonOperation.LESS_THAN,
                ComparisonOperation.LESS_THAN_OR_EQUAL,
            ].includes(operation)
        ) {
            const numberCheck = isNumber(value);
            if (!numberCheck.isValid) {
                return numberCheck;
            }
        }

        const compareResult = smartCompare(value, compareValue, strict);

        switch (operation) {
            case ComparisonOperation.GREATER_THAN:
                if (compareResult === 1) {
                    return createValidationSuccess();
                }
                return createComparisonValidationResult(
                    compareResult,
                    ValidationErrorCode.NOT_GREATER_THAN,
                    compareValue,
                    value
                );

            case ComparisonOperation.GREATER_THAN_OR_EQUAL:
                if (compareResult === 1 || compareResult === 0) {
                    return createValidationSuccess();
                }
                return createComparisonValidationResult(
                    compareResult,
                    ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL,
                    compareValue,
                    value
                );

            case ComparisonOperation.LESS_THAN:
                if (compareResult === -1) {
                    return createValidationSuccess();
                }
                return createComparisonValidationResult(
                    compareResult,
                    ValidationErrorCode.NOT_LESS_THAN,
                    compareValue,
                    value
                );

            case ComparisonOperation.LESS_THAN_OR_EQUAL:
                if (compareResult === -1 || compareResult === 0) {
                    return createValidationSuccess();
                }
                return createComparisonValidationResult(
                    compareResult,
                    ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL,
                    compareValue,
                    value
                );

            case ComparisonOperation.EQUAL:
                if (compareResult === 0) {
                    return createValidationSuccess();
                }
                return createComparisonValidationResult(
                    compareResult,
                    ValidationErrorCode.NOT_EQUAL,
                    compareValue,
                    value
                );

            case ComparisonOperation.NOT_EQUAL:
                if (compareResult !== 0) {
                    return createValidationSuccess();
                }
                return createValidationFailure(ValidationErrorCode.EQUAL, {
                    expected: compareValue,
                    actual: value,
                });

            default:
                throw new Error(`Unsupported comparison operation: ${operation}`);
        }
    };
}

/**
 * 获取值的长度
 */
function getLength(value: any): number | undefined {
    if (isString(value).isValid) {
        return value.length;
    }

    if (isArray(value).isValid) {
        return value.length;
    }

    if (isMap(value).isValid) {
        return value.size;
    }

    if (isSet(value).isValid) {
        return value.size;
    }

    if (isObject(value).isValid) {
        return Object.keys(value).length;
    }

    return undefined;
}

/**
 * 检查长度是否满足条件
 */
function checkLength(
    condition: (length: number) => boolean,
    errorCode: ValidationErrorCode,
    errorParams: Record<string, any>
): (value: any) => ValidationRuleResult {
    return (value: any): ValidationRuleResult => {
        const length = getLength(value);

        if (length === undefined) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_HAS_LENGTH, { value });
        }

        if (condition(length)) {
            return createValidationSuccess();
        }

        return createValidationFailure(errorCode, {
            ...errorParams,
            actualLength: length,
            value,
        });
    };
}

/**
 * 检查是否有最小长度
 */
export function hasMinLength(min: number): (value: any) => ValidationRuleResult {
    return checkLength(length => length >= min, ValidationErrorCode.MIN_LENGTH, { min });
}

/**
 * 检查是否有最大长度
 */
export function hasMaxLength(max: number): (value: any) => ValidationRuleResult {
    return checkLength(length => length <= max, ValidationErrorCode.MAX_LENGTH, { max });
}

/**
 * 长度是否在范围内
 */
export function hasLengthBetween(min: number, max: number): (value: any) => ValidationRuleResult {
    return allRules(hasMinLength(min), hasMaxLength(max));
}

/**
 * 检查是否有最小值
 */
export function hasMinValue(
    min: number,
    strict: boolean = true
): (value: any) => ValidationRuleResult {
    return createComparisonValidator(ComparisonOperation.GREATER_THAN_OR_EQUAL, min, strict);
}

/**
 * 检查是否有最大值
 */
export function hasMaxValue(
    max: number,
    strict: boolean = true
): (value: any) => ValidationRuleResult {
    return createComparisonValidator(ComparisonOperation.LESS_THAN_OR_EQUAL, max, strict);
}

/**
 * 检查值是否在范围内
 */
export function isBetween(
    min: number,
    max: number,
    strict: boolean = true
): (value: any) => ValidationRuleResult {
    return allRules(isGreaterThanOrEqual(min, strict), isLessThanOrEqual(max, strict));
}

/**
 * 检查值是否大于某个值
 */
export function isGreaterThan(
    compareValue: number,
    strict: boolean = true
): (value: any) => ValidationRuleResult {
    return createComparisonValidator(ComparisonOperation.GREATER_THAN, compareValue, strict);
}

/**
 * 检查值是否大于等于某个值
 */
export function isGreaterThanOrEqual(
    compareValue: number,
    strict: boolean = true
): (value: any) => ValidationRuleResult {
    return createComparisonValidator(
        ComparisonOperation.GREATER_THAN_OR_EQUAL,
        compareValue,
        strict
    );
}

/**
 * 检查值是否小于某个值
 */
export function isLessThan(
    compareValue: number,
    strict: boolean = true
): (value: any) => ValidationRuleResult {
    return createComparisonValidator(ComparisonOperation.LESS_THAN, compareValue, strict);
}

/**
 * 检查值是否小于等于某个值
 */
export function isLessThanOrEqual(
    compareValue: number,
    strict: boolean = true
): (value: any) => ValidationRuleResult {
    return createComparisonValidator(ComparisonOperation.LESS_THAN_OR_EQUAL, compareValue, strict);
}

/**
 * 检查值是否等于期望值
 */
export function isEqualTo(
    expected: any,
    strict: boolean = true
): (value: any) => ValidationRuleResult {
    return createComparisonValidator(ComparisonOperation.EQUAL, expected, strict);
}

/**
 * 检查值是否不等于某个值
 */
export function isNotEqualTo(
    notExpected: any,
    strict: boolean = true
): (value: any) => ValidationRuleResult {
    return createComparisonValidator(ComparisonOperation.NOT_EQUAL, notExpected, strict);
}

/**
 * 检查集合成员关系的通用函数
 */
function checkCollectionMembership(
    collection: any[] | Set<any>,
    value: any,
    shouldBeIn: boolean,
    errorCode: ValidationErrorCode
): ValidationRuleResult {
    let isIn = false;

    if (Array.isArray(collection)) {
        isIn = collection.includes(value);
    } else if (collection instanceof Set) {
        isIn = collection.has(value);
    } else {
        return createValidationFailure(ValidationErrorCode.INVALID_COLLECTION_TYPE, {
            value,
            collection,
        });
    }

    // 根据shouldBeIn参数决定何时返回成功
    if (shouldBeIn ? isIn : !isIn) {
        return createValidationSuccess();
    }

    // 返回相应的错误
    return createValidationFailure(errorCode, {
        collection: Array.isArray(collection) ? collection : Array.from(collection),
        collectionText: Array.isArray(collection)
            ? `[${collection.join(', ')}]`
            : `{${Array.from(collection).join(', ')}}`,
        value,
    });
}

/**
 * 检查值是否在集合中
 */
export function isInCollection(collection: any[] | Set<any>): (value: any) => ValidationRuleResult {
    return (value: any): ValidationRuleResult => {
        return checkCollectionMembership(
            collection,
            value,
            true, // 应该在集合中
            ValidationErrorCode.NOT_IN_COLLECTION
        );
    };
}

/**
 * 检查值是否不在集合中
 */
export function isNotInCollection(
    collection: any[] | Set<any>
): (value: any) => ValidationRuleResult {
    return (value: any): ValidationRuleResult => {
        return checkCollectionMembership(
            collection,
            value,
            false, // 不应该在集合中
            ValidationErrorCode.IN_COLLECTION
        );
    };
}

/**
 * 检查字符串是否为空
 */
export function isEmptyString(value: any): ValidationRuleResult {
    if (typeof value !== 'string') {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING, { value });
    }

    if (value.trim().length === 0) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 检查数组是否为空
 */
export function isEmptyArray(value: any): ValidationRuleResult {
    if (!Array.isArray(value)) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
    }

    if (value.length === 0) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 检查对象是否为空
 */
export function isEmptyObject(value: any): ValidationRuleResult {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_OBJECT, { value });
    }

    if (Object.keys(value).length === 0) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 检查 Map 是否为空
 */
export function isEmptyMap(value: any): ValidationRuleResult {
    if (!(value instanceof Map)) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_MAP, { value });
    }

    if (value.size === 0) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 检查 Set 是否为空
 */
export function isEmptySet(value: any): ValidationRuleResult {
    if (!(value instanceof Set)) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_SET, { value });
    }

    if (value.size === 0) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 通用检查：值是否为空
 */
export function isEmpty(value: any): ValidationRuleResult {
    // 检查 null 或 undefined
    if (value === null || value === undefined) {
        return createValidationSuccess();
    }

    // 检查字符串
    if (typeof value === 'string') {
        return isEmptyString(value);
    }

    // 检查数组
    if (Array.isArray(value)) {
        return isEmptyArray(value);
    }

    // 检查 Map
    if (value instanceof Map) {
        return isEmptyMap(value);
    }

    // 检查 Set
    if (value instanceof Set) {
        return isEmptySet(value);
    }

    // 检查对象
    if (typeof value === 'object') {
        return isEmptyObject(value);
    }

    // 其他类型视为非空
    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 检查是否为有效索引（非负整数）
 */
export function isArrayIndex(value: any): ValidationRuleResult {
    // 复用已有的整数类型检查
    const integerCheck = isNumber(value);
    if (!integerCheck.isValid) {
        return integerCheck;
    }

    if (!Number.isInteger(value) || value < 0 || value >= 2 ** 32 - 1) {
        return createValidationFailure(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, {
            min: 0,
            max: 2 ** 32 - 2,
            actual: value,
        });
    }

    return createValidationSuccess();
}

/**
 * 检查是否为有效的属性键（字符串、符号或数字）
 */
export function isPropertyKey(value: any): ValidationRuleResult {
    const isValid =
        typeof value === 'string' || typeof value === 'symbol' || typeof value === 'number';

    if (isValid) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.INVALID_PROPERTY_KEY, { value });
}

/**
 * 检查两个值是否为相同类型
 */
export function isSameType(a: any, b: any): ValidationRuleResult {
    // 处理 null 和 undefined
    if (a === null || a === undefined || b === null || b === undefined) {
        const isSame = a === b;
        if (isSame) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_SAME_TYPE, { a, b });
    }

    // 特殊处理数组
    const aIsArray = Array.isArray(a);
    const bIsArray = Array.isArray(b);
    if (aIsArray && bIsArray) {
        return createValidationSuccess();
    }

    if (aIsArray !== bIsArray) {
        return createValidationFailure(ValidationErrorCode.NOT_SAME_TYPE, { a, b });
    }

    // 特殊处理对象
    const aIsObject = typeof a === 'object';
    const bIsObject = typeof b === 'object';
    if (aIsObject && bIsObject) {
        return createValidationSuccess();
    }

    // 其他类型使用 typeof
    const isSame = typeof a === typeof b;
    if (isSame) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_SAME_TYPE, { a, b });
}

/**
 * 检查值是否可序列化为 JSON
 */
export function isJSONSerializable(value: any): ValidationRuleResult {
    // 检查 undefined 和 symbol
    if (value === undefined || typeof value === 'symbol') {
        return createValidationFailure(ValidationErrorCode.NOT_JSON_SERIALIZABLE, { value });
    }

    // 基本类型可以直接序列化
    if (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return createValidationSuccess();
    }

    // 数组检查
    if (Array.isArray(value)) {
        for (const item of value) {
            const result = isJSONSerializable(item);
            if (!result.isValid) {
                return result;
            }
        }
        return createValidationSuccess();
    }

    // 对象检查
    if (typeof value === 'object') {
        // Date 对象会转换为 ISO 字符串
        if (value instanceof Date) {
            return createValidationSuccess();
        }

        // 检查 Symbol 键
        const symbolKeys = Object.getOwnPropertySymbols(value);
        if (symbolKeys.length > 0) {
            return createValidationFailure(ValidationErrorCode.NOT_JSON_SERIALIZABLE, {
                value,
                reason: 'Symbol key',
            });
        }

        // 普通对象递归检查
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                // 检查键
                const result = isJSONSerializable(value[key]);
                if (!result.isValid) {
                    return result;
                }
            }
        }
        return createValidationSuccess();
    }

    // 其他对象类型不可序列化
    return createValidationFailure(ValidationErrorCode.NOT_JSON_SERIALIZABLE, { value });
}
