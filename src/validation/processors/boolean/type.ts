import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const BooleanypeProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    // 如果值为 null 或 undefined，跳过类型验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return;

    // 检查值是否为布尔类型
    if (typeof value !== 'boolean') {
        // 值不是布尔类型，返回类型不匹配错误
        context.errors.push(ValidationErrorBuilder.type_mismatch('boolean', typeof value, context));
    }
};

ValidationRegistry.register({
    name: 'boolean.type',
    tags: ['boolean'],
    weight: ValidationWeight.SEMANTIC,
    offset: 50,
    execute: BooleanypeProcessor,
});
