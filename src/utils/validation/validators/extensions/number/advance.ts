import { ValidationErrorBuilder, ValidatorResult } from '../../../core';
import { validateNumber } from '../../core/number';
import { NumberAdvanceRule } from '../../../rules';
import { numberPredicates } from './predicates';

export function validateNumberAdvance(
    value: any,
    rule: NumberAdvanceRule,
    context?: any
): ValidatorResult {
    // 1️⃣ 基础 number 校验
    const error = validateNumber(value, { ...rule, required: true, nullable: false }, context);
    if (error && error.length > 0) return error[0];

    const num = value as number;

    // 2️⃣ 属性型谓词校验
    for (const key in numberPredicates) {
        const expected = rule[key as keyof typeof numberPredicates];
        if (!expected) continue;

        const predicate = numberPredicates[key as keyof typeof numberPredicates];
        if (!predicate(num)) {
            return ValidationErrorBuilder.invalid_value(num, {
                ...context,
                expected: key,
            });
        }
    }

    // 3️⃣ 白名单
    if (rule.allowsValues && !rule.allowsValues.includes(num)) {
        return ValidationErrorBuilder.invalid_value(num, {
            ...context,
            expected: 'allowed values',
        });
    }

    // 4️⃣ 黑名单
    if (rule.disallowsValues && rule.disallowsValues.includes(num)) {
        return ValidationErrorBuilder.invalid_value(num, {
            ...context,
            expected: 'disallowed values',
        });
    }

    return null;
}
