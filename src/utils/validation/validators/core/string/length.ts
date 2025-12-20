import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { StringRule } from '../../../rules';

export function checkStringLength(
    value: string,
    rule: StringRule,
    context?: ValidationErrorContext
): CheckResult {
    if (rule.exactLength !== undefined && value.length !== rule.exactLength) {
        return ValidationErrorBuilder.invalid_value(rule.exactLength, context);
    }

    if (rule.minLength !== undefined && value.length < rule.minLength) {
        return ValidationErrorBuilder.too_small(rule.minLength, context);
    }

    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return ValidationErrorBuilder.too_large(rule.maxLength, context);
    }

    return null;
}
