import { ValidationErrorBuilder, ValidationErrorContext, ValidationResult, Validator } from '../../../core';
import { DateRequiredRuleOptions } from '../../../rules';
import { validateRequiredDate } from './index';

/**
 * 日期是否为昨天的验证器
 * 
 * 该验证器用于验证给定的日期值是否表示昨天。
 * 通过比较年、月、日三个维度来判断是否为昨天。
 * 
 * @param value - 待验证的日期值，可以是 Date 对象、时间戳或日期字符串
 * @param rule - 日期验证规则选项
 * @param context - 验证上下文，包含路径等信息
 * @returns 验证结果，如果验证失败返回错误数组，否则返回null
 * 
 * @example
 * ```typescript
 * // 验证昨天的日期
 * const yesterday = new Date();
 * yesterday.setDate(yesterday.getDate() - 1);
 * validateDateYesterday(yesterday, {});
 * 
 * // 验证日期字符串
 * validateDateYesterday('2023-12-06', {});
 * ```
 */
export function validateDateYesterday(
    value: any,
    rule: DateRequiredRuleOptions = {},
    context: ValidationErrorContext = {}
): ValidationResult {
    // 先进行基础日期验证，要求值必须存在且不为 null
    // 这确保了传入的值是有效的日期格式
    const baseResult = validateRequiredDate(value, rule, context);
    if (baseResult) {
        return baseResult;
    }
    
    // 获取昨天的日期
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 将输入值转换为 Date 对象
    const date = new Date(value);
    
    // 比较年、月、日是否相同来判断是否为昨天
    // 这种方式避免了时间部分（小时、分钟、秒、毫秒）的影响
    if (
        date.getFullYear() === yesterday.getFullYear() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getDate() === yesterday.getDate()
    ) {
        // 日期是昨天，验证通过
        return null;
    }
    
    // 日期不是昨天，返回错误
    return [
        ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'yesterday',
        }),
    ];
}

// 注册验证器
Validator.registerValidator('yesterday', validateDateYesterday);