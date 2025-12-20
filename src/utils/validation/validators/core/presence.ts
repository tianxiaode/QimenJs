import {
    CheckResult,
    isEmptyValue,
    PresenceOptions,
    ValidationErrorBuilder,
    ValidationErrorContext,
} from '../../core';

export function checkPresence(
    value: any,
    rule: PresenceOptions,
    context: ValidationErrorContext = {}
): CheckResult {
    // required：不允许 undefined
    if (rule.required && value === undefined) {
        return ValidationErrorBuilder.required(context);
    }

    // nullable：不允许 null
    if (value === null && rule.nullable === false) {
        return ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'non-null',
        });
    }

    // empty：不允许空值
    if (rule.empty === false && isEmptyValue(value)) {
        return ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'non-empty',
        });
    }

    return null;
}
