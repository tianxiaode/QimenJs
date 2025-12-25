import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { BooleanRuleOptions } from '../../../rules';

/**
 * 检查布尔值枚举
 * 
 * 验证给定的布尔值是否在预定义的枚举值列表中。
 * 仅当值确实是布尔类型且规则中定义了 enum 属性时才执行验证。
 * 
 * @param value - 需要验证的值
 * @param rule - 布尔值验证规则，应包含 enum 属性
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回错误对象
 */
export function checkBooleanEnum(
    value: any,
    rule: BooleanRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果值不是布尔类型，则跳过枚举验证
    // 非布尔值应该由类型验证器处理
    if (typeof value !== 'boolean') return null;
    
    // 如果规则中没有定义 enum 属性，则跳过枚举验证
    if (!rule.enum) return null;

    // 检查布尔值是否在枚举值列表中
    if (!rule.enum.includes(value)) {
        // 值不在允许的枚举列表中，返回 not_allowed 错误
        return ValidationErrorBuilder.not_allowed(value, rule.enum as boolean[], context);
    }

    // 值在枚举列表中，验证通过
    return null;
}