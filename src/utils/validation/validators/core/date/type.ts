import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { DateRule } from '../../../rules';

export function checkDateType(
    value: any,
    _rule: DateRule,
    context?: ValidationErrorContext
): CheckResult {
    if (value === null || value === undefined) return null;

    if (!(value instanceof Date) || isNaN(value.getTime())) {
        return ValidationErrorBuilder.type_mismatch('Date', typeof value, context);
    }

    return null;
}
