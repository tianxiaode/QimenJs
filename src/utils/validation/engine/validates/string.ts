import { ValidationRuleError } from '../../core';
import { EmailRule } from '../../rules';
import { validateString } from '../../validators';

export function validateEmail(value: string, rule: EmailRule): ValidationRuleError[] | null {
    const errors = validateString(value, {
        type: 'string',
        required: true,
        nullable: false,
        minLength: rule.minLength,
        maxLength: rule.maxLength,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    });
    return errors;
}
