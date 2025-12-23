import {
    CheckResult,
    isEmptyValue,
    RulePresenceOptions,
    ValidationErrorBuilder,
    ValidationErrorContext,
} from '../../../core';

/**
 * 检查值的存在性规则
 * 
 * 用于验证值是否符合指定的存在性要求，包括：
 * - required: 值是否必需（不能为 undefined）
 * - nullable: 是否允许为 null
 * - empty: 是否允许为空值（如空字符串、空数组等）
 * 
 * @param value - 需要验证的值
 * @param rule - 存在性规则配置选项
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回错误对象
 */
export function checkPresence(
    value: any,
    rule: RulePresenceOptions,
    context: ValidationErrorContext = {}
): CheckResult {
    // 检查 required 规则：如果值为 undefined 且规则要求必需，则返回 required 错误
    if (rule.required && value === undefined) {
        return ValidationErrorBuilder.required(context);
    }

    // 检查 nullable 规则：如果值为 null 且规则不允许为 null，则返回 invalid_value 错误
    if (value === null && rule.nullable === false) {
        return ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'non-null',
        });
    }

    // 检查 empty 规则：如果值为空值且规则不允许为空，则返回 invalid_value 错误
    // isEmptyValue 函数用于判断值是否为空（如空字符串、空数组、空对象等）
    if (rule.empty === false && isEmptyValue(value)) {
        return ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'non-empty',
        });
    }

    // 所有存在性检查都通过，返回 null 表示验证成功
    return null;
}