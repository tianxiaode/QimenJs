import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { ArrayRuleOptions } from '../../../rules';

/**
 * 比较两个数组是否完全相同
 * 
 * @param a - 第一个数组
 * @param b - 第二个数组
 * @returns 如果两个数组长度相同且每个对应位置元素相等则返回true，否则返回false
 */
function isSameArray(a: any[], b: any[]): boolean {
    // 首先检查数组长度是否相等
    if (a.length !== b.length) return false;
    
    // 使用every方法检查每个对应位置的元素是否相等
    return a.every((v, i) => v === b[i]);
}

/**
 * 检查数组值是否在枚举允许的范围内
 * 
 * @param value - 需要验证的值
 * @param rule - 数组规则选项，包含枚举值定义
 * @param context - 验证错误上下文信息
 * @returns 检查结果，如果验证失败返回错误信息，否则返回null
 */
export function checkArrayEnum(
    value: any,
    rule: ArrayRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果值不是数组类型，则跳过验证
    if (!Array.isArray(value)) return null;
    
    // 如果规则中没有定义枚举值，则跳过验证
    if (!rule.enum) return null;

    // 检查当前值是否与枚举中的任何一个数组完全匹配
    const allowed = rule.enum.some(item => isSameArray(item, value));

    // 如果没有匹配的枚举值，则返回不允许的值错误
    if (!allowed) {
        return ValidationErrorBuilder.not_allowed(value, rule.enum as any[][], context);
    }

    // 验证通过
    return null;
}