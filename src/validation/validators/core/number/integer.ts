import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { NumberRuleOptions } from '../../../rules';

/**
 * 检查数字是否为整数
 * 
 * 验证给定的数字值是否为整数。只有当规则中明确要求整数(integer=true)时才会执行验证。
 * null 和 undefined 值会被跳过，因为它们应该由存在性验证器处理。
 * 
 * @param value - 需要验证的数字值
 * @param rule - 数字验证规则，应包含 integer 属性
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回错误对象
 */
export function checkNumberInteger(
    value: any,
    rule: NumberRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果规则中没有要求整数，则跳过整数验证
    if (!rule.integer) return null;
    
    // 使用 Number.isInteger 检查值是否为整数
    if (!Number.isInteger(value)) {
        // 值不是整数，返回 invalid_value 错误
        return ValidationErrorBuilder.invalid_value(value, context);
    }

    // 值是整数，验证通过
    return null;
}