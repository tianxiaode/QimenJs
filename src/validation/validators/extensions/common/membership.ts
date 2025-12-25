import { ValidationErrorBuilder, ValidationErrorContext, ValidationResult, Validator } from '../../../core';
import { ContainsExtensionRuleOptions } from '../../../rules';
import { validateContains } from '../../common';

/**
 * 扩展的包含验证器
 * 验证数组中包含目标集合中元素的数量是否在指定范围内
 * 
 * @param value - 待验证的值（应为数组）
 * @param rule - 验证规则选项，包含目标集合和数量限制
 * @param context - 验证错误上下文
 * @returns 验证结果，验证通过返回null，否则返回错误数组
 */
export function validateContainsExtension(
    value: unknown,
    rule: ContainsExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    const { minContains, maxContains, target } = rule;

    // 首先执行基础的包含验证
    const baseResult = validateContains(value, rule, context);
    if (baseResult) {
        return baseResult;
    }

    // 获取目标集合，支持函数形式动态获取
    const collection = typeof target === 'function' ? target(context) : target;

    // 验证目标集合是否为数组
    if (!Array.isArray(collection)) {
        return [
            ValidationErrorBuilder.invalid_value('target', {
                ...context,
                expectedType: 'array',
            }),
        ];
    }

    // 计算当前数组中有多少元素存在于目标集合中
    const count = (value as any[]).filter(item =>
        collection.some(
            targetItem => targetItem === item // 使用严格相等比较，可根据需要调整为smartCompare
        )
    ).length;

    // 验证最小包含数量约束
    if (minContains !== undefined && count < minContains) {
        return [
            ValidationErrorBuilder.invalid_value(value, {
                ...context,
                expected: `contains at least ${minContains} items from target`,
                actual: count,
            }),
        ];
    }

    // 验证最大包含数量约束
    if (maxContains !== undefined && count > maxContains) {
        return [
            ValidationErrorBuilder.invalid_value(value, {
                ...context,
                expected: `contains at most ${maxContains} items from target`,
                actual: count,
            }),
        ];
    }

    // 验证通过
    return null;
}

// 注册验证器，使用'containsEx'作为验证器名称
Validator.registerValidator('containsEx', validateContainsExtension)