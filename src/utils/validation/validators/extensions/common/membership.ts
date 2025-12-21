import { ValidationErrorBuilder, ValidationErrorContext, ValidationResult, ValidatorBase } from '../../../core';
import { ContainsExtensionRuleOptions } from '../../../rules';
import { validateContains } from '../../common';

export function validateContainsExtension(
    value: unknown,
    rule: ContainsExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    const { minContains, maxContains, target } = rule;

    const baseResult = validateContains(value, rule, context);
    if (baseResult) {
        return baseResult;
    }

    // 获取目标集合
    const collection = typeof target === 'function' ? target(context) : target;

    if (!Array.isArray(collection)) {
        return [
            ValidationErrorBuilder.invalid_value('target', {
                ...context,
                expectedType: 'array',
            }),
        ];
    }

    // 计算数组中有多少元素在目标集合中
    const count = (value as any[]).filter(item =>
        collection.some(
            targetItem => targetItem === item // 使用严格相等比较，可根据需要调整为smartCompare
        )
    ).length;

    // 验证 minContains 约束
    if (minContains !== undefined && count < minContains) {
        return [
            ValidationErrorBuilder.invalid_value(value, {
                ...context,
                expected: `contains at least ${minContains} items from target`,
                actual: count,
            }),
        ];
    }

    // 验证 maxContains 约束
    if (maxContains !== undefined && count > maxContains) {
        return [
            ValidationErrorBuilder.invalid_value(value, {
                ...context,
                expected: `contains at most ${maxContains} items from target`,
                actual: count,
            }),
        ];
    }

    return null;
}


ValidatorBase.registerValidator('containsEx', validateContainsExtension)