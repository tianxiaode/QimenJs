import {
    smartCompare,
    ValidationErrorContext,
    ValidationResult,
    ValidationErrorBuilder,
} from '../../core';
import { CompareRule } from '../../rules';

export type CompareOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';

export function validateCompare(
    value: unknown,
    rule: CompareRule,
    context: ValidationErrorContext = {}
): ValidationResult {
    const strict = rule.strict ?? true;

    // 1. 解析 target
    let targetValue = typeof rule.target === 'function' ? rule.target(context) : rule.target;

    // 2. 执行比较
    const result = smartCompare(value, targetValue, strict);

    if (Number.isNaN(result)) {
        return [
            ValidationErrorBuilder.invalid_value('target', {
                ...context,
                expectedType: 'comparable value',
            }),
        ];
    }

    // 3. 判断是否通过
    const pass =
        (rule.operator === 'eq' && result === 0) ||
        (rule.operator === 'neq' && result !== 0) ||
        (rule.operator === 'gt' && result > 0) ||
        (rule.operator === 'gte' && result >= 0) ||
        (rule.operator === 'lt' && result < 0) ||
        (rule.operator === 'lte' && result <= 0);

    if (!pass) {
        return [
            ValidationErrorBuilder.condition_failed(context?.field ?? '', rule.operator, {
                value,
                target: targetValue,
                operator: rule.operator,
            }),
        ];
    }

    return null;
}
