import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../../core';
import { ObjectRule } from '../../../rules';

export function validateObjectAdditionalProperties(
    value: any,
    rule: ObjectRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (typeof value !== 'object' || value === null) return null;
    if (rule.additionalProperties !== false) return null;
    if (!rule.properties) return null;

    const allowedKeys = new Set(Object.keys(rule.properties));

    for (const key of Object.keys(value)) {
        if (!allowedKeys.has(key)) {
            const fieldPath = context && context.path ? `${context.path}.${key}` : key;
            return ValidationErrorBuilder.not_allowed(key, Array.from(allowedKeys), {
                ...context,
                field: fieldPath,
            });
        }
    }

    return null;
}
