import { ValidationErrorCode } from './error-codes';
import { AnyValidationResult, ValidationErrorContext, ValidationResult, ValidationRuleError } from './types';
import { ValidationError } from './ValidationError';

/**
 * 错误详情参数接口
 */
interface ErrorParams {
    [key: string]: any;
}

/**
 * 创建验证错误的选项
 */
interface CreateErrorOptions {
    params?: ErrorParams;
    context?: ValidationErrorContext;
}

/**
 * 创建基础验证错误对象
 */
function createValidationError(
    code: ValidationErrorCode,
    options?: CreateErrorOptions
): ValidationRuleError {
    return {
        code,
        params: options?.params || {},
        context: options?.context,
    };
}

/**
 * 错误工厂对象 - 提供便捷的错误创建方法
 */
export const ValidationErrorBuilder = {
    /**
     * 创建必填验证错误
     */
    required(context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.REQUIRED, {
            context,
        });
    },

    /**
     * 创建类型不匹配错误
     */
    type_mismatch(
        expectedType: string,
        actualType: string,
        context?: ValidationErrorContext
    ): ValidationRuleError {
        return createValidationError(ValidationErrorCode.TYPE_MISMATCH, {
            params: { expectedType, actualType },
            context,
        });
    },

    /**
     * 创建无效值错误
     */
    invalid_value(value: any, context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.INVALID_VALUE, {
            params: { value },
            context,
        });
    },

    /**
     * 创建值过小错误
     */
    too_small(
        min: number,
        value: any,
        exclusive: boolean = false,
        context?: ValidationErrorContext
    ): ValidationRuleError {
        return createValidationError(ValidationErrorCode.TOO_SMALL, {
            params: { min, value, exclusive },
            context,
        });
    },

    /**
     * 创建值过大错误
     */
    too_large(
        max: number,
        value: any,
        exclusive: boolean = false,
        context?: ValidationErrorContext
    ): ValidationRuleError {
        return createValidationError(ValidationErrorCode.TOO_LARGE, {
            params: { max, value, exclusive },
            context,
        });
    },

    /**
     * 创建超出范围错误
     */
    out_of_range(
        min: number,
        max: number,
        value: any,
        context?: ValidationErrorContext
    ): ValidationRuleError {
        return createValidationError(ValidationErrorCode.OUT_OF_RANGE, {
            params: { min, max, value },
            context,
        });
    },

    /**
     * 创建格式无效错误
     */
    invalid_format(
        field: string,
        value: any,
        format: string,
        context?: ValidationErrorContext
    ): ValidationRuleError {
        return createValidationError(ValidationErrorCode.INVALID_FORMAT, {
            params: { field, value, format },
            context,
        });
    },

    /**
     * 创建模式不匹配错误
     */
    pattern_mismatch(
        pattern: string | RegExp,
        value: any,
        context?: ValidationErrorContext
    ): ValidationRuleError {
        return createValidationError(ValidationErrorCode.PATTERN_MISMATCH, {
            params: { pattern: pattern.toString(), value },
            context,
        });
    },

    /**
     * 创建不允许值错误
     */
    not_allowed(
        value: any,
        allowedValues: any[],
        context?: ValidationErrorContext
    ): ValidationRuleError {
        return createValidationError(ValidationErrorCode.NOT_ALLOWED, {
            params: { value, allowedValues },
            context,
        });
    },

    /**
     * 创建缺少字段错误
     */
    missing_field(field: string, context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.MISSING_FIELD, {
            params: { field },
            context,
        });
    },

    /**
     * 创建重复值错误
     */
    duplicate(field: string, value: any, context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.DUPLICATE, {
            params: { field, value },
            context,
        });
    },

    /**
     * 创建条件失败错误
     */
    condition_failed(
        field: string,
        condition: string,
        value: any,
        context?: ValidationErrorContext
    ): ValidationRuleError {
        return createValidationError(ValidationErrorCode.CONDITION_FAILED, {
            params: { field, condition, value },
            context,
        });
    },

    /**
     * 创建自定义错误
     */
    custom(
        customCode: string,
        message: string,
        context?: ValidationErrorContext
    ): ValidationRuleError {
        return createValidationError(ValidationErrorCode.CUSTOM, {
            params: { customCode, message },
            context,
        });
    },

    /**
     * 创建密码太短错误
     */
    password_too_short(
        minLength: number,
        actualLength: number,
        context?: ValidationErrorContext
    ): ValidationRuleError {
        return createValidationError(ValidationErrorCode.PASSWORD_TOO_SHORT, {
            params: { minLength, actualLength },
            context,
        });
    },

    /**
     * 创建缺少大写字母错误
     */
    password_missing_uppercase(context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.PASSWORD_MISSING_UPPERCASE, {
            params: {},
            context,
        });
    },

    /**
     * 创建缺少小写字母错误
     */
    password_missing_lowercase(context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.PASSWORD_MISSING_LOWERCASE, {
            params: {},
            context,
        });
    },

    /**
     * 创建缺少数字错误
     */
    password_missing_digit(context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.PASSWORD_MISSING_DIGIT, {
            params: {},
            context,
        });
    },

    /**
     * 创建缺少特殊字符错误
     */
    password_missing_special(context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.PASSWORD_MISSING_SPECIAL, {
            params: {},
            context,
        });
    },
};

/**
 * 抛出验证错误的辅助函数
 */
export function throwErrorIfAny(
    value: any,
    rule: any,
    errors: ValidationRuleError[],
    context?: any
): void {
    if (errors.length > 0) {
        throw new ValidationError('Validation failed', 'VALIDATION_FAILED', errors, {
            value,
            rule,
            context,
        });
    }
}

export function normalizeValidationResult(result: AnyValidationResult): ValidationResult {
    if(!result) return null;
    return Array.isArray(result) ? result : [result];
}