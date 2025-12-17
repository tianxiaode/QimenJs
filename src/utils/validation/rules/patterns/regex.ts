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
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING, { value });
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

        const patternText = pattern instanceof RegExp ? pattern.source : pattern;
        return createValidationFailure(ValidationErrorCode.PATTERN_MISMATCH, {
            pattern: patternText,
            patternText: `正则表达式: ${patternText}`,
            value,
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
            return createValidationFailure(errorCode, { value });
        }

        // 如果提供了额外验证函数，则执行额外验证
        if (additionalValidation && typeof value === 'string' && !additionalValidation(value)) {
            return createValidationFailure(errorCode, { value });
        }

        return createValidationSuccess();
    };
}
