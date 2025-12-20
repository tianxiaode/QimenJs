import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { BooleanRule } from '../../../rules';

export function checkBooleanType(
    value: any,
    _rule: BooleanRule,
    context?: ValidationErrorContext
): CheckResult {
    if (value === null || value === undefined) return null;

    if (typeof value !== 'boolean') {
        return ValidationErrorBuilder.type_mismatch('boolean', typeof value, context);
    }

    return null;
}
