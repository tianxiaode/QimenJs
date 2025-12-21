import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { DateRuleOptions } from '../../../rules';

/**
 * 检查日期范围
 * 
 * 验证给定的日期值是否在指定的日期范围内。
 * 支持最小日期(min)和最大日期(max)两种范围限制。
 * 
 * @param value - 需要验证的日期值
 * @param rule - 日期范围验证规则
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回相应的错误对象
 */
export function checkDateRange(
    value: any,
    rule: DateRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 检查值是否为有效的日期对象
    // 1. 验证是否为 Date 实例
    // 2. 验证日期是否有效（排除 Invalid Date）
    if (!(value instanceof Date) || isNaN(value.getTime())) return null;

    // 获取日期的时间戳用于比较
    const time = value.getTime();

    // 检查最小日期限制
    if (rule.min && time < rule.min.getTime()) {
        // 日期早于最小允许日期，返回 too_small 错误
        // 使用 getTime() 获取时间戳进行比较
        return ValidationErrorBuilder.too_small(rule.min.getTime(), value, false, context);
    }

    // 检查最大日期限制
    if (rule.max && time > rule.max.getTime()) {
        // 日期晚于最大允许日期，返回 too_large 错误
        // 使用 getTime() 获取时间戳进行比较
        return ValidationErrorBuilder.too_large(rule.max.getTime(), value, false, context);
    }

    // 日期在指定范围内，验证通过
    return null;
}