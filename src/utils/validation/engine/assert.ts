import {
    ValidationErrorContext,
    Validator,
    ValidationError,
    ValidationErrorBuilder,
} from '../core';

/**
 * 验证断言函数
 *
 * 执行验证并根据结果抛出 ValidationError 异常
 * 如果验证通过，则不返回任何内容
 * 如果验证失败，则抛出包含所有错误信息的 ValidationError
 *
 * @param value - 需要验证的值
 * @param rule - 验证规则
 * @param context - 验证上下文信息
 */
export function assertValidation(value: any, rule: any, context: ValidationErrorContext = {}) {
    // 执行验证器，获取验证结果
    const result = Validator.executeValidator(value, rule, context);

    // 如果有验证错误，抛出异常
    if (result && result.length > 0) {
        ValidationErrorBuilder.throwIfAny(value, rule, result, context);
    }
    return null;
}
