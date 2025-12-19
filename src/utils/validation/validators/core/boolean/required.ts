import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../../core';
import { BooleanRule } from '../../../rules';

export function validateBooleanRequired(
    value: any,
    rule: BooleanRule,
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
