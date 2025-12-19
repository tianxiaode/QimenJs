// validators/boolean/pipeline.ts
import { ValidationErrorContext, ValidationRuleError } from '../../../core';
import { BooleanRule } from '../../../rules';

import { validateBooleanRequired } from './required';
import { validateBooleanType } from './type';
import { validateBooleanEnum } from './enum';

export function validateBoolean(
    value: any,
    rule: BooleanRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    const errors: ValidationRuleError[] = [];

    const validators = [validateBooleanRequired, validateBooleanType, validateBooleanEnum];

    for (const validator of validators) {
        const error = validator(value, rule, context);
        if (error) {
            errors.push(error);
            break;
        }
    }

    return errors.length > 0 ? errors : null;
}
