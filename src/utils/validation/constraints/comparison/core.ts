// rules/constraints/comparison/core.ts
import { ValidationErrorCode } from '../../core/constants';
import { ValidationResult,createValidationFailure, createValidationSuccess } from '../../core';

/**
 * 严格比较两个值
 * @param value 第一个值
 * @param other 第二个值
 * @returns 比较结果：-1 表示 value < other，0 表示相等，1 表示 value > other，NaN 表示无法比较
 */
export function strictCompare(value: any, other: any): number {
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
export function looseCompare(value: any, other: any): number {
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
export function createComparisonValidationResult(
    comparisonResult: number,
    errorCode: ValidationErrorCode,
    expected: any,
    actual: any,
    additionalData: Record<string, any> = {}
): ValidationResult {
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