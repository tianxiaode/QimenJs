import { ValidationErrorContext, ValidationPatternType, ValidationRuleError } from '../../../core';
import { Base64Rule, HexRule, RGBARule, RGBRule } from '../../../rules';
import { validateByPattern } from './pattern';

export function validateHexColor(
    value: string,
    rule: HexRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.HEX_COLOR, context);
}

export function validateRGBColor(
    value: string,
    rule: RGBRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.RGB_COLOR, context);
}

export function validateRGBAColor(
    value: string,
    rule: RGBARule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.RGBA_COLOR, context);
}
