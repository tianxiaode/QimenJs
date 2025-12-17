// rules/constraints/comparison/numeric.ts
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

            default:
                throw new Error(`Unsupported comparison operation: ${operation}`);
        }
    };
}

/**
 * 检查值是否大于某个值
 */
export function isGreaterThan(
    compareValue: number,
    strict: boolean = true
): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.GREATER_THAN, compareValue, strict);
}

/**
 * 检查值是否大于等于某个值
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
 */
export function isLessThan(
    compareValue: number,
    strict: boolean = true
): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.LESS_THAN, compareValue, strict);
}

/**
 * 检查值是否小于等于某个值
 */
export function isLessThanOrEqual(
    compareValue: number,
    strict: boolean = true
): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.LESS_THAN_OR_EQUAL, compareValue, strict);
}

/**
 * 检查是否有最小值
 */
export function hasMinValue(min: number, strict: boolean = true): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.GREATER_THAN_OR_EQUAL, min, strict);
}

/**
 * 检查是否有最大值
 */
export function hasMaxValue(max: number, strict: boolean = true): (value: any) => ValidationResult {
    return createComparisonValidator(ComparisonOperation.LESS_THAN_OR_EQUAL, max, strict);
}

/**
 * 检查值是否在范围内
 */
export function isBetween(
    min: number,
    max: number,
    strict: boolean = true
): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const minCheck = isGreaterThanOrEqual(min, strict)(value);
        if (!minCheck.isValid) {
            return minCheck;
        }

        return isLessThanOrEqual(max, strict)(value);
    };
}
