import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { NumberRule } from '../../../rules';

export function checkNumberType(
    value: any,
    _rule: NumberRule,
    context?: ValidationErrorContext
): CheckResult {
    if (value === null || value === undefined) return null;

    if (typeof value !== 'number') {
        return ValidationErrorBuilder.type_mismatch('number', typeof value, context);
    }

    if (!Number.isFinite(value)) {
        return ValidationErrorBuilder.invalid_value(value, context);
    }

    return null;
}
