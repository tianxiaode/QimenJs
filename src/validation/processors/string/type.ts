import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const StringTypeProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value } = context;

    // 如果值为 null 或 undefined，直接通过类型验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return;

    // 验证字符串类型
    if (typeof value !== 'string') {
        context.errors.push(ValidationErrorBuilder.type_mismatch('string', typeof value, context));
    }
};

ValidationRegistry.register({
    name: 'string.type',
    tags: ['string'],
    weight: ValidationWeight.SEMANTIC,
    offset: 10,
    execute: StringTypeProcessor,
});
