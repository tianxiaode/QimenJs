import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../core';
import { ArrayRule } from '../../rules';

export function validateArrayRequired(
    value: any,
    rule: ArrayRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (!rule.required) return null;

    if (value === undefined) {
        return ValidationErrorBuilder.required(context);
    }

    if (value === null && rule.nullable !== true) {
        return ValidationErrorBuilder.required(context);
    }

    return null;
}
