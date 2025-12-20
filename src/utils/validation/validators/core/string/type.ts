import { ValidationErrorContext, CheckResult, ValidationErrorBuilder } from '../../../core';
import { StringRule } from '../../../rules';

export function checkStringType(
    value: any,
    _rule: StringRule,
    context?: ValidationErrorContext
): CheckResult {
    if (value === null || value === undefined) return null;

    if (typeof value !== 'string') {
        return ValidationErrorBuilder.type_mismatch('string', typeof value, context);
    }

    return null;
}
