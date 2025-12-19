import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../../core';
import { NumberRule } from '../../../rules';

export function validateNumberInteger(
    value: any,
    rule: NumberRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (!rule.integer) return null;
    if (value === null || value === undefined) return null;

    if (!Number.isInteger(value)) {
        return ValidationErrorBuilder.invalid_value(value, context);
    }

    return null;
}
