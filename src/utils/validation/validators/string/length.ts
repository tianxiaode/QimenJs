import { createError, ValidationErrorCode, ValidatorResult } from '../../core';
import { StringRule } from '../../rules';

export function validateStringLength(
    value: string,
    rule: StringRule,
    path?: string
): ValidatorResult {
    if (rule.exactLength !== undefined && value.length !== rule.exactLength) {
        return createError(ValidationErrorCode.INVALID_VALUE, {
            params: { exactLength: rule.exactLength },
            path,
        });
    }

    if (rule.minLength !== undefined && value.length < rule.minLength) {
        return createError(ValidationErrorCode.TOO_SMALL, {
            params: { minLength: rule.minLength },
            path,
        });
    }

    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return createError(ValidationErrorCode.TOO_LARGE, {
            params: { maxLength: rule.maxLength },
            path,
        });
    }

    return null;
}
