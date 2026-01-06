import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const ObjectTypeProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value } = context;

    // 如果值为 null 或 undefined，直接通过类型验证
    // 这些值的存在性应该由专门的 presence 验证器处理
    if (value === null || value === undefined) return;

    // 检查值是否为对象类型，并且不是数组
    // typeof value !== 'object' - 确保值是对象类型（排除基本类型）
    // Array.isArray(value) - 排除数组类型，数组虽然是对象但在此被视为独立类型
    if (typeof value !== 'object' || Array.isArray(value)) {
        // 值不是纯对象类型，返回类型不匹配错误
        // 错误信息包含期望的类型('object')和实际的类型
        context.errors.push(ValidationErrorBuilder.type_mismatch('object', typeof value, context));
    }
};

ValidationRegistry.register({
    name: 'object.type',
    tags: ['object'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: ObjectTypeProcessor,
});
