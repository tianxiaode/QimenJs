import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { NumberRule } from '../../../rules';

export function checkNumberEnum(
    value: any,
    rule: NumberRule,
    context?: ValidationErrorContext
): CheckResult {
    if (!rule.enum) return null;
    if (value === null || value === undefined) return null;

    if (!rule.enum.includes(value)) {
        return ValidationErrorBuilder.not_allowed(value, rule.enum as number[], context);
    }

    return null;
}
