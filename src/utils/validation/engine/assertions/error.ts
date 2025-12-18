import { ValidationError, ValidationRuleError } from "../../core";

export function createError(value: any, rule: any, errors: ValidationRuleError[], context?: any) {
    if (errors.length > 0) {
        throw new ValidationError('Validation failed', 'VALIDATION_FAILED', errors, {
            value,
            rule,
            context
        });
    }
}
