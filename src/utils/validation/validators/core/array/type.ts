import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../../core';
import { ArrayRule } from '../../../rules';

export function validateArrayType(
    value: any,
    _rule: ArrayRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (value === null || value === undefined) return null;

    if (!Array.isArray(value)) {
        return ValidationErrorBuilder.type_mismatch('array', typeof value, context);
    }

    return null;
}
