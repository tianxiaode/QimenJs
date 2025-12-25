import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { NumberRuleOptions } from '../../../rules';

/**
 * 检查数字范围
 * 
 * 验证给定的数字值是否在指定的范围内。支持以下四种范围限制：
 * 1. 最小值 (min) - 包含边界值
 * 2. 最大值 (max) - 包含边界值
 * 3. 排他最小值 (exclusiveMin) - 不包含边界值
 * 4. 排他最大值 (exclusiveMax) - 不包含边界值
 * 
 * null 和 undefined 值会被跳过，因为它们应该由存在性验证器处理。
 * 
 * @param value - 需要验证的数字值
 * @param rule - 数字范围验证规则
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回相应的错误对象
 */
export function checkNumberRange(
    value: any,
    rule: NumberRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果值为 null 或 undefined，跳过范围验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return null;

    // 检查最小值限制（包含边界值）
    if (rule.min !== undefined && value < rule.min) {
        // 值小于最小允许值，返回 too_small 错误
        return ValidationErrorBuilder.too_small(rule.min, value, false, context);
    }

    // 检查排他最小值限制（不包含边界值）
    if (rule.exclusiveMin !== undefined && value <= rule.exclusiveMin) {
        // 值小于或等于排他最小值，返回 too_small 错误，标记为排他比较
        return ValidationErrorBuilder.too_small(rule.exclusiveMin, value, true, context);
    }

    // 检查最大值限制（包含边界值）
    if (rule.max !== undefined && value > rule.max) {
        // 值大于最大允许值，返回 too_large 错误
        return ValidationErrorBuilder.too_large(rule.max, value, false, context);
    }

    // 检查排他最大值限制（不包含边界值）
    if (rule.exclusiveMax !== undefined && value >= rule.exclusiveMax) {
        // 值大于或等于排他最大值，返回 too_large 错误，标记为排他比较
        return ValidationErrorBuilder.too_large(rule.exclusiveMax, value, true, context);
    }

    // 值在所有指定范围内，验证通过
    return null;
}