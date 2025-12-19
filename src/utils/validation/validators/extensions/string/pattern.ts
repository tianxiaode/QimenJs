import {
    getValidationPattern,
    ValidationErrorContext,
    ValidationPatternType,
    ValidationRuleError,
} from '@/utils/validation/core';
import { validateString } from '../../core';
import { PatternRule } from '../../../rules';


export function validateByPattern(
    value: string,
    rule: PatternRule,
    patternType: ValidationPatternType,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    const pattern = getValidationPattern(patternType);
    const errors = validateString(value, {
        required: true,
        nullable: false,
        minLength: rule.minLength,
        maxLength: rule.maxLength,
        pattern: pattern,
        ...rule,
    }, context);
    return errors;
}