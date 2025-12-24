import { ValidationErrorContext, ValidationResult, Validator } from "../../../core";
import { ObjectRequiredRuleOptions } from "../../../rules";
import { validateDate, validateObject } from "../../core";
import { enforceRuleRequirement } from "../../core/factory";

/**
 * 必需日期验证器 - 验证值是否为日期，且必须存在、不为null
 *
 * 此验证器固定了以下参数：
 * - required: true - 值必须存在（不能是undefined）
 * - nullable: false - 值不能为null
 * - empty: true - 允许空日期（由具体日期验证器决定）
 *
 * @param value - 待验证的值
 * @param rule - 日期验证规则选项
 * @param context - 验证上下文
 * @returns 验证结果
 */
export function validateRequiredObject(
    value: any,
    rule: ObjectRequiredRuleOptions = {},
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用 enforceRuleRequirement 设置必需参数
    const requiredRule = enforceRuleRequirement(rule, true);

    return validateObject(value, requiredRule, context);
}

// 注册验证器
Validator.registerValidator('objectRequired', validateRequiredObject);