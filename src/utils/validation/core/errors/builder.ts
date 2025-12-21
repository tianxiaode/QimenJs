import { ValidationErrorCode } from './codes';
import { AnyValidationResult, ValidationErrorContext, ValidationResult, ValidationRuleError } from '../types';
import { ValidationError } from './ValidationError';

/**
 * 错误详情参数接口
 * 用于存储错误相关的附加信息
 */
interface ErrorParams {
    [key: string]: any;
}

/**
 * 创建验证错误的选项
 * 包含错误参数和上下文信息
 */
interface CreateErrorOptions {
    params?: ErrorParams;
    context?: ValidationErrorContext;
}

/**
 * 创建基础验证错误对象
 * 
 * @param code - 错误代码
 * @param options - 错误选项，包括参数和上下文
 * @returns 标准化的验证错误对象
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
 * 
 * 包含各种常见验证错误的创建函数，用于统一错误格式
 */
export const ValidationErrorBuilder = {
    /**
     * 创建必填验证错误
     * 当字段被标记为必需但未提供值时使用
     * 
     * @param context - 错误上下文信息
     * @returns 必填错误对象
     */
    required(context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.REQUIRED, {
            context,
        });
    },

    /**
     * 创建类型不匹配错误
     * 当值的类型与期望类型不匹配时使用
     * 
     * @param expectedType - 期望的类型
     * @param actualType - 实际的类型
     * @param context - 错误上下文信息
     * @returns 类型不匹配错误对象
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
     * 当值本身无效时使用（如 NaN、Infinity 等）
     * 
     * @param value - 无效的值
     * @param context - 错误上下文信息
     * @returns 无效值错误对象
     */
    invalid_value(value: any, context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.INVALID_VALUE, {
            params: { value },
            context,
        });
    },

    /**
     * 创建值过小错误
     * 当值小于最小允许值时使用
     * 
     * @param min - 最小允许值
     * @param value - 实际值
     * @param exclusive - 是否为排他比较（不包含边界值）
     * @param context - 错误上下文信息
     * @returns 值过小错误对象
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
     * 当值大于最大允许值时使用
     * 
     * @param max - 最大允许值
     * @param value - 实际值
     * @param exclusive - 是否为排他比较（不包含边界值）
     * @param context - 错误上下文信息
     * @returns 值过大错误对象
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
     * 当值不在指定范围内时使用
     * 
     * @param min - 最小允许值
     * @param max - 最大允许值
     * @param value - 实际值
     * @param context - 错误上下文信息
     * @returns 超出范围错误对象
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
     * 当值不符合指定格式时使用
     * 
     * @param field - 字段名称
     * @param value - 实际值
     * @param format - 期望的格式
     * @param context - 错误上下文信息
     * @returns 格式无效错误对象
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
     * 当值不匹配正则表达式模式时使用
     * 
     * @param pattern - 正则表达式模式
     * @param value - 实际值
     * @param context - 错误上下文信息
     * @returns 模式不匹配错误对象
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
     * 当值不在允许的值列表中时使用
     * 
     * @param value - 实际值
     * @param allowedValues - 允许的值列表
     * @param context - 错误上下文信息
     * @returns 不允许值错误对象
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
     * 当必需字段不存在时使用
     * 
     * @param field - 缺少的字段名称
     * @param context - 错误上下文信息
     * @returns 缺少字段错误对象
     */
    missing_field(field: string, context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.MISSING_FIELD, {
            params: { field },
            context,
        });
    },

    /**
     * 创建重复值错误
     * 当不允许重复值但出现重复时使用
     * 
     * @param field - 字段名称
     * @param value - 重复的值
     * @param context - 错误上下文信息
     * @returns 重复值错误对象
     */
    duplicate(field: string, value: any, context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.DUPLICATE, {
            params: { field, value },
            context,
        });
    },

    /**
     * 创建条件失败错误
     * 当条件验证失败时使用
     * 
     * @param field - 字段名称
     * @param condition - 条件描述
     * @param value - 实际值
     * @param context - 错误上下文信息
     * @returns 条件失败错误对象
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
     * 用于创建自定义验证错误
     * 
     * @param customCode - 自定义错误代码
     * @param message - 错误消息
     * @param context - 错误上下文信息
     * @returns 自定义错误对象
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
     * 当密码长度不足时使用
     * 
     * @param minLength - 最小长度要求
     * @param actualLength - 实际长度
     * @param context - 错误上下文信息
     * @returns 密码太短错误对象
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
     * 当密码缺少大写字母时使用
     * 
     * @param context - 错误上下文信息
     * @returns 缺少大写字母错误对象
     */
    password_missing_uppercase(context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.PASSWORD_MISSING_UPPERCASE, {
            params: {},
            context,
        });
    },

    /**
     * 创建缺少小写字母错误
     * 当密码缺少小写字母时使用
     * 
     * @param context - 错误上下文信息
     * @returns 缺少小写字母错误对象
     */
    password_missing_lowercase(context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.PASSWORD_MISSING_LOWERCASE, {
            params: {},
            context,
        });
    },

    /**
     * 创建缺少数字错误
     * 当密码缺少数字时使用
     * 
     * @param context - 错误上下文信息
     * @returns 缺少数字错误对象
     */
    password_missing_digit(context?: ValidationErrorContext): ValidationRuleError {
        return createValidationError(ValidationErrorCode.PASSWORD_MISSING_DIGIT, {
            params: {},
            context,
        });
    },

    /**
     * 创建缺少特殊字符错误
     * 当密码缺少特殊字符时使用
     * 
     * @param context - 错误上下文信息
     * @returns 缺少特殊字符错误对象
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
 * 当验证失败时抛出包含详细错误信息的异常
 * 
 * @param value - 被验证的值
 * @param rule - 验证规则
 * @param errors - 验证错误列表
 * @param context - 验证上下文
 * @throws ValidationError 包含所有验证错误的异常
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

/**
 * 规范化验证结果
 * 将不同类型的验证结果统一为标准格式
 * 
 * @param result - 原始验证结果（可能是单个错误或错误数组）
 * @returns 标准化后的验证结果（错误数组或null）
 */
export function normalizeValidationResult(result: AnyValidationResult): ValidationResult {
    if(!result) return null;
    return Array.isArray(result) ? result : [result];
}