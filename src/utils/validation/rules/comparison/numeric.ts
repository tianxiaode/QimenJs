import { isNumber } from '../types';
import { smartCompare, createComparisonValidationResult } from './core';
import {
    ValidationResult,
    createValidationSuccess,
    createValidationFailure,
    ValidationErrorCode,
} from '../../core';

/**
 * 比较操作枚举
 */
export enum ComparisonOperation {
    GREATER_THAN,
    GREATER_THAN_OR_EQUAL,
    LESS_THAN,
    LESS_THAN_OR_EQUAL,
    EQUAL,
    NOT_EQUAL,
}

/**
 * 创建比较验证器的工厂函数
 * 
 * 支持比较的数据类型：
 * - 数字 (number)
 * - 字符串 (string)
 * - 日期 (Date)
 * - 布尔值 (boolean)
 * 
 * 根据 strict 参数决定使用严格比较还是宽松比较：
 * - 严格比较 (strict=true): 只有相同类型才能比较
 * - 宽松比较 (strict=false): 允许不同类型间转换比较
 * 
 * 比较规则：
 * - 对于大小比较（>, >=, <, <=），要求值必须是数字类型
 * - 对于相等性比较（==, !=），不限制数据类型
 * - 日期类型支持与字符串或数字的时间戳进行比较
 * - 字符串可以转换为数字进行比较（宽松模式下）
 * 
 * @param operation 比较操作类型
 * @param compareValue 要比较的值
 * @param strict 是否使用严格比较，默认为true
 * @returns 验证函数
 */
export function createComparisonValidator(
    operation: ComparisonOperation,
    compareValue: any,
    strict: boolean = true
): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
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
                return createValidationFailure(
                    ValidationErrorCode.TOO_SMALL,
                    {
                        value,
                        min: compareValue,
                        actual: value,
                        errorMessage: `Value must be greater than ${compareValue}`
                    }
                );

            case ComparisonOperation.GREATER_THAN_OR_EQUAL:
                if (compareResult === 1 || compareResult === 0) {
                    return createValidationSuccess();
                }
                return createValidationFailure(
                    ValidationErrorCode.TOO_SMALL,
                    {
                        value,
                        min: compareValue,
                        actual: value,
                        errorMessage: `Value must be greater than or equal to ${compareValue}`
                    }
                );

            case ComparisonOperation.LESS_THAN:
                if (compareResult === -1) {
                    return createValidationSuccess();
                }
                return createValidationFailure(
                    ValidationErrorCode.TOO_LARGE,
                    {
                        value,
                        max: compareValue,
                        actual: value,
                        errorMessage: `Value must be less than ${compareValue}`
                    }
                );

            case ComparisonOperation.LESS_THAN_OR_EQUAL:
                if (compareResult === -1 || compareResult === 0) {
                    return createValidationSuccess();
                }
                return createValidationFailure(
                    ValidationErrorCode.TOO_LARGE,
                    {
                        value,
                        max: compareValue,
                        actual: value,
                        errorMessage: `Value must be less than or equal to ${compareValue}`
                    }
                );

            default:
                throw new Error(`Unsupported comparison operation: ${operation}`);
        }
    };
}

/**
 * 检查值是否大于某个值
 * 
 * 支持的数据类型：
 * - 数字 (number)
 * - 字符串 (string) - 可转换为数字时
 * - 日期 (Date) - 可转换为时间戳时
 * 
 * @param compareValue 比较值
 * @param strict 是否使用严格比较，默认为true
 * @returns 验证函数
 */
export function isGreaterThan(
    compareValue: number,
    strict: boolean = true
): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.GREATER_THAN, compareValue, strict);
}

/**
 * 检查值是否大于等于某个值
 * 
 * 支持的数据类型：
 * - 数字 (number)
 * - 字符串 (string) - 可转换为数字时
 * - 日期 (Date) - 可转换为时间戳时
 * 
 * @param compareValue 比较值
 * @param strict 是否使用严格比较，默认为true
 * @returns 验证函数
 */
export function isGreaterThanOrEqual(
    compareValue: number,
    strict: boolean = true
): (value: any) => ValidationResult {
    return createComparisonValidator(
        ComparisonOperation.GREATER_THAN_OR_EQUAL,
        compareValue,
        strict
    );
}

/**
 * 检查值是否小于某个值
 * 
 * 支持的数据类型：
 * - 数字 (number)
 * - 字符串 (string) - 可转换为数字时
 * - 日期 (Date) - 可转换为时间戳时
 * 
 * @param compareValue 比较值
 * @param strict 是否使用严格比较，默认为true
 * @returns 验证函数
 */
export function isLessThan(
    compareValue: number,
    strict: boolean = true
): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.LESS_THAN, compareValue, strict);
}

/**
 * 检查值是否小于等于某个值
 * 
 * 支持的数据类型：
 * - 数字 (number)
 * - 字符串 (string) - 可转换为数字时
 * - 日期 (Date) - 可转换为时间戳时
 * 
 * @param compareValue 比较值
 * @param strict 是否使用严格比较，默认为true
 * @returns 验证函数
 */
export function isLessThanOrEqual(
    compareValue: number,
    strict: boolean = true
): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.LESS_THAN_OR_EQUAL, compareValue, strict);
}

/**
 * 检查是否有最小值
 * 
 * 支持的数据类型：
 * - 数字 (number)
 * - 字符串 (string) - 可转换为数字时
 * - 日期 (Date) - 可转换为时间戳时
 * 
 * @param min 最小值
 * @param strict 是否使用严格比较，默认为true
 * @returns 验证函数
 */
export function hasMinValue(min: number, strict: boolean = true): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.GREATER_THAN_OR_EQUAL, min, strict);
}

/**
 * 检查是否有最大值
 * 
 * 支持的数据类型：
 * - 数字 (number)
 * - 字符串 (string) - 可转换为数字时
 * - 日期 (Date) - 可转换为时间戳时
 * 
 * @param max 最大值
 * @param strict 是否使用严格比较，默认为true
 * @returns 验证函数
 */
export function hasMaxValue(max: number, strict: boolean = true): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.LESS_THAN_OR_EQUAL, max, strict);
}

/**
 * 检查值是否在范围内
 * 
 * 支持的数据类型：
 * - 数字 (number)
 * - 字符串 (string) - 可转换为数字时
 * - 日期 (Date) - 可转换为时间戳时
 * 
 * @param min 最小值
 * @param max 最大值
 * @param strict 是否使用严格比较，默认为true
 * @returns 验证函数
 */
export function isBetween(
    min: number,
    max: number,
    strict: boolean = true
): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const minCheck = isGreaterThanOrEqual(min, strict)(value);
        if (!minCheck.isValid) {
            return createValidationFailure(
                ValidationErrorCode.TOO_SMALL,
                {
                    value,
                    min,
                    actual: value,
                    errorMessage: `Value must be between ${min} and ${max}`
                }
            );
        }

        const maxCheck = isLessThanOrEqual(max, strict)(value);
        if (!maxCheck.isValid) {
            return createValidationFailure(
                ValidationErrorCode.TOO_LARGE,
                {
                    value,
                    max,
                    actual: value,
                    errorMessage: `Value must be between ${min} and ${max}`
                }
            );
        }
        
        return createValidationSuccess();
    };
}