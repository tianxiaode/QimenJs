import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const ArrayTypeProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    // 如果值为null或undefined，则跳过类型检查（认为是有效的）
    if (value === null || value === undefined) return;

    // 检查值是否为数组类型，如果不是则返回类型不匹配错误
    if (!Array.isArray(value)) {
        context.errors.push(ValidationErrorBuilder.type_mismatch('array', typeof value, context));
    }
};

ValidationRegistry.register({
    name: 'array.type',
    tags: ['array'],
    weight: ValidationWeight.SEMANTIC,
    offset: 50,
    execute: ArrayTypeProcessor,
});
