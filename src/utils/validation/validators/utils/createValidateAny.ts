import { InternalValidate, ValidationErrorContext } from '../../core';
import {
    validateArray,
    validateDate,
    validateNumber,
    validateObject,
    validateString,
} from '../core';
import { validateEmail, validatePassword } from '../extensions';

export function createValidateAny(): InternalValidate {
    const validateAny: InternalValidate = (value, rule, context: ValidationErrorContext = {}) => {
        if (!rule || typeof rule !== 'object') {
            return { valid: true };
        }

        switch (rule.type) {
            case 'string':
                return validateString(value, rule, context);

            case 'number':
                return validateNumber(value, rule, context);

            case 'array':
                return validateArray(value, rule, context, validateAny);

            case 'object':
                return validateObject(value, rule, context, validateAny);

            case 'date':
                return validateDate(value, rule, context);

            case 'email':
                return validateEmail(value, rule, context);

            case 'password':
                return validatePassword(value, rule, context);

            default:
                return { valid: true };
        }
    };

    return validateAny;
}
