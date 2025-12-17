import { ValidationErrorCode } from '../../core';
import { isArray, isString, isNumber, isBoolean, isObject, isFunction } from '../types';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';
import { getLength, checkLength, hasSize } from '../size';

/**
 * 检查是否为数组且具有最小长度
 */
export function hasMinArrayLength(min: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        // 使用已有的长度检查逻辑
        return checkLength(length => length >= min, ValidationErrorCode.MIN_LENGTH, { min })(value);
    };
}

/**
 * 检查是否为数组且具有最大长度
 */
export function hasMaxArrayLength(max: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        // 使用已有的长度检查逻辑
        return checkLength(length => length <= max, ValidationErrorCode.MAX_LENGTH, { max })(value);
    };
}

/**
 * 检查数组长度是否在指定范围内
 */
export function hasArrayLengthBetween(min: number, max: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        // 复用 range.ts 中的 hasSize 方法，专门针对数组
        return hasSize(value, min, max);
    };
}

/**
 * 检查数组是否具有精确长度
 */
export function hasExactArrayLength(expectedLength: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        const length = getLength(value);

        if (length === expectedLength) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.LENGTH_MISMATCH, {
            value,
            expected: expectedLength,
            actual: length,
        });
    };
}

/**
 * 检查数组长度是否为指定值之一
 */
export function hasArrayLengthOneOf(allowedLengths: number[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        const length = getLength(value);

        if (allowedLengths.includes(length!)) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.LENGTH_NOT_ONE_OF, {
            value,
            allowedLengths,
            actual: length,
        });
    };
}

/**
 * 检查是否为空数组
 */
export function isEmptyArray(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        if (value.length === 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, {
            value,
            actualLength: value.length,
        });
    };
}

/**
 * 检查是否为非空数组
 */
export function isNonEmptyArray(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为数组
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        if (value.length > 0) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.EMPTY_ARRAY, { value });
    };
}

// array.ts (追加到现有的 array.ts 文件后面)

/**
 * 检查数组是否唯一（无重复元素）
 */
export function hasUniqueItems(): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        const seen = new Set<any>();
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (seen.has(item)) {
                return createValidationFailure(ValidationErrorCode.DUPLICATE_ITEM, {
                    index: i,
                    value: item,
                    duplicateOfIndex: Array.from(seen).indexOf(item),
                });
            }
            seen.add(item);
        }

        return createValidationSuccess();
    };
}

/**
 * 根据指定函数检查数组是否唯一
 */
export function hasUniqueItemsBy<T>(selector: (item: T) => any): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        const seen = new Set<any>();
        const seenByKey = new Map<any, number>();

        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const key = selector(item);

            if (seen.has(key)) {
                const firstIndex = seenByKey.get(key)!;
                return createValidationFailure(ValidationErrorCode.DUPLICATE_ITEM, {
                    index: i,
                    value: item,
                    duplicateOfIndex: firstIndex,
                    duplicateKey: key,
                });
            }

            seen.add(key);
            seenByKey.set(key, i);
        }

        return createValidationSuccess();
    };
}

/**
 * 检查数组是否已排序
 */
export function isSorted(
    direction: 'asc' | 'desc' | boolean = true
): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        if (value.length <= 1) {
            return createValidationSuccess();
        }

        const actualDirection = direction === true || direction === 'asc' ? 'asc' : 'desc';

        for (let i = 1; i < value.length; i++) {
            const prev = value[i - 1];
            const curr = value[i];

            let isOrdered = false;

            if (typeof prev === 'number' && typeof curr === 'number') {
                isOrdered = actualDirection === 'asc' ? prev <= curr : prev >= curr;
            } else if (typeof prev === 'string' && typeof curr === 'string') {
                isOrdered =
                    actualDirection === 'asc'
                        ? prev.localeCompare(curr) <= 0
                        : prev.localeCompare(curr) >= 0;
            } else if (prev instanceof Date && curr instanceof Date) {
                isOrdered = actualDirection === 'asc' ? prev <= curr : prev >= curr;
            } else {
                // 对于其他类型，转换为字符串比较
                const prevStr = String(prev);
                const currStr = String(curr);
                isOrdered =
                    actualDirection === 'asc'
                        ? prevStr.localeCompare(currStr) <= 0
                        : prevStr.localeCompare(currStr) >= 0;
            }

            if (!isOrdered) {
                return createValidationFailure(ValidationErrorCode.UNSORTED_ARRAY, {
                    index: i,
                    direction: actualDirection,
                    previousValue: prev,
                    currentValue: curr,
                });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 检查数组是否只包含允许的值
 */
export function containsOnly<T>(allowedValues: T[]): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (!allowedValues.includes(item)) {
                return createValidationFailure(ValidationErrorCode.ITEM_NOT_ALLOWED, {
                    index: i,
                    value: item,
                    allowedValues,
                });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 检查数组是否包含所有必须的值
 */
export function containsAll<T>(requiredValues: T[]): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        const missingItems = requiredValues.filter(item => !value.includes(item));
        if (missingItems.length > 0) {
            return createValidationFailure(ValidationErrorCode.MISSING_REQUIRED_ITEMS, {
                missingItems,
                requiredValues,
            });
        }

        return createValidationSuccess();
    };
}

/**
 * 检查数组是否不包含任何排除的值
 */
export function containsNone<T>(excludedValues: T[]): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (excludedValues.includes(item)) {
                return createValidationFailure(ValidationErrorCode.ITEM_NOT_ALLOWED, {
                    index: i,
                    value: item,
                    excludedValues,
                });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 检查数组是否包含至少一个指定值
 */
export function containsAny<T>(possibleValues: T[]): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        const found = possibleValues.some(item => value.includes(item));
        if (!found) {
            return createValidationFailure(ValidationErrorCode.NO_MATCHING_ITEM, {
                possibleValues,
            });
        }

        return createValidationSuccess();
    };
}

/**
 * 检查数组元素类型
 */
export function hasItemType<T>(
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function'
): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            let isValid = true;

            switch (type) {
                case 'string':
                    isValid = isString(item).isValid;
                    break;
                case 'number':
                    isValid = isNumber(item).isValid;
                    break;
                case 'boolean':
                    isValid = isBoolean(item).isValid;
                    break;
                case 'object':
                    isValid = isObject(item).isValid;
                    break;
                case 'array':
                    isValid = isArray(item).isValid;
                    break;
                case 'function':
                    isValid = isFunction(item).isValid;
                    break;
            }

            if (!isValid) {
                return createValidationFailure(ValidationErrorCode.INVALID_ITEM_TYPE, {
                    index: i,
                    value: item,
                    expectedType: type,
                    actualValue: item,
                });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 使用自定义函数检查数组元素类型
 */
export function hasItemTypeCheck<T>(
    checkFn: (item: any) => boolean
): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
        }

        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (!checkFn(item)) {
                return createValidationFailure(ValidationErrorCode.INVALID_ITEM_TYPE, {
                    index: i,
                    value: item,
                    actualValue: item,
                });
            }
        }

        return createValidationSuccess();
    };
}
