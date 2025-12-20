import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { ObjectRule } from '../../../rules';

export function checkObjectRequired(
    value: any,
    rule: ObjectRule,
    context?: ValidationErrorContext
): CheckResult {
    if (!rule.required) return null;

    if (value === undefined) {
        return ValidationErrorBuilder.required(context);
    }

    if (value === null && rule.nullable !== true) {
        return ValidationErrorBuilder.required(context);
    }

    return null;
}
