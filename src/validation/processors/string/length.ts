import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const StringLengthProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    //不要做任何防御，要相信上一处理器已经确认值为字符串，且不是null，否则会隐藏流水线逻辑错误
    let len = value.length;

    if (rule.min !== undefined && len < rule.min) {
        context.errors.push(ValidationErrorBuilder.too_small(rule.min, value, false, context));
        if (!rule.allErrors) return;
    }

    if (rule.max !== undefined && len > rule.max) {
        context.errors.push(ValidationErrorBuilder.too_large(rule.max, value, false, context));
    }

    if(rule.length !== undefined && len !== rule.length){
        context.errors.push(ValidationErrorBuilder.invalid_value(value, context));
    }
};

ValidationRegistry.register({
    name: 'string-length',
    tags: ['string'],
    execute: StringLengthProcessor,
    weight: ValidationWeight.SEMANTIC,
    offset: 50,
});
