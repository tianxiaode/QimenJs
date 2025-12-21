import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { ArrayRuleOptions } from '../../../rules';

/**
 * 检查值是否为数组类型
 * 
 * @param value - 需要验证的值
 * @param _rule - 数组规则选项（此检查器不使用规则参数）
 * @param context - 验证错误上下文信息
 * @returns 检查结果，如果验证失败返回错误信息，否则返回null
 */
export function checkArrayType(
    value: any,
    _rule: ArrayRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果值为null或undefined，则跳过类型检查（认为是有效的）
    if (value === null || value === undefined) return null;

    // 检查值是否为数组类型，如果不是则返回类型不匹配错误
    if (!Array.isArray(value)) {
        return ValidationErrorBuilder.type_mismatch('array', typeof value, context);
    }

    // 类型检查通过
    return null;
}