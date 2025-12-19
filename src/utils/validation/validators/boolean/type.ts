import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../core';
import { BooleanRule } from '../../rules';

export function validateBooleanType(
    value: any,
    _rule: BooleanRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (value === null || value === undefined) return null;

    if (typeof value !== 'boolean') {
        return ValidationErrorBuilder.type_mismatch('boolean', typeof value, context);
    }

    return null;
}
