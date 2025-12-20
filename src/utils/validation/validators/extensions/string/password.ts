import {
    getValidationPattern,
    ValidationErrorContext,
    ValidationPatternType,
    ValidationRuleError,
} from '../../../core';
import { PasswordRule } from '@/utils/validation/rules';
import { validateString, checkStringPattern } from '../../core';

export function validatePassword(value: string, rule: PasswordRule, context?: ValidationErrorContext): ValidationRuleError[] | null {
    const validateStringResult = validateString(value, rule, context);
    if (validateStringResult) {
        return validateStringResult;
    }

    const errors: ValidationRuleError[] = [];

    // 验证各种模式
    validateAndCollectPatternError(errors, value, rule, context, ValidationPatternType.UPPERCASE, 'uppercase');
    validateAndCollectPatternError(errors, value, rule, context, ValidationPatternType.LOWERCASE, 'lowercase');
    validateAndCollectPatternError(errors, value, rule, context, ValidationPatternType.DIGIT, 'number');
    validateAndCollectPatternError(errors, value, rule, context, ValidationPatternType.SPECIAL_CHAR, 'specialChar');

    return errors.length > 0 ? errors : null;
}

function validateAndCollectPatternError(
    errors: ValidationRuleError[],
    value: string, 
    rule: PasswordRule, 
    context: ValidationErrorContext | undefined,
    patternType: ValidationPatternType,
    ruleKey: keyof PasswordRule
): void {
    if (rule[ruleKey]) {
        const pattern = getValidationPattern(patternType);
        const error = checkStringPattern(value, { type: 'string', pattern }, context);
        if (error) {
            errors.push(error);
        }
    }
}