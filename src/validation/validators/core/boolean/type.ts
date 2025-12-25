import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { BooleanRuleOptions } from '../../../rules';

/**
 * 检查值是否为布尔类型
 * 
 * 验证给定值是否为布尔类型（true 或 false）。
 * null 和 undefined 值会被跳过，因为它们应该由存在性验证器处理。
 * 
 * @param value - 需要验证的值
 * @param _rule - 布尔值验证规则（此验证器不使用规则配置）
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回类型不匹配错误对象
 */
export function checkBooleanType(
    value: any,
    _rule: BooleanRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果值为 null 或 undefined，跳过类型验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return null;

    // 检查值是否为布尔类型
    if (typeof value !== 'boolean') {
        // 值不是布尔类型，返回类型不匹配错误
        return ValidationErrorBuilder.type_mismatch('boolean', typeof value, context);
    }

    // 值是布尔类型，验证通过
    return null;
}