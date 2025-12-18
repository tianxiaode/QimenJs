// utils/validation/rules/array/sorting.ts
import { ValidationErrorCode } from '../../../core';
import { isArray } from '../../types';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../../core';

/**
 * 检查数组是否已排序
 */
export function isSorted(
    direction: 'asc' | 'desc' | boolean = true
): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
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
                return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
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