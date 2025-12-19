import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../core';
import { DateRule } from '../../rules';

export function validateDateType(
    value: any,
    _rule: DateRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (value === null || value === undefined) return null;

    if (!(value instanceof Date) || isNaN(value.getTime())) {
        return ValidationErrorBuilder.type_mismatch('Date', typeof value, context);
    }

    return null;
}
