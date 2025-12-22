import { ValidationErrorContext, ValidationResult, ValidatorBase } from "../../../core";
import { ArrayRuleOptions } from "../../../rules";
import { validateArray } from "../../core";

/**
 * 验证数组是否为空数组的验证器（语法糖）
 * 
 * 此验证器的主要作用是绕过对空数组的限制检查，
 * 允许原本不允许空数组的规则也能接受空数组，
 * 同时保留其他所有数组验证逻辑。
 * 
 * @param value - 待验证的值
 * @param rule - 数组验证规则（不包含 allowEmpty 属性）
 * @param context - 验证上下文
 * @returns 验证结果，如果验证失败返回错误数组，否则返回null
 */
export function validateEmptyArray(
    value: any,
    /**
     * 接收除了 allowEmpty 之外的所有数组规则选项
     * 这样可以确保此验证器总是覆盖 allowEmpty 的行为
     */
    rule: Omit<ArrayRuleOptions, 'allowEmpty'>,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 调用标准数组验证器，但强制将 allowEmpty 设置为 true
    // 这样即使原始规则不允许空数组，也会被此验证器允许
    return validateArray(value, { ...rule, allowEmpty: true }, context);
}

// 注册验证器到全局验证器基础类
// 名称为 'emptyArray'，可以通过此名称在规则中引用
ValidatorBase.registerValidator('emptyArray', validateEmptyArray);