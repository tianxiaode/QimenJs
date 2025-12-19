import {
    ValidationErrorContext,
    ValidatorResult,
    ValidationErrorCode,
    ValidationErrorBuilder,
} from '../../core';
import { StringRule } from '../../rules';

export function validateStringType(
    value: any,
    _rule: StringRule,
    context?: ValidationErrorContext
): ValidatorResult {
    if (value === null || value === undefined) return null;

    if (typeof value !== 'string') {
        return ValidationErrorBuilder.type_mismatch('string', typeof value, context);
    }

    return null;
}
