import { ValidationErrorContext, ValidationResult, Validator } from "../../../core";
import { NumberRequiredRuleOptions } from "../../../rules";
import { validateNumber } from "../../core/number"; // 修正导入，应该是数字验证器而不是日期验证器
import { enforceRuleRequirement } from "../../core/factory";

/**
 * 必需数字验证器 - 验证值是否为数字，且必须存在、不为null
 *
 * 此验证器固定了以下参数：
 * - required: true - 值必须存在（不能是undefined）
 * - nullable: false - 值不能为null
 * - empty: true - 允许空数字（由具体数字验证器决定）
 *
 * @param value - 待验证的值
 * @param rule - 数字验证规则选项
 * @param context - 验证上下文
 * @returns 验证结果
 */
export function validateRequiredNumber(
    value: any,
    rule: NumberRequiredRuleOptions = {},
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用 enforceRuleRequirement 设置必需参数
    const requiredRule = enforceRuleRequirement(rule, true);

    return validateNumber(value, requiredRule, context);
}

// 注册验证器
Validator.registerValidator('numberRequired', validateRequiredNumber);