import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const NumberRangeProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;

    // 只有数字类型才进这个处理器
    if (typeof value !== 'number') return;

    if (rule.min !== undefined && value < rule.min) {
        context.errors.push(ValidationErrorBuilder.too_small(rule.min, value, false, context));
        if (!rule.allErrors) return;
    }

    if (rule.max !== undefined && value > rule.max) {
        context.errors.push(ValidationErrorBuilder.too_large(rule.max, value, false, context));
    }
};


ValidationRegistry.register({
    name: 'numner-range',
    tags:['number'],
    execute: NumberRangeProcessor,
    weight: ValidationWeight.QUANTITY,
    offset: 50,
});