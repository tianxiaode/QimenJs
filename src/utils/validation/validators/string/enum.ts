import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../core';
import { StringRule } from '../../rules';

export function validateStringEnum(
    value: string,
    rule: StringRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (!rule.enum) return null;

    if (!rule.enum.includes(value)) {
        return ValidationErrorBuilder.not_allowed(value, rule.enum as string[], context);
    }

    return null;
}
