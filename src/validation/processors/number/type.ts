import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const NumberTypeProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;

    // 如果值为 null 或 undefined，跳过类型验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return;

    // 检查值是否为 number 类型
    if (typeof value !== 'number') {
        // 值不是 number 类型，返回类型不匹配错误
        context.errors.push(ValidationErrorBuilder.type_mismatch('number', typeof value, context));
    }

    // 检查数字是否为有限值，排除 NaN 和 Infinity/-Infinity
    if (!Number.isFinite(value)) {
        // 值不是有限数字，返回无效值错误
        context.errors.push(ValidationErrorBuilder.invalid_value(value, context));
    }

};

ValidationRegistry.register({
    name: 'number.type',
    tags: ['number'],
    weight: ValidationWeight.SEMANTIC,
    offset: 50,
    execute: NumberTypeProcessor,
});