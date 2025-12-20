import {
    smartCompare,
    ValidationErrorBuilder,
    ValidationErrorContext,
    ValidationResult,
} from '../../core';
import { ValidatorBase } from '../../core/ValidatorBase';
import { ContainsRule } from '../../rules';

export function validateContains(
    value: unknown,
    rule: ContainsRule,
    context: ValidationErrorContext = {}
): ValidationResult {
    const contains = rule.contains !== false;
    const strict = rule.strict ?? true;

    const collection = typeof rule.target === 'function' ? rule.target(context) : rule.target;

    if (!Array.isArray(collection)) {
        return [
            ValidationErrorBuilder.invalid_value('target', {
                ...context,
                expectedType: 'array',
            }),
        ];
    }

    const found = collection.some(item => {
        const result = smartCompare(value, item, strict);
        return result === 0;
    });

    if (contains && !found) {
        return [ValidationErrorBuilder.not_allowed(value, collection, context)];
    }

    if (!contains && found) {
        return [ValidationErrorBuilder.not_allowed(value, collection, context)];
    }

    return null;
}
export function validateUnique(
    values: readonly any[],
    _rule: {},
    context: ValidationErrorContext = {}
): ValidationResult {
    if (!Array.isArray(values)) {
        return [
            ValidationErrorBuilder.invalid_value('collection', {
                ...context,
                expectedType: 'array',
            }),
        ];
    }

    const seen = new Set<any>();

    for (const value of values) {
        if (seen.has(value)) {
            return [ValidationErrorBuilder.not_allowed(value, values, context)];
        }
        seen.add(value);
    }

    return null;
}

ValidatorBase.registerValidator('contains', validateContains);
ValidatorBase.registerValidator('unique', validateUnique);
