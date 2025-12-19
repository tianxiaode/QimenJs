import { ValidationErrorContext, ValidationPatternType, ValidationRuleError } from '../../../core';
import { Base64Rule } from '../../../rules';
import { validateByPattern } from './pattern';

export function validateBase64(
    value: string,
    rule: Base64Rule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.BASE64, context);
}
