import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { ArrayRuleOptions } from '../../../rules';

/**
 * 检查数组长度是否符合规则要求
 *
 * @param value - 需要验证的值
 * @param rule - 数组规则选项，包含长度限制条件
 * @param context - 验证错误上下文信息
 * @returns 检查结果，如果验证失败返回错误信息，否则返回null
 */
export function checkArrayLength(
    value: any,
    rule: ArrayRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果值不是数组类型，则跳过验证
    if (!Array.isArray(value)) return null;

    // 获取数组的实际长度
    const length = value.length;

    // exactLength：检查数组长度是否等于指定的确切长度
    if (rule.exactLength !== undefined) {
        return length === rule.exactLength
            ? null
            : ValidationErrorBuilder.invalid_value(rule.exactLength, context);
    }

    // minLength：检查数组长度是否小于最小长度要求（当未设置exactLength时）
    if (rule.minLength !== undefined && length < rule.minLength) {
        return ValidationErrorBuilder.too_small(rule.minLength, length, false, context);
    }

    // maxLength：检查数组长度是否超过最大长度限制（当未设置exactLength时）
    if (rule.maxLength !== undefined && length > rule.maxLength) {
        return ValidationErrorBuilder.too_large(rule.maxLength, length, false, context);
    }

    // allowEmpty：检查是否允许空数组（当明确设置为false且数组为空时返回错误）
    if (rule.allowEmpty === false && length === 0) {
        return ValidationErrorBuilder.invalid_value('empty_array', context);
    }

    // 所有长度检查都通过
    return null;
}
