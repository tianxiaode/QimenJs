// utils/validation/rules/patterns/identity.ts
import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
    UPPERCASE_PATTERN,
    LOWERCASE_PATTERN,
    DIGIT_PATTERN,
    SPECIAL_CHAR_PATTERN,
    mergeValidationResults,
} from '../../core';

import { hasMinLength } from '../size';
import { createPatternValidator } from './regex';

/**
 * 密码强度验证选项
 */
export interface PasswordStrengthOptions {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireDigits?: boolean;
    requireSpecial?: boolean;
}

/**
 * 密码强度验证规则
 */
export function hasPasswordStrength(
    options: PasswordStrengthOptions = {}
): (value: any) => ValidationResult {
    const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireDigits = true,
        requireSpecial = false,
    } = options;

    return (value: any): ValidationResult => {
        // 首先检查是否为字符串
        if (typeof value !== 'string') {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'string',
                actual: typeof value,
                errorMessage: 'Password must be a string',
            });
        }

        // 收集所有验证错误
        const results: ValidationResult[] = [];

        // 检查最小长度
        if (minLength > 0) {
            const lengthResult = hasMinLength(minLength)(value);
            results.push(lengthResult);
        }

        // 检查大写字母要求
        if (requireUppercase) {
            const uppercaseResult = createPatternValidator(
                UPPERCASE_PATTERN,
                ValidationErrorCode.PASSWORD_MISSING_UPPERCASE
            )(value);
            results.push(uppercaseResult);
        }

        // 检查小写字母要求
        if (requireLowercase) {
            const lowercaseResult = createPatternValidator(
                LOWERCASE_PATTERN,
                ValidationErrorCode.PASSWORD_MISSING_LOWERCASE
            )(value);
            results.push(lowercaseResult);
        }

        // 检查数字要求
        if (requireDigits) {
            const digitResult = createPatternValidator(DIGIT_PATTERN, ValidationErrorCode.PASSWORD_MISSING_DIGIT)(value);
            results.push(digitResult);
        }

        // 检查特殊字符要求
        if (requireSpecial) {
            const specialResult = createPatternValidator(SPECIAL_CHAR_PATTERN, ValidationErrorCode.PASSWORD_MISSING_SPECIAL)(value);
            results.push(specialResult);
        }

        return mergeValidationResults(...results);

    };
}
