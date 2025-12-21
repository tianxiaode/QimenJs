import { ValidationErrorContext, CheckResult, ValidationErrorBuilder } from '../../../core';
import { StringRuleOptions } from '../../../rules';

/**
 * 检查值是否为字符串类型
 * 
 * 验证给定值是否为字符串类型。对于 null 和 undefined 值会直接通过验证，
 * 因为它们通常由专门的存在性验证器处理。
 * 
 * @param value - 需要验证的值
 * @param _rule - 字符串验证规则（此验证器不使用规则配置）
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回类型不匹配错误对象
 */
export function checkStringType(
    value: any,
    _rule: StringRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果值为 null 或 undefined，直接通过类型验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return null;

    // 检查值是否为字符串类型
    if (typeof value !== 'string') {
        // 值不是字符串类型，返回类型不匹配错误
        // 错误信息包含期望的类型('string')和实际的类型
        return ValidationErrorBuilder.type_mismatch('string', typeof value, context);
    }

    // 值是字符串类型，验证通过
    return null;
}