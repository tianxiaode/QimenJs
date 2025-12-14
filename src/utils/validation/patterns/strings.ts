// rules/patterns/strings.ts
import { ValidationErrorCode } from '../constants';
import { matchesPattern } from './regex';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../base';
import {
    EMAIL_PATTERN,
    URL_PATTERN,
    IPV4_PATTERN,
    IPV6_PATTERN,
    MAC_ADDRESS_PATTERN,
    PHONE_PATTERN,
    USERNAME_PATTERN,
    UUID_PATTERN
} from '../constants/patterns';

/**
 * 创建基于特定模式和错误代码的验证函数
 * @param pattern 正则表达式模式
 * @param errorCode 错误代码
 * @param additionalValidation 额外验证函数（可选）
 */
function createPatternValidator(
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

// 使用工厂函数创建所有验证函数
export const isEmail = createPatternValidator(EMAIL_PATTERN, ValidationErrorCode.EMAIL_INVALID);
export const isURL = createPatternValidator(URL_PATTERN, ValidationErrorCode.URL_INVALID);
export const isMACAddress = createPatternValidator(
    MAC_ADDRESS_PATTERN,
    ValidationErrorCode.MAC_INVALID
);
export const isPhoneNumber = createPatternValidator(
    PHONE_PATTERN,
    ValidationErrorCode.PHONE_INVALID
);
export const isUUID = createPatternValidator(UUID_PATTERN, ValidationErrorCode.UUID_INVALID);
export const isUsername = createPatternValidator(
    USERNAME_PATTERN,
    ValidationErrorCode.USERNAME_INVALID
);

// 对于IPv4这样需要额外验证的，传入额外验证函数
export const isIPv4 = createPatternValidator(
    IPV4_PATTERN,
    ValidationErrorCode.IPV4_INVALID,
    (value: string) => {
        const parts = value.split('.');
        for (const part of parts) {
            const num = parseInt(part, 10);
            if (num < 0 || num > 255) {
                return false;
            }
        }
        return true;
    }
);

// IPv6保持简单形式
export const isIPv6 = createPatternValidator(IPV6_PATTERN, ValidationErrorCode.IPV6_INVALID);
