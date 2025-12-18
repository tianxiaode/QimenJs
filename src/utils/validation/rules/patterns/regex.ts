// utils/validation/rules/patterns/regex.ts
import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../core';

/**
 * 通用模式匹配规则
 * @param pattern 正则表达式或字符串模式
 */
export interface MatchesPatternOptions {
    caseSensitive?: boolean;
    global?: boolean;
    multiline?: boolean;
    ignoreCase?: boolean;
    sticky?: boolean;
    unicode?: boolean;
}

export function matchesPattern(pattern: RegExp | string): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        // 首先检查是否为字符串
        if (typeof value !== 'string') {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
                value,
                expected: 'string',
                actual: typeof value,
                errorMessage: 'Value must be a string'
            });
        }

        let regex: RegExp;
        if (pattern instanceof RegExp) {
            regex = pattern;
        } else {
            regex = new RegExp(pattern);
        }

        if (regex.test(value)) {
            return createValidationSuccess();
        }

        const patternText = pattern instanceof RegExp ? regex.source : pattern;
        return createValidationFailure(ValidationErrorCode.PATTERN_MISMATCH, {
            value,
            pattern: patternText,
            errorMessage: `Value does not match pattern: ${patternText}`
        });
    };
}

/**
 * 创建基于特定模式和错误代码的验证函数
 * @param pattern 正则表达式模式
 * @param errorCode 错误代码
 * @param additionalValidation 额外验证函数（可选）
 */
export function createPatternValidator(
    pattern: RegExp,
    errorCode: ValidationErrorCode,
    additionalValidation?: (value: string) => boolean
): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const patternRule = matchesPattern(pattern);
        const result = patternRule(value);

        if (!result.isValid) {            
            return createValidationFailure(errorCode, { 
                value,
                errorMessage: `Value failed custom pattern validation`
            });
        }

        // 如果提供了额外验证函数，则执行额外验证
        if (additionalValidation && typeof value === 'string' && !additionalValidation(value)) {
            return createValidationFailure(errorCode, { 
                value,
                errorMessage: `Value failed additional validation`
            });
        }

        return createValidationSuccess();
    };
}