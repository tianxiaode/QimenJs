import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../../core';
import { isBetween } from '../../comparison';
import { isNumber } from '../basic';

/**
 * 检查数字是否在范围内（包含边界）
 * 别名函数，使用 isBetween 实现
 */
export function isInRange(min: number, max: number): (value: any) => ValidationResult {
    return isBetween(min, max, true);
}

/**
 * 检查数字是否在范围内（不包含边界）
 * 别名函数，使用 isBetween 实现
 */
export function isInExclusiveRange(min: number, max: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
              value,
              expected: 'number',
              actual: typeof value,
              errorMessage: 'Value must be a number'
            });
        }
        
        const result = isBetween(min, max, true)(value);
        if (!result.isValid) {
            // 修改错误信息以反映这是不包含边界的范围检查
            return createValidationFailure(ValidationErrorCode.OUT_OF_RANGE, {
                value,
                min,
                max,
                actual: value,
                errorMessage: `Value must be between ${min} and ${max} (exclusive)`
            });
        }
        
        // 需要额外检查边界值
        if (value === min || value === max) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
                value,
                min,
                max,
                actual: value,
                errorMessage: `Value must be between ${min} and ${max} (exclusive)`
            });
        }
        
        return createValidationSuccess();
    };
}

