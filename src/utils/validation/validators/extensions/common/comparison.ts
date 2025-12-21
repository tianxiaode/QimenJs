import { CompareOperatorRuleOptions, CompareRuleOptions } from '../../../rules';
import { validateCompare } from '../../common';
import { ValidationErrorContext, ValidatorBase } from '../../../core';

/**
 * 验证值是否等于目标值
 * 默认使用严格比较模式(strict=true)，即类型不同的值会被认为不相等
 * @param value - 待验证的值
 * @param rule - 比较规则配置，必须包含target属性
 * @param context - 验证上下文信息
 * @returns 验证结果
 */
export const validateEq = (
    value: any,
    rule: CompareOperatorRuleOptions,
    context: ValidationErrorContext = {}
) => validateCompare(value, { ...rule, operator: 'eq' } as CompareRuleOptions, context);

/**
 * 验证值是否大于目标值
 * 默认使用严格比较模式(strict=true)，即类型不同的值会被认为不相等
 * @param value - 待验证的值
 * @param rule - 比较规则配置，必须包含target属性
 * @param context - 验证上下文信息
 * @returns 验证结果
 */
export const validateGt = (
    value: any,
    rule: CompareOperatorRuleOptions,
    context: ValidationErrorContext = {}
) => validateCompare(value, { ...rule, operator: 'gt' } as CompareRuleOptions, context);

/**
 * 验证值是否大于等于目标值
 * 默认使用严格比较模式(strict=true)，即类型不同的值会被认为不相等
 * @param value - 待验证的值
 * @param rule - 比较规则配置，必须包含target属性
 * @param context - 验证上下文信息
 * @returns 验证结果
 */
export const validateGte = (
    value: any,
    rule: CompareOperatorRuleOptions,
    context: ValidationErrorContext = {}
) => validateCompare(value, { ...rule, operator: 'gte' } as CompareRuleOptions, context);

/**
 * 验证值是否小于目标值
 * 默认使用严格比较模式(strict=true)，即类型不同的值会被认为不相等
 * @param value - 待验证的值
 * @param rule - 比较规则配置，必须包含target属性
 * @param context - 验证上下文信息
 * @returns 验证结果
 */
export const validateLt = (
    value: any,
    rule: CompareOperatorRuleOptions,
    context: ValidationErrorContext = {}
) => validateCompare(value, { ...rule, operator: 'lt' } as CompareRuleOptions, context);

/**
 * 验证值是否小于等于目标值
 * 默认使用严格比较模式(strict=true)，即类型不同的值会被认为不相等
 * @param value - 待验证的值
 * @param rule - 比较规则配置，必须包含target属性
 * @param context - 验证上下文信息
 * @returns 验证结果
 */
export const validateLte = (
    value: any,
    rule: CompareOperatorRuleOptions,
    context: ValidationErrorContext = {}
) => validateCompare(value, { ...rule, operator: 'lte' } as CompareRuleOptions, context);

/**
 * 验证值是否不等于目标值
 * 默认使用严格比较模式(strict=true)，即类型不同的值会被认为不相等
 * @param value - 待验证的值
 * @param rule - 比较规则配置，必须包含target属性
 * @param context - 验证上下文信息
 * @returns 验证结果
 */
export const validateNeq = (
    value: any,
    rule: CompareRuleOptions,
    context: ValidationErrorContext = {}
) => validateCompare(value, { ...rule, operator: 'neq' }, context);

// 注册验证器到全局验证器库中
ValidatorBase.registerValidator('eq', validateEq);
ValidatorBase.registerValidator('gt', validateGt);
ValidatorBase.registerValidator('gte', validateGte);
ValidatorBase.registerValidator('lt', validateLt);
ValidatorBase.registerValidator('lte', validateLte);
ValidatorBase.registerValidator('neq', validateNeq);
