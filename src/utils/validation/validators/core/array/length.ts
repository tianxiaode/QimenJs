import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../../core';
import { ArrayRule } from '../../../rules';

export function validateArrayLength(
    value: any,
    rule: ArrayRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (!Array.isArray(value)) return null;

    const length = value.length;

    if (rule.exactLength !== undefined && length !== rule.exactLength) {
        return ValidationErrorBuilder.invalid_value(rule.exactLength, context);
    }

    if (rule.minLength !== undefined && length < rule.minLength) {
        return ValidationErrorBuilder.too_small(rule.minLength, length, false, context);
    }

    if (rule.maxLength !== undefined && length > rule.maxLength) {
        return ValidationErrorBuilder.too_large(rule.maxLength, length, false, context);
    }

    if (rule.allowEmpty === false && length === 0) {
        return ValidationErrorBuilder.invalid_value('empty_array', context);
    }

    return null;
}
