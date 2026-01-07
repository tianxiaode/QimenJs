import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const ArrayLengthProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    //不要做任何防御，要相信上一处理器

    const length = value.length;

    // 检查最小长度
    if (rule.minLength !== undefined && length < rule.minLength) {
        context.errors.push(ValidationErrorBuilder.too_small(rule.minLength, value, false, context));
        if (!rule.allErrors) return;
    }

    // 检查最大长度
    if (rule.maxLength !== undefined && length > rule.maxLength) {
        context.errors.push(ValidationErrorBuilder.too_large(rule.maxLength, value, false, context));
        if (!rule.allErrors) return;
    }

    // 检查精确长度
    if (rule.length !== undefined && length !== rule.length) {
        context.errors.push(ValidationErrorBuilder.invalid_value(value, context));
    }
};

ValidationRegistry.register({
    name: 'array-length',
    tags: ['array'],
    execute: ArrayLengthProcessor,
    weight: ValidationWeight.SEMANTIC,
    offset: 50,
});