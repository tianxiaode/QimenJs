import { isString, isArray, isObject, isMap, isSet } from '../types';

/**
 * 约束验证函数
 * 这些函数用于验证值的各种约束条件，如范围、长度等
 */

/**
 * 验证最小长度
 * @param value 要验证的值
 * @param min 最小长度
 */
export function validateMinLength(value: any, min: number): boolean {
    if (isString(value)) {
        return value.length >= min;
    }

    if (isArray(value)) {
        return value.length >= min;
    }

    if (isMap(value)) {
        return value.size >= min;
    }

    if (isSet(value)) {
        return value.size >= min;
    }

    if (isObject(value)) {
        return Object.keys(value).length >= min;
    }


    return false;
}

/**
 * 验证最大长度
 * @param value 要验证的值
 * @param max 最大长度
 */
export function validateMaxLength(value: any, max: number): boolean {
    if (isString(value)) {
        return value.length <= max;
    }

    if (isArray(value)) {
        return value.length <= max;
    }

    if (isMap(value)) {
        return value.size <= max;
    }

    if (isSet(value)) {
        return value.size <= max;
    }

    if (isObject(value)) {
        return Object.keys(value).length <= max;
    }

    return false;
}

/**
 * 验证长度范围
 * @param value 要验证的值
 * @param min 最小长度
 * @param max 最大长度
 */
export function validateLengthRange(value: any, min: number, max: number): boolean {
    return validateMinLength(value, min) && validateMaxLength(value, max);
}

/**
 * 验证最小值
 * @param value 要验证的值
 * @param min 最小值
 */
export function validateMin(value: any, min: number): boolean {
    return typeof value === 'number' && value >= min;
}

/**
 * 验证最大值
 * @param value 要验证的值
 * @param max 最大值
 */
export function validateMax(value: any, max: number): boolean {
    return typeof value === 'number' && value <= max;
}

/**
 * 验证数值范围
 * @param value 要验证的值
 * @param min 最小值
 * @param max 最大值
 */
export function validateRange(value: any, min: number, max: number): boolean {
    return typeof value === 'number' && value >= min && value <= max;
}

/**
 * 验证是否在集合中
 * @param value 要验证的值
 * @param collection 集合（数组、Set 或对象的值数组）
 */
export function validateIn(
    value: any,
    collection: any[] | Set<any> | Record<string, any>
): boolean {
    if (isArray(collection)) {
        return collection.includes(value);
    }

    if (isSet(collection)) {
        return collection.has(value);
    }

    if (isObject(collection)) {
        return Object.values(collection).includes(value);
    }

    return false;
}

/**
 * 验证是否不在集合中
 * @param value 要验证的值
 * @param collection 集合
 */
export function validateNotIn(
    value: any,
    collection: any[] | Set<any> | Record<string, any>
): boolean {
    return !validateIn(value, collection);
}

/**
 * 验证值是否匹配所有条件
 * @param value 要验证的值
 * @param validators 验证器数组
 */
export function validateAllConstraints(value: any, validators: ((v: any) => boolean)[]): boolean {
    return validators.every(validator => validator(value));
}

/**
 * 验证值是否匹配任一条件
 * @param value 要验证的值
 * @param validators 验证器数组
 */
export function validateAnyConstraints(value: any, validators: ((v: any) => boolean)[]): boolean {
    return validators.some(validator => validator(value));
}

/**
 * 验证值不匹配条件
 * @param value 要验证的值
 * @param validator 验证器
 */
export function validateNotConstraints(value: any, validator: (v: any) => boolean): boolean {
    return !validator(value);
}

/**
 * 验证值是否等于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 */
export function validateEqualTo(value: any, other: any): boolean {
    return value === other;
}

/**
 * 验证值是否不等于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 */
export function validateNotEqualTo(value: any, other: any): boolean {
    return value !== other;
}

/**
 * 验证值是否严格等于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 */
export function validateStrictEqualTo(value: any, other: any): boolean {
    return value === other;
}

/**
 * 验证值是否严格不等于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 */
export function validateStrictNotEqualTo(value: any, other: any): boolean {
    return value !== other;
}

/**
 * 验证值是否大于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 */
export function validateGreaterThan(value: any, other: number): boolean {
    return typeof value === 'number' && value > other;
}

/**
 * 验证值是否大于等于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 */
export function validateGreaterThanOrEqualTo(value: any, other: number): boolean {
    return typeof value === 'number' && value >= other;
}

/**
 * 验证值是否小于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 */
export function validateLessThan(value: any, other: number): boolean {
    return typeof value === 'number' && value < other;
}

/**
 * 验证值是否小于等于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 */
export function validateLessThanOrEqualTo(value: any, other: number): boolean {
    return typeof value === 'number' && value <= other;
}

/**
 * 验证值是否在指定范围内（包含边界）
 * @param value 要验证的值
 * @param lower 下界
 * @param upper 上界
 */
export function validateBetween(value: any, lower: number, upper: number): boolean {
    return validateRange(value, lower, upper);
}

/**
 * 验证值是否在指定范围内（不包含边界）
 * @param value 要验证的值
 * @param lower 下界
 * @param upper 上界
 */
export function validateBetweenExclusive(value: any, lower: number, upper: number): boolean {
    return typeof value === 'number' && value > lower && value < upper;
}

/**
 * 验证值是否为空
 * @param value 要验证的值
 */
export function validateEmpty(value: any): boolean {
    if (value === null || value === undefined) {
        return true;
    }

    if (isString(value)) {
        return value.trim().length === 0;
    }

    if (isArray(value)) {
        return value.length === 0;
    }

    if (isMap(value)) {
        return value.size === 0;
    }

    if (isSet(value)) {
        return value.size === 0;
    }

    if (isObject(value)) {
        return Object.keys(value).length === 0;
    }


    return false;
}

/**
 * 验证值是否非空
 * @param value 要验证的值
 */
export function validateNotEmpty(value: any): boolean {
    return !validateEmpty(value);
}

/**
 * 验证值是否为真（约束版本）
 * 与 primitives.ts 中的 validateTruthy 功能相同，但用于约束验证上下文
 */
export function validateTruthyConstraint(value: any): boolean {
    return !!value;
}

/**
 * 验证值是否为假（约束版本）
 * 与 primitives.ts 中的 validateFalsy 功能相同，但用于约束验证上下文
 */
export function validateFalsyConstraint(value: any): boolean {
    return !value;
}

/**
 * 创建范围验证器
 * @param min 最小值
 * @param max 最大值
 */
export function createRangeValidator(min: number, max: number) {
    return (value: any): boolean => validateRange(value, min, max);
}

/**
 * 创建长度验证器
 * @param min 最小长度
 * @param max 最大长度
 */
export function createLengthValidator(min: number, max: number) {
    return (value: any): boolean => validateLengthRange(value, min, max);
}

/**
 * 创建包含验证器
 * @param collection 集合
 */
export function createInValidator(collection: any[] | Set<any>) {
    return (value: any): boolean => validateIn(value, collection);
}
