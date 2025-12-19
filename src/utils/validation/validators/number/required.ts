// validators/number/required.ts
import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../core';
import { NumberRule } from '../../rules';

export function validateNumberRequired(
    value: any,
    rule: NumberRule,
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
