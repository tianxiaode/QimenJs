import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler } from '../../types';

export const DateWeenendProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;

    if (rule.weekend === undefined && !rule.weekend) return;

    const weekendDays = Array.isArray(rule.weekend) ? rule.weekend : [rule.weekend];

    // 将输入值转换为 Date 对象
    const date = new Date(value);

    // 获取日期的星期几（0-6，其中0表示周日）
    const dayOfWeek = date.getDay();

    // 检查当前日期是否为指定的周末日期之一
    if (weekendDays.includes(dayOfWeek)) {
        // 日期是周末，验证通过
        return;
    }

    context.errors.push(
        ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'weekend',
            allowedValues: weekendDays,
        })
    );
};

