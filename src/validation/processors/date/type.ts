import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const DateTypeProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule, path } = context;

    // 如果值为 null 或 undefined，跳过类型验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return;

    // 检查值是否为 Date 实例并且是有效日期
    // 1. value instanceof Date - 确保是 Date 对象实例
    // 2. isNaN(value.getTime()) - 检查日期是否有效，Invalid Date 的 getTime() 返回 NaN
    if (!(value instanceof Date) || isNaN(value.getTime())) {
        // 值不是有效的 Date 对象，返回类型不匹配错误
        context.errors.push(ValidationErrorBuilder.type_mismatch('Date', typeof value, context));
    }
};

ValidationRegistry.register({
    name: 'date.type',
    tags: ['date'],
    weight: ValidationWeight.SEMANTIC,
    offset: 50,
    execute: DateTypeProcessor,
});
