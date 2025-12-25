import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { NumberRuleOptions } from '../../../rules';

/**
 * 检查值是否为有效数字类型
 * 
 * 验证给定值是否为有效的数字类型。验证包括：
 * 1. 类型检查 - 确保值是 number 类型
 * 2. 有效性检查 - 确保值是有限数字（排除 NaN 和 Infinity）
 * 
 * null 和 undefined 值会被跳过，因为它们应该由存在性验证器处理。
 * 
 * @param value - 需要验证的值
 * @param _rule - 数字验证规则（此验证器不使用规则配置）
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回类型不匹配或无效值错误对象
 */
export function checkNumberType(
    value: any,
    _rule: NumberRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果值为 null 或 undefined，跳过类型验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return null;

    // 检查值是否为 number 类型
    if (typeof value !== 'number') {
        // 值不是 number 类型，返回类型不匹配错误
        return ValidationErrorBuilder.type_mismatch('number', typeof value, context);
    }

    // 检查数字是否为有限值，排除 NaN 和 Infinity/-Infinity
    if (!Number.isFinite(value)) {
        // 值不是有限数字，返回无效值错误
        return ValidationErrorBuilder.invalid_value(value, context);
    }

    // 值是有效的数字类型，验证通过
    return null;
}