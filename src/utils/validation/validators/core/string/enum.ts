import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { StringRule } from '../../../rules';

export function checkStringEnum(
    value: string,
    rule: StringRule,
    context?: ValidationErrorContext
): CheckResult {
    if (!rule.enum) return null;

    if (!rule.enum.includes(value)) {
        return ValidationErrorBuilder.not_allowed(value, rule.enum as string[], context);
    }

    return null;
}
