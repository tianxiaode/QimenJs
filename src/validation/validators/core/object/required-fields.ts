import { ObjectRuleOptions } from '../../../rules';
import { CheckResult, ValidationErrorBuilder, ValidationErrorContext } from '../../../core';

/**
 * 验证对象必需字段
 *
 * 检查对象是否包含所有必需的字段。
 *
 * @param value - 要验证的对象
 * @param rule - 规则对象，包含 requiredFields 属性
 * @param context - 验证上下文
 * @returns 验证结果，缺少字段时返回错误，否则返回 null
 */
export function checkRequiredFields(
    value: any,
    rule: ObjectRuleOptions,
    context: ValidationErrorContext = {}
): CheckResult {
    // 遍历所有必需字段
    const requiredFields = rule.requiredFields || [];
    for (const key of requiredFields) {
        // 检查字段是否存在（即使是 undefined 值也算存在）
        if (!(key in value)) {
            // 构建字段路径用于错误报告
            const fieldPath = context && context.path ? `${context.path}.${key}` : key;
            // 返回缺少字段错误
            return ValidationErrorBuilder.missing_field(key, { ...context, field: fieldPath });
        }
    }

    return null;
}
