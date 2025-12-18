// utils/validation/rules/patterns/common.ts
import { createPatternValidator } from './regex';
import {
    ValidationErrorCode,
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    EMAIL_PATTERN,
    URL_PATTERN,
    PHONE_PATTERN,
    USERNAME_PATTERN,
    UUID_PATTERN,
} from '../../core';


// 使用工厂函数创建所有验证函数
export const isEmail = createPatternValidator(
    EMAIL_PATTERN, 
    ValidationErrorCode.INVALID_FORMAT
);

export const isURL = createPatternValidator(
    URL_PATTERN, 
    ValidationErrorCode.INVALID_FORMAT
);

export const isPhoneNumber = createPatternValidator(
    PHONE_PATTERN,
    ValidationErrorCode.INVALID_FORMAT
);

export const isUUID = createPatternValidator(
    UUID_PATTERN, 
    ValidationErrorCode.INVALID_FORMAT
);

export const isUsername = createPatternValidator(
    USERNAME_PATTERN,
    ValidationErrorCode.INVALID_FORMAT
);

/**
 * 检查是否为有效的数字字符串
 */
export function isNumericString(value: any): ValidationResult {
    // 首先检查是否为字符串
    if (typeof value !== 'string') {
        return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
            value,
            expected: 'string',
            actual: typeof value,
            errorMessage: 'Value must be a string'
        });
    }

    // 检查是否为数字字符串（包括小数、科学计数法）
    const num = Number(value);
    if (isNaN(num) || value.trim() === '') {
        return createValidationFailure(ValidationErrorCode.PATTERN_MISMATCH, {
            value,
            pattern: 'numeric string',
            errorMessage: 'Value must be a valid numeric string'
        });
    }

    return createValidationSuccess();
}

/**
 * 检查是否为有效的整数字符串
 */
export function isIntegerString(value: any): ValidationResult {
    // 首先检查是否为字符串
    if (typeof value !== 'string') {
        return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
            value,
            expected: 'string',
            actual: typeof value,
            errorMessage: 'Value must be a string'
        });
    }

    const num = Number(value);
    if (!Number.isInteger(num) || isNaN(num) || value.trim() === '') {
        return createValidationFailure(ValidationErrorCode.PATTERN_MISMATCH, {
            value,
            pattern: 'integer string',
            errorMessage: 'Value must be a valid integer string'
        });
    }

    return createValidationSuccess();
}