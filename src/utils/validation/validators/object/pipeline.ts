// validators/object/pipeline.ts
import { ValidationRuleError } from '../../core/types';
import { ObjectRule } from '../../rules';
import { InternalValidate } from '../../core/internal';

import { validateObjectRequired } from './required';
import { validateObjectType } from './type';
import { validateObjectProperties } from './properties';
import { validateObjectAdditionalProperties } from './additional';

export function validateObject(
    value: any,
    rule: ObjectRule,
    validate: InternalValidate,
    path?: string
): ValidationRuleError[] {
    const errors: ValidationRuleError[] = [];

    const validators = [
        validateObjectRequired,
        validateObjectType,
        (v: any, r: ObjectRule, p: string | undefined) =>
            validateObjectProperties(v, r, validate, p),
        validateObjectAdditionalProperties,
    ];

    for (const validator of validators) {
        const error = validator(value, rule, path);
        if (error) {
            errors.push(error);
            break;
        }
    }

    return errors;
}
