import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { ObjectRuleOptions } from '../../../rules';

/**
 * 检查值是否为对象类型
 * 
 * 验证给定值是否为纯对象类型。对于 null 和 undefined 值会直接通过验证，
 * 因为它们通常由专门的存在性验证器处理。同时排除数组类型，因为数组
 * 虽然在 JavaScript 中也是对象，但在这里被视为不同的数据类型。
 * 
 * @param value - 需要验证的值
 * @param _rule - 对象验证规则（此验证器不使用规则配置）
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回类型不匹配错误对象
 */
export function checkObjectType(
    value: any,
    _rule: ObjectRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果值为 null 或 undefined，直接通过类型验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return null;

    // 检查值是否为对象类型，并且不是数组
    // typeof value !== 'object' - 确保值是对象类型（排除基本类型）
    // Array.isArray(value) - 排除数组类型，数组虽然是对象但在此被视为独立类型
    if (typeof value !== 'object' || Array.isArray(value)) {
        // 值不是纯对象类型，返回类型不匹配错误
        // 错误信息包含期望的类型('object')和实际的类型
        return ValidationErrorBuilder.type_mismatch('object', typeof value, context);
    }

    // 值是纯对象类型，验证通过
    return null;
}