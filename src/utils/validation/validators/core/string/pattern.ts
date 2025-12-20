import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { StringRule } from '../../../rules';

export function checkStringPattern(
    value: string,
    rule: StringRule,
    context?: ValidationErrorContext
): CheckResult {
    if (!rule.pattern) return null;

    if (!rule.pattern.test(value)) {
        return ValidationErrorBuilder.pattern_mismatch(rule.pattern.source, context);
    }

    return null;
}
