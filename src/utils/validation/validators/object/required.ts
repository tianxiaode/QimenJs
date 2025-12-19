import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../core';
import { ObjectRule } from '../../rules';

export function validateObjectRequired(
    value: any,
    rule: ObjectRule,
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
