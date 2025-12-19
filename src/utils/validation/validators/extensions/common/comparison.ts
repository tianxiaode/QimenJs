import { CompareRule } from '@/utils/validation/rules';
import { validateCompare } from '../../common';
import { ValidationErrorContext } from '@/utils/validation/core';

export const validateEq = (value: any, rule: CompareRule, context?: ValidationErrorContext) =>
    validateCompare(value, { strict: false, ...rule, operator: 'eq' }, context);

export const validateGt = (value: any, rule: CompareRule, context?: ValidationErrorContext) =>
    validateCompare(value, { strict: false, ...rule, operator: 'gt' }, context);

export const validateGte = (value: any, rule: CompareRule, context?: ValidationErrorContext) =>
    validateCompare(value, { strict: false, ...rule, operator: 'gte' }, context);

export const validateLt = (value: any, rule: CompareRule, context?: ValidationErrorContext) =>
    validateCompare(value, { strict: false, ...rule, operator: 'lt' }, context);

export const validateLte = (value: any, rule: CompareRule, context?: ValidationErrorContext) =>
    validateCompare(value, { strict: false, ...rule, operator: 'lte' }, context);

export const validateNeq = (value: any, rule: CompareRule, context?: ValidationErrorContext) =>
    validateCompare(value, { strict: false, ...rule, operator: 'neq' }, context);
