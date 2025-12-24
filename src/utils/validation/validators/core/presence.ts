import {
    CheckResult,
    isEmptyValue,
    PresenceRule,
    ValidationErrorBuilder,
    ValidationErrorContext,
} from '../../core';

export function checkPresence(
    value: any,
    rule: PresenceRule,
    context: ValidationErrorContext = {}
): CheckResult {
    // required：不允许 undefined
    if (rule.required && value === undefined) {
        return ValidationErrorBuilder.required(context);
    }

    // nullable：不允许 null
    if (value === null && rule.nullable === false) {
        return ValidationErrorBuilder.null_value(value, context);
    }

    // empty：不允许空值
    if (rule.empty === false && isEmptyValue(value)) {
        return ValidationErrorBuilder.not_empty(value, context);
    }

    return null;
}