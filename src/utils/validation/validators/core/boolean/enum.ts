import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { BooleanRule } from '../../../rules';

export function checkBooleanEnum(
    value: any,
    rule: BooleanRule,
    context?: ValidationErrorContext
): CheckResult {
    if (typeof value !== 'boolean') return null;
    if (!rule.enum) return null;

    if (!rule.enum.includes(value)) {
        return ValidationErrorBuilder.not_allowed(value, rule.enum as boolean[], context);
    }

    return null;
}
