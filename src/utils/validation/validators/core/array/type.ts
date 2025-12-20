import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { ArrayRule } from '../../../rules';

export function checkArrayType(
    value: any,
    _rule: ArrayRule,
    context?: ValidationErrorContext
): CheckResult {
    if (value === null || value === undefined) return null;

    if (!Array.isArray(value)) {
        return ValidationErrorBuilder.type_mismatch('array', typeof value, context);
    }

    return null;
}
