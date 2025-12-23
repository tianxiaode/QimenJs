import { validateArray } from '../../core/';
import { NotEmptyArrayRuleOptions } from '../../../rules';
import { ValidationErrorContext, ValidationResult } from '../../../core';

/**
 * 必需数组验证器 - 验证值是否为数组，且必须存在、不为null、不为空数组
 *
 * 此验证器固定了以下参数：
 * - required: true - 值必须存在
 * - nullable: false - 值不能为null
 * - empty: false - 不允许空数组
 *
 * @param value - 待验证的值
 * @param rule - 数组验证规则选项
 * @param context - 验证上下文
 * @returns 验证结果
 */
export function validateNotEmptydArray(
    value: any,
    rule: NotEmptyArrayRuleOptions = {},
    context: ValidationErrorContext = {}
): ValidationResult {
    // 固定required为true, nullable为false, allowEmpty为false
    const requiredRule = {
        ...rule,
        required: true,
        nullable: false,
        empty: false,
    };

    return validateArray(value, requiredRule, context);
}
