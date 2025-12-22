import { ValidationErrorBuilder, ValidationErrorContext, ValidationResult, Validator } from '../../../core';
import { DateExtensionRule } from '../../../rules';
import { validateDate } from '../../core';

/**
 * 日期是否为今天的验证器
 * 
 * 该验证器用于验证给定的日期值是否表示今天。
 * 通过比较年、月、日三个维度来判断是否为同一天。
 * 
 * @param value - 待验证的日期值，可以是 Date 对象、时间戳或日期字符串
 * @param rule - 日期验证规则选项
 * @param context - 验证上下文，包含路径等信息
 * @returns 验证结果，如果验证失败返回错误数组，否则返回null
 * 
 * @example
 * ```typescript
 * // 验证当前日期
 * validateDateToday(new Date(), {});
 * 
 * // 验证日期字符串
 * validateDateToday('2023-12-07', {});
 * ```
 */
export function validateDateToday(
    value: any,
    rule: DateExtensionRule,
    context?: ValidationErrorContext
): ValidationResult {
    // 先进行基础日期验证，要求值必须存在且不为 null (required: true, nullable: false)
    // 这确保了传入的值是有效的日期格式
    const baseResult = validateDate(value, { ...rule, required: true, nullable: false }, context);
    if (baseResult) {
        return baseResult;
    }
    
    // 获取今天的日期
    const today = new Date();
    
    // 将输入值转换为 Date 对象
    const date = new Date(value);
    
    // 比较年、月、日是否相同来判断是否为同一天
    // 这种方式避免了时间部分（小时、分钟、秒、毫秒）的影响
    if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    ) {
        // 日期是今天，验证通过
        return null;
    }
    
    // 日期不是今天，返回错误
    return [
        ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'today',
        }),
    ];
}

// 注册验证器
Validator.registerValidator('today', validateDateToday);