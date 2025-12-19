import { ValidationErrorContext, ValidationRuleError } from '../../core';
import { ArrayRule } from '../../rules';
import { InternalValidate } from '../../core/internal';
import { validateArrayRequired } from './required';
import { validateArrayType } from './type';
import { validateArrayLength } from './length';
import { validateArrayEnum } from './enum';
import { validateArrayItems } from './items';

export function validateArray(
    value: any,
    rule: ArrayRule,
    validate: InternalValidate,
    context?: ValidationErrorContext
): ValidationRuleError[] {
    const errors: ValidationRuleError[] = [];

    const validators = [
        validateArrayRequired,
        validateArrayType,
        validateArrayLength,
        validateArrayEnum,
        (v: any, r: ArrayRule, p: ValidationErrorContext) => validateArrayItems(v, r, validate, p),
    ];

    for (const validator of validators) {
        const error = validator(value, rule, context as any);
        if (error) {
            errors.push(error);
            break;
        }
    }

    return errors;
}
