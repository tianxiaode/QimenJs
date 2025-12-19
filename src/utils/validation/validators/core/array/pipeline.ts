import { ValidationErrorContext, ValidationRuleError } from '../../../core';
import { ArrayRule } from '../../../rules';
import { InternalValidate } from '../../../core/internal';
import { validateArrayRequired } from './required';
import { validateArrayType } from './type';
import { validateArrayLength } from './length';
import { validateArrayEnum } from './enum';
import { validateArrayItems } from './items';

export function validateArray(
    value: any,
    rule: ArrayRule,
    context: ValidationErrorContext = {},
    validate: InternalValidate,
): ValidationRuleError[] | null {
    const errors: ValidationRuleError[] = [];

    const validators = [
        validateArrayRequired,
        validateArrayType,
        validateArrayLength,
        validateArrayEnum,
        (v: any, r: ArrayRule, p: ValidationErrorContext) => validateArrayItems(v, r, p, validate),
    ];

    for (const validator of validators) {
        const error = validator(value, rule, context as any);
        if (error) {
            errors.push(error);
            break;
        }
    }

    return errors.length > 0? errors : null;
}
