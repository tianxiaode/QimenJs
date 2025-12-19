import { ArrayRule } from '../../rules';
import { ValidationErrorContext, InternalValidate, ValidatorResult } from '../../core';

export function validateArrayItems(
    value: any,
    rule: ArrayRule,
    validate: InternalValidate,
    context?: ValidationErrorContext
): ValidatorResult {
    if (!Array.isArray(value)) return null;
    if (!rule.items) return null;

    for (let i = 0; i < value.length; i++) {
        const itemValue = value[i];
        const itemPath = context?.path ? `${context?.path}[${i}]` : `[${i}]`;

        const result = validate(itemValue, rule.items, {
            ...context,
            path: itemPath,
            parent: value,
        });

        if (!result.valid && result.errors?.length) {
            return result.errors[0];
        }
    }

    return null;
}
