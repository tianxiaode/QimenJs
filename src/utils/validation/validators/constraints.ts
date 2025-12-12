import { isString, isArray, isObject, isMap, isSet } from '../types';

/**
 * 约束验证函数
 * 这些函数用于验证值的各种约束条件，如范围、长度等
 */

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
            return value === other ? 0 : (value < other ? -1 : 1);
        }
        
        // 字符串比较（严格模式下只进行字典序比较）
        if (typeof value === 'string') {
            return value === other ? 0 : (value < other ? -1 : 1);
        }
        
        // Date对象比较
        if (value instanceof Date && other instanceof Date) {
            if (isNaN(value.getTime()) || isNaN(other.getTime())) return NaN;
            const diff = value.getTime() - other.getTime();
            return diff === 0 ? 0 : (diff < 0 ? -1 : 1);
        }
        
        // 布尔值比较
        if (typeof value === 'boolean') {
            return value === other ? 0 : (value ? 1 : -1);
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
                return value === other ? 0 : (value < other ? -1 : 1);
            }
            
            // 字符串比较（宽松模式下尝试数字比较）
            if (typeof value === 'string') {
                // 尝试数字比较
                const numValue = Number(value);
                const numOther = Number(other);
                
                if (!isNaN(numValue) && !isNaN(numOther)) {
                    return numValue === numOther ? 0 : (numValue < numOther ? -1 : 1);
                }
                
                // 字典序比较
                return value === other ? 0 : (value < other ? -1 : 1);
            }
            
            // Date对象比较
            if (value instanceof Date && other instanceof Date) {
                if (isNaN(value.getTime()) || isNaN(other.getTime())) return NaN;
                const diff = value.getTime() - other.getTime();
                return diff === 0 ? 0 : (diff < 0 ? -1 : 1);
            }
            
            // 布尔值比较
            if (typeof value === 'boolean') {
                return value === other ? 0 : (value ? 1 : -1);
            }
        }
        
        // 不同类型尝试转换比较
        // 如果value是Date，尝试将other转为Date
        if (value instanceof Date && !isNaN(value.getTime())) {
            if (typeof other === 'string') {
                const dateOther = new Date(other);
                if (!isNaN(dateOther.getTime())) {
                    const diff = value.getTime() - dateOther.getTime();
                    return diff === 0 ? 0 : (diff < 0 ? -1 : 1);
                }
            }
            
            if (typeof other === 'number') {
                const dateOther = new Date(other);
                if (!isNaN(dateOther.getTime())) {
                    const diff = value.getTime() - dateOther.getTime();
                    return diff === 0 ? 0 : (diff < 0 ? -1 : 1);
                }
            }
        }
        
        // 如果other是Date，尝试将value转为Date
        if (other instanceof Date && !isNaN(other.getTime())) {
            if (typeof value === 'string') {
                const dateValue = new Date(value);
                if (!isNaN(dateValue.getTime())) {
                    const diff = dateValue.getTime() - other.getTime();
                    return diff === 0 ? 0 : (diff < 0 ? -1 : 1);
                }
            }
            
            if (typeof value === 'number') {
                const dateValue = new Date(value);
                if (!isNaN(dateValue.getTime())) {
                    const diff = dateValue.getTime() - other.getTime();
                    return diff === 0 ? 0 : (diff < 0 ? -1 : 1);
                }
            }
        }
        
        // 如果other是数字，尝试将value转为数字
        if (typeof other === 'number' && !isNaN(other)) {
            if (typeof value === 'string') {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    return numValue === other ? 0 : (numValue < other ? -1 : 1);
                }
            }
        }
        
        // 如果value是数字，尝试将other转为数字
        if (typeof value === 'number' && !isNaN(value)) {
            if (typeof other === 'string') {
                const numOther = Number(other);
                if (!isNaN(numOther)) {
                    return value === numOther ? 0 : (value < numOther ? -1 : 1);
                }
            }
        }
        
        // 尝试通用数字转换
        const numValue = Number(value);
        const numOther = Number(other);
        
        if (!isNaN(numValue) && !isNaN(numOther)) {
            return numValue === numOther ? 0 : (numValue < numOther ? -1 : 1);
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
function smartCompare(value: any, other: any, strict: boolean = false): number {
    if (strict) {
        return strictCompare(value, other);
    } else {
        return looseCompare(value, other);
    }
}
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
        return Object.prototype.hasOwnProperty.call(collection, value);    
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
 * @param strict 是否使用严格比较，默认为true
 */
export function validateEqualTo(value: any, other: any, strict: boolean = false): boolean {
    return smartCompare(value, other, strict) === 0;
}

/**
 * 验证值是否不等于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 * @param strict 是否使用严格比较，默认为true
 */
export function validateNotEqualTo(value: any, other: any, strict: boolean = false): boolean {
    return !validateEqualTo(value, other, strict);
}

/**
 * 验证值是否大于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 * @param strict 是否使用严格比较，默认为false
 */
export function validateGreaterThan(value: any, other: any, strict: boolean = false): boolean {
    return smartCompare(value, other, strict) === 1;
}

/**
 * 验证值是否大于等于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 * @param strict 是否使用严格比较，默认为false
 */
export function validateGreaterThanOrEqualTo(value: any, other: any, strict: boolean = false): boolean {
    const result = smartCompare(value, other, strict);
    return result === 1 || result === 0;
}

/**
 * 验证值是否小于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 * @param strict 是否使用严格比较，默认为false
 */
export function validateLessThan(value: any, other: any, strict: boolean = false): boolean {
    return smartCompare(value, other, strict) === -1;
}

/**
 * 验证值是否小于等于某个值
 * @param value 要验证的值
 * @param other 要比较的值
 * @param strict 是否使用严格比较，默认为false
 */
export function validateLessThanOrEqualTo(value: any, other: any, strict: boolean = false): boolean {
    const result = smartCompare(value, other, strict);
    return result === -1 || result === 0;
}

/**
 * 验证值是否在指定范围内（包含边界）
 * @param value 要验证的值
 * @param lower 下界
 * @param upper 上界
 * @param strict 是否使用严格比较，默认为false
 */
export function validateBetween(value: any, lower: any, upper: any, strict: boolean = false): boolean {
    return validateRange(value, lower, upper, strict);
}

/**
 * 验证值是否在指定范围内（不包含边界）
 * @param value 要验证的值
 * @param lower 下界
 * @param upper 上界
 * @param strict 是否使用严格比较，默认为false
 */
export function validateBetweenExclusive(value: any, lower: any, upper: any, strict: boolean = false): boolean {
    const lowerResult = smartCompare(value, lower, strict);
    const upperResult = smartCompare(value, upper, strict);
    
    return lowerResult === 1 && upperResult === -1;
}

/**
 * 验证最小值
 * @param value 要验证的值
 * @param min 最小值
 * @param strict 是否使用严格比较，默认为false
 */
export function validateMin(value: any, min: number, strict: boolean = false): boolean {
    const result = smartCompare(value, min, strict);
    return result === 1 || result === 0;
}

/**
 * 验证最大值
 * @param value 要验证的值
 * @param max 最大值
 * @param strict 是否使用严格比较，默认为false
 */
export function validateMax(value: any, max: number, strict: boolean = false): boolean {
    const result = smartCompare(value, max, strict);
    return result === -1 || result === 0;
}

/**
 * 验证数值范围
 * @param value 要验证的值
 * @param min 最小值
 * @param max 最大值
 * @param strict 是否使用严格比较，默认为false
 */
export function validateRange(value: any, min: number, max: number, strict: boolean = false): boolean {
    return validateMin(value, min, strict) && validateMax(value, max, strict);
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
export function createRangeValidator(min: any, max: any) {
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