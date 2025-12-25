import {
    RuleObjectPropertiesOptions,
    ValidationErrorBuilder,
    ValidationErrorContext,
    ValidationResult,
    ValidatorFunction,
} from '../../../core';

/**
 * 验证额外属性
 *
 * 检查对象是否包含未在属性规则中定义的额外属性。
 *
 * @param value - 要验证的对象
 * @param properties - 已定义的属性规则映射
 * @param context - 验证上下文
 * @returns 验证结果，包含额外属性时返回错误，否则返回 null
 */
export function validateAdditionalProperties(
    value: any,
    properties: Record<string, ValidatorFunction | RuleObjectPropertiesOptions>,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 创建已允许属性的集合用于快速查找
    const allowedKeys = new Set(Object.keys(properties));

    // 遍历对象的所有属性
    for (const key of Object.keys(value)) {
        // 检查是否为未定义的额外属性
        if (!allowedKeys.has(key)) {
            // 构建属性路径用于错误报告
            const fieldPath = context && context.path ? `${context.path}.${key}` : key;
            // 返回不允许的额外属性错误
            return [
                ValidationErrorBuilder.not_allowed(key, Array.from(allowedKeys), {
                    ...context,
                    field: fieldPath,
                }),
            ];
        }
    }

    // 没有发现额外属性，验证通过
    return null;
}
