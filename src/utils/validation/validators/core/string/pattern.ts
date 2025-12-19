import {
    ValidationErrorBuilder,
    ValidationErrorContext,
    ValidatorResult,
} from '../../../core';
import { StringRule } from '../../../rules';

export function validateStringPattern(
    value: string,
    rule: StringRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (!rule.pattern) return null;

    if (!rule.pattern.test(value)) {
        return ValidationErrorBuilder.pattern_mismatch(rule.pattern.source, context);
    }

    return null;
}
