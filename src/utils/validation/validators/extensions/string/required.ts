import { validateString } from '../../core';
import { StringRequiredRuleOptions } from '../../../rules';
import { ValidationErrorContext, ValidationResult, Validator } from '../../../core';

/**
 * 必需字符串验证器 - 验证值是否为字符串，且必须存在、不为null
 *
 * 此验证器固定了以下参数：
 * - required: true - 值必须存在（不能是undefined）
 * - nullable: false - 值不能为null
 * - empty: true - 允许空字符串
 *
 * @param value - 待验证的值
 * @param rule - 字符串验证规则选项
 * @param context - 验证上下文
 * @returns 验证结果
 */
export function validateRequiredString(
    value: any,
    rule: StringRequiredRuleOptions = {},
    context: ValidationErrorContext = {}
): ValidationResult {
    // 固定required为true, nullable为false, empty为true
    const requiredRule = {
        ...rule,
        required: true,
        nullable: false,
        empty: true,
    };

    return validateString(value, requiredRule, context);
}

// 注册验证器
Validator.registerValidator('stringRequired', validateRequiredString);