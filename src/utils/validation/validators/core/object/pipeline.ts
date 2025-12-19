import { ValidationRuleError,InternalValidate, ValidationErrorContext } from '../../../core';
import { ObjectRule } from '../../../rules';

import { validateObjectRequired } from './required';
import { validateObjectType } from './type';
import { validateObjectProperties } from './properties';
import { validateObjectAdditionalProperties } from './additional';

export function validateObject(
    value: any,
    rule: ObjectRule,
    validate: InternalValidate,
    context?: ValidationErrorContext,
): ValidationRuleError[] {
    const errors: ValidationRuleError[] = [];

    const validators = [
        validateObjectRequired,
        validateObjectType,
        (v: any, r: ObjectRule, p: ValidationErrorContext) =>
            validateObjectProperties(v, r, validate, p),
        validateObjectAdditionalProperties,
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
