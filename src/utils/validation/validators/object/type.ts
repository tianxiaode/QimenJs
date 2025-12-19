import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../core';
import { ObjectRule } from '../../rules';

export function validateObjectType(
    value: any,
    _rule: ObjectRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (value === null || value === undefined) return null;

    if (typeof value !== 'object' || Array.isArray(value)) {
        return ValidationErrorBuilder.type_mismatch('object', typeof value, context);
    }

    return null;
}
