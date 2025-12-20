import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { NumberRule } from '../../../rules';

export function checkNumberInteger(
    value: any,
    rule: NumberRule,
    context?: ValidationErrorContext
): CheckResult {
    if (!rule.integer) return null;
    if (value === null || value === undefined) return null;

    if (!Number.isInteger(value)) {
        return ValidationErrorBuilder.invalid_value(value, context);
    }

    return null;
}
