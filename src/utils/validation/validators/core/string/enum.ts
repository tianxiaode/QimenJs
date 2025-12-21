import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { StringRuleOptions } from '../../../rules';

/**
 * 检查字符串枚举值
 * 
 * 验证给定的字符串值是否在预定义的枚举值列表中。
 * 当规则中未指定 enum 属性时，跳过验证。
 * 
 * @param value - 需要验证的字符串值
 * @param rule - 字符串验证规则，应包含 enum 属性
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回错误对象
 */
export function checkStringEnum(
    value: string,
    rule: StringRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果规则中没有定义 enum 属性，则跳过枚举验证
    if (!rule.enum) return null;

    // 检查值是否在枚举值列表中
    if (!rule.enum.includes(value)) {
        // 值不在允许的枚举列表中，返回 not_allowed 错误
        return ValidationErrorBuilder.not_allowed(value, rule.enum as string[], context);
    }

    // 值在枚举列表中，验证通过
    return null;
}