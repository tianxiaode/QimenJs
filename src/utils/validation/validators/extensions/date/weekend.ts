import { ValidationErrorBuilder, ValidationErrorContext, ValidationResult, Validator } from '../../../core';
import { WeekendRuleOptions } from '../../../rules';
import { validateRequiredDate } from './index';

/**
 * 日期是否为周末的验证器
 * 
 * 该验证器用于验证给定的日期值是否表示周末日期。
 * 支持自定义周末日期（默认为周六和周日）。
 * 
 * @param value - 待验证的日期值，可以是 Date 对象、时间戳或日期字符串
 * @param rule - 周末验证规则选项，可指定哪些日期被视为周末
 * @param context - 验证上下文，包含路径等信息
 * @returns 验证结果，如果验证失败返回错误数组，否则返回null
 * 
 * @example
 * ```typescript
 * // 验证默认周末（周六、周日）
 * validateDateWeekend(new Date('2023-12-09'), {}); // Saturday
 * 
 * // 验证自定义周末（周五、周六）
 * validateDateWeekend(new Date('2023-12-08'), { weekend: [5, 6] }); // Friday
 * 
 * // 验证单个周末日期
 * validateDateWeekend(new Date('2023-12-10'), { weekend: 0 }); // Sunday
 * ```
 */
export function validateDateWeekend(
    value: any,
    rule: WeekendRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 先进行基础日期验证，要求值必须存在且不为 null
    // 这确保了传入的值是有效的日期格式
    const baseResult = validateRequiredDate(value, rule, context);
    if (baseResult) {
        return baseResult;
    }
    
    // 确定周末日期，默认为周六(6)和周日(0)
    const weekendDays = rule.weekend !== undefined 
        ? Array.isArray(rule.weekend) 
            ? rule.weekend 
            : [rule.weekend]
        : [0, 6]; // 默认周末：周日(0)和周六(6)
    
    // 将输入值转换为 Date 对象
    const date = new Date(value);
    
    // 获取日期的星期几（0-6，其中0表示周日）
    const dayOfWeek = date.getDay();
    
    // 检查当前日期是否为指定的周末日期之一
    if (weekendDays.includes(dayOfWeek)) {
        // 日期是周末，验证通过
        return null;
    }
    
    // 日期不是周末，返回错误
    return [
        ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'weekend',
            allowedValues: weekendDays,
        }),
    ];
}

// 注册验证器
Validator.registerValidator('weekend', validateDateWeekend);