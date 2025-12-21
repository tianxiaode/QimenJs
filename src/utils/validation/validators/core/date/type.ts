import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { DateRuleOptions } from '../../../rules';

/**
 * 检查值是否为有效日期类型
 * 
 * 验证给定值是否为有效的日期对象。验证包括：
 * 1. 类型检查 - 确保值是 Date 实例
 * 2. 有效性检查 - 确保日期是有效日期（排除 Invalid Date）
 * 
 * null 和 undefined 值会被跳过，因为它们应该由存在性验证器处理。
 * 
 * @param value - 需要验证的值
 * @param _rule - 日期验证规则（此验证器不使用规则配置）
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回类型不匹配错误对象
 */
export function checkDateType(
    value: any,
    _rule: DateRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果值为 null 或 undefined，跳过类型验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return null;

    // 检查值是否为 Date 实例并且是有效日期
    // 1. value instanceof Date - 确保是 Date 对象实例
    // 2. isNaN(value.getTime()) - 检查日期是否有效，Invalid Date 的 getTime() 返回 NaN
    if (!(value instanceof Date) || isNaN(value.getTime())) {
        // 值不是有效的 Date 对象，返回类型不匹配错误
        return ValidationErrorBuilder.type_mismatch('Date', typeof value, context);
    }

    // 值是有效的日期类型，验证通过
    return null;
}