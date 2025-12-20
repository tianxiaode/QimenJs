import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { ObjectRule } from '../../../rules';

export function checkObjectType(
    value: any,
    _rule: ObjectRule,
    context?: ValidationErrorContext
): CheckResult {
    if (value === null || value === undefined) return null;

    if (typeof value !== 'object' || Array.isArray(value)) {
        return ValidationErrorBuilder.type_mismatch('object', typeof value, context);
    }

    return null;
}
