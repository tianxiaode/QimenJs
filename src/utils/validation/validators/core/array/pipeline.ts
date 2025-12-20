import {
    normalizeValidationResult,
    ValidationErrorContext,
    ValidationResult,
    ValidationRuleError,
} from '../../../core';
import { ArrayRule } from '../../../rules';
import { checkArrayType } from './type';
import { checkArrayLength } from './length';
import { checkArrayEnum } from './enum';
import { createCoreValidator } from '../factory';
import { checkPresence } from '../presence';
import { normalizeChildRule } from '../convert';

export const validateArray = createCoreValidator<ArrayRule>(
    [checkPresence, checkArrayType, checkArrayLength, checkArrayEnum],
    (value: any, rule: ArrayRule, context: ValidationErrorContext = {}): ValidationResult => {
        if (!Array.isArray(value) || !rule.childRule) return null;
        const childRule = rule.childRule;
        const validate = normalizeChildRule(childRule);

        const allChildsError = rule.allChildsError;
        let errors: ValidationRuleError[] = [];
        for (let i = 0; i < value.length; i++) {
            const itemContext = {
                ...context,
                path: context.path ? `${context.path}[${i}]` : `[${i}]`,
                parent: value,
            };
            const result = validate(value[i], rule, itemContext);
            if (result && !allChildsError) {
                return result;
            } else {
                errors = errors.concat(result || []);
            }
        }
        return normalizeValidationResult(errors);
    }
);
