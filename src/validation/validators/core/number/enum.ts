import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { NumberRuleOptions } from '../../../rules';

/**
 * 检查数字枚举值
 *
 * 验证给定的数字值是否在预定义的枚举值列表中。
 * 当规则中未指定 enum 属性时，跳过验证。
 * null 和 undefined 值会被跳过，因为它们应该由存在性验证器处理。
 *
 * @param value - 需要验证的数字值
 * @param rule - 数字验证规则，应包含 enum 属性
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回错误对象
 */
export function checkNumberEnum(
    value: any,
    rule: NumberRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果规则中没有定义 enum 属性，则跳过枚举验证
    if (!rule.enum) return null;

    // 如果值为 null 或 undefined，跳过枚举验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return null;

    // 检查值是否在枚举值列表中
    if (!rule.enum.includes(value)) {
        // 值不在允许的枚举列表中，返回 not_allowed 错误
        return ValidationErrorBuilder.not_allowed(value, rule.enum as number[], context);
    }

    // 值在枚举列表中，验证通过
    return null;
}
