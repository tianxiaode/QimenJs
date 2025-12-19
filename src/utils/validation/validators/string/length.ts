import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../core';
import { StringRule } from '../../rules';

export function validateStringLength(
    value: string,
    rule: StringRule,
    context?: ValidationErrorContext
): ValidatorResult {
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
