import {
    ValidationErrorContext,
    ValidationPatternType,
    ValidationRuleError,
} from '../../../core';
import { IPV4Rule, IPV6Rule, MacAddressRule, UrlRule } from '../../../rules';
import { validateByPattern } from './pattern';

export function validateUrl(
    value: string,
    rule: UrlRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.URL, context);
}

export function validateIPv4(
    value: string,
    rule: IPV4Rule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.IPV4, context);
}

export function validateIPv6(
    value: string,
    rule: IPV6Rule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.IPV6, context);
}

export function validateMacAddress(
    value: string,
    rule: MacAddressRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.MAC_ADDRESS, context);
}
