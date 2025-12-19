// validators/number/type.ts
import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../core';
import { NumberRule } from '../../rules';

export function validateNumberType(
    value: any,
    _rule: NumberRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (value === null || value === undefined) return null;

    if (typeof value !== 'number') {
        return ValidationErrorBuilder.type_mismatch('number', typeof value, context);
    }

    if (!Number.isFinite(value)) {
        return ValidationErrorBuilder.invalid_value(value, context);
    }

    return null;
}
