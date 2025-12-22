// 导入所需的工具函数、类型定义和规则选项
import {
    ValidationErrorBuilder,          // 验证错误构建器
    ValidationErrorContext,         // 验证错误上下文类型
    ValidationResult,               // 验证结果类型
    Validator,                  // 验证器基类
} from '../../../core';
import { validateNumber } from '../../core/number';            // 基础数字验证函数
import { NumberExtensionRule } from '../../../rules';           // 数字高级规则类型
import { numberPredicates } from './predicates';             // 数字谓词验证函数集合

/**
 * 高级数字验证函数
 * @param value - 待验证的值
 * @param rule - 数字高级验证规则
 * @param context - 验证上下文信息
 * @returns 验证结果，验证通过返回null，验证失败返回错误信息数组
 */
export function validateNumberExtension(
    value: any,
    rule: NumberExtensionRule,
    context:  ValidationErrorContext = {}
): ValidationResult {
    // 1️⃣ 基础 number 校验，检查是否为有效数字
    const error = validateNumber(value, { ...rule, required: true, nullable: false }, context);
    if (error && error.length > 0) return error;

    const num = value as number;

    // 2️⃣ 属性型谓词校验，遍历所有预定义的数字谓词进行验证
    for (const key in numberPredicates) {
        // 获取规则中对应谓词的期望值
        const expected = rule[key as keyof typeof numberPredicates];
        // 如果规则未设置该谓词，则跳过验证
        if (!expected) continue;

        // 获取对应的谓词验证函数
        const predicate = numberPredicates[key as keyof typeof numberPredicates];
        // 执行验证，如果不通过则返回错误
        if (!predicate(num)) {
            return [
                ValidationErrorBuilder.invalid_value(num, {
                    ...context,
                    expected: key,
                }),
            ];
        }
    }

    // 3️⃣ 白名单验证，检查数值是否在允许的值列表中
    if (rule.allowsValues && !rule.allowsValues.includes(num)) {
        return [
            ValidationErrorBuilder.invalid_value(num, {
                ...context,
                expected: 'allowed values',
            }),
        ];
    }

    // 4️⃣ 黑名单验证，检查数值是否在禁止的值列表中
    if (rule.disallowsValues && rule.disallowsValues.includes(num)) {
        return [
            ValidationErrorBuilder.invalid_value(num, {
                ...context,
                expected: 'disallowed values',
            }),
        ];
    }

    // 所有验证通过
    return null;
}

/**
 * 验证整数
 * @param value - 待验证的值
 * @param rule - 数字规则（不包括integer属性）
 * @param context - 验证上下文
 * @returns 验证结果
 */
export const validateInteger = (
    value: any,
    rule: Omit<NumberExtensionRule, 'integer'>,
    context: ValidationErrorContext = {}
) => validateNumber(value, { ...rule, integer: true }, context);

/**
 * 验证正数
 * @param value - 待验证的值
 * @param rule - 数字规则（不包括positive属性）
 * @param context - 验证上下文
 * @returns 验证结果
 */
export const validatePositive = (
    value: any,
    rule: Omit<NumberExtensionRule, 'positive'>,
    context: ValidationErrorContext = {}
) => validateNumberExtension(value, { ...rule, positive: true }, context);

/**
 * 验证负数
 * @param value - 待验证的值
 * @param rule - 数字规则（不包括negative属性）
 * @param context - 验证上下文
 * @returns 验证结果
 */
export const validateNegative = (
    value: any,
    rule: Omit<NumberExtensionRule, 'negative'>,
    context: ValidationErrorContext = {}
) => validateNumberExtension(value, { ...rule, negative: true }, context);

/**
 * 验证奇数
 * @param value - 待验证的值
 * @param rule - 数字规则（不包括odd属性）
 * @param context - 验证上下文
 * @returns 验证结果
 */
export const validateOdd = (
    value: any,
    rule: Omit<NumberExtensionRule, 'odd'>,
    context: ValidationErrorContext = {}
) => validateNumberExtension(value, { ...rule, odd: true }, context);

/**
 * 验证偶数
 * @param value - 待验证的值
 * @param rule - 数字规则（不包括even属性）
 * @param context - 验证上下文
 * @returns 验证结果
 */
export const validateEven = (
    value: any,
    rule: Omit<NumberExtensionRule, 'even'>,
    context: ValidationErrorContext = {}
) => validateNumberExtension(value, { ...rule, even: true }, context);

/**
 * 验证有限数
 * @param value - 待验证的值
 * @param rule - 数字规则（不包括finite属性）
 * @param context - 验证上下文
 * @returns 验证结果
 */
export const validateFinite = (
    value: any,
    rule: Omit<NumberExtensionRule, 'finite'>,
    context: ValidationErrorContext = {}
) => validateNumberExtension(value, { ...rule, finite: true }, context);

/**
 * 验证无限数
 * @param value - 待验证的值
 * @param rule - 数字规则（不包括infinite属性）
 * @param context - 验证上下文
 * @returns 验证结果
 */
export const validateInfinite = (
    value: any,
    rule: Omit<NumberExtensionRule, 'infinite'>,
    context: ValidationErrorContext = {}
) => validateNumberExtension(value, { ...rule, infinite: true }, context);

// 注册高级数字验证器到验证器基础类中
Validator.registerValidator('numberEx', validateNumberExtension);  // 注册高级数字验证器
Validator.registerValidator('integer', validateInteger);        // 注册整数验证器
Validator.registerValidator('positive', validatePositive);      // 注册正数验证器
Validator.registerValidator('negative', validateNegative);      // 注册负数验证器
Validator.registerValidator('odd', validateOdd);                // 注册奇数验证器
Validator.registerValidator('even', validateEven);              // 注册偶数验证器
Validator.registerValidator('finite', validateFinite);          // 注册有限数验证器
Validator.registerValidator('infinite', validateInfinite);      // 注册无限数验证器