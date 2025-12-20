import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { DateRule } from '../../../rules';

export function checkDateRange(
    value: any,
    rule: DateRule,
    context?: ValidationErrorContext
): CheckResult {
    if (!(value instanceof Date) || isNaN(value.getTime())) return null;

    const time = value.getTime();

    if (rule.min && time < rule.min.getTime()) {
        return ValidationErrorBuilder.too_small(rule.min.getTime(), value, false, context);
    }

    if (rule.max && time > rule.max.getTime()) {
        return ValidationErrorBuilder.too_large(rule.max.getTime(), value, false, context);
    }

    return null;
}
