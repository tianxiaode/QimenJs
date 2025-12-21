import { ValidationErrorBuilder, ValidationErrorContext, ValidationResult, ValidatorBase } from '../../../core';
import { DateExtensionRule } from '../../../rules';
import { validateDate } from '../../core';

/**
 * 日期是否为未来日期的验证器
 * 
 * 该验证器用于验证给定的日期值是否表示未来的日期（晚于今天）。
 * 通过比较日期的时间戳来判断是否为未来日期。
 * 
 * @param value - 待验证的日期值，可以是 Date 对象、时间戳或日期字符串
 * @param rule - 日期验证规则选项
 * @param context - 验证上下文，包含路径等信息
 * @returns 验证结果，如果验证失败返回错误数组，否则返回null
 * 
 * @example
 * ```typescript
 * // 验证未来的日期
 * validateDateFuture(new Date('2025-01-01'), {});
 * 
 * // 验证日期字符串
 * validateDateFuture('2025-01-01', {});
 * ```
 */
export function validateDateFuture(
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
    
    // 获取今天的日期（只保留日期部分，忽略时间部分）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 将输入值转换为 Date 对象并清除时间部分
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    
    // 比较日期来判断是否为未来日期
    // 如果日期晚于今天，则验证通过
    if (date.getTime() > today.getTime()) {
        // 日期是未来日期，验证通过
        return null;
    }
    
    // 日期不是未来日期，返回错误
    return [
        ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'future date',
        }),
    ];
}

// 注册验证器
ValidatorBase.registerValidator('future', validateDateFuture);