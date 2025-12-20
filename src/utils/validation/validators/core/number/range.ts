import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { NumberRule } from '../../../rules';

export function checkNumberRange(
    value: any,
    rule: NumberRule,
    context?: ValidationErrorContext
): CheckResult {
    if (value === null || value === undefined) return null;

    if (rule.min !== undefined && value < rule.min) {
        return ValidationErrorBuilder.too_small(rule.min, value, false, context);
    }

    if (rule.exclusiveMin !== undefined && value <= rule.exclusiveMin) {
        return ValidationErrorBuilder.too_small(rule.exclusiveMin, value, true, context);
    }

    if (rule.max !== undefined && value > rule.max) {
        return ValidationErrorBuilder.too_large(rule.max, value, false, context);
    }

    if (rule.exclusiveMax !== undefined && value >= rule.exclusiveMax) {
        return ValidationErrorBuilder.too_small(rule.exclusiveMax, value, true, context);
    }

    return null;
}
