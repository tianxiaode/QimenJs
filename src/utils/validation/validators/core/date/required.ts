import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../../core';
import { DateRule } from '../../../rules';

export function validateDateRequired(
    value: any,
    rule: DateRule,
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
