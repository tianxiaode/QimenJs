import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../core';
import { ArrayRule } from '../../rules';

function isSameArray(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
}

export function validateArrayEnum(
    value: any,
    rule: ArrayRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (!Array.isArray(value)) return null;
    if (!rule.enum) return null;

    const allowed = rule.enum.some(item => isSameArray(item, value));

    if (!allowed) {
        return ValidationErrorBuilder.not_allowed(value, rule.enum as any[][], context);
    }

    return null;
}
