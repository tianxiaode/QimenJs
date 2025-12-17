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
export const isEmail = createPatternValidator(EMAIL_PATTERN, ValidationErrorCode.EMAIL_INVALID);
export const isURL = createPatternValidator(URL_PATTERN, ValidationErrorCode.URL_INVALID);
export const isPhoneNumber = createPatternValidator(
    PHONE_PATTERN,
    ValidationErrorCode.PHONE_INVALID
);
export const isUUID = createPatternValidator(UUID_PATTERN, ValidationErrorCode.UUID_INVALID);
export const isUsername = createPatternValidator(
    USERNAME_PATTERN,
    ValidationErrorCode.USERNAME_INVALID
);

/**
 * 检查是否为有效的数字字符串
 */
export function isNumericString(value: any): ValidationResult {
    // 首先检查是否为字符串
    if (typeof value !== 'string') {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING, { value });
    }

    // 检查是否为数字字符串（包括小数、科学计数法）
    const num = Number(value);
    if (isNaN(num) || value.trim() === '') {
        return createValidationFailure(ValidationErrorCode.PATTERN_MISMATCH, {
            pattern: 'numeric string',
            patternText: '数字字符串',
            value,
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
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING, { value });
    }

    const num = Number(value);
    if (!Number.isInteger(num) || isNaN(num) || value.trim() === '') {
        return createValidationFailure(ValidationErrorCode.PATTERN_MISMATCH, {
            pattern: 'integer string',
            patternText: '整数字符串',
            value,
        });
    }

    return createValidationSuccess();
}
