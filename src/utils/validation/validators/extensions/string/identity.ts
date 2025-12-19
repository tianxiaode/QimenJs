import { ValidationErrorContext, ValidationPatternType, ValidationRuleError } from '../../../core';
import {
    ChineseIDRule,
    ChinesePostcodeRule,
    CreditCardRule,
    EmailRule,
    PhoneRule,
    UsernameRule,
    UUIDRule,
} from '../../../rules';
import { validateByPattern } from './pattern';

export function validateEmail(
    value: string,
    rule: EmailRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.EMAIL, context);
}

export function validatePhone(
    value: string,
    rule: PhoneRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.PHONE, context);
}

export function validateUsername(
    value: string,
    rule: UsernameRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.USERNAME, context);
}

export function validateUUID(
    value: string,
    rule: UUIDRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.UUID, context);
}

export function validateCreditCard(
    value: string,
    rule: CreditCardRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.CREDIT_CARD, context);
}

export function validateChineseID(
    value: string,
    rule: ChineseIDRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.CHINESE_ID, context);
}

export function validateChinesePostcode(
    value: string,
    rule: ChinesePostcodeRule,
    context?: ValidationErrorContext
): ValidationRuleError[] | null {
    return validateByPattern(value, rule, ValidationPatternType.CHINESE_POSTCODE, context);
}
