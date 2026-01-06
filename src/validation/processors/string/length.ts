import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight,VALID_TYPES } from '../../types';

export const LengthProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;

    // 获取长度：字符串、数组看 length，集合看 size
    let len: number | undefined;
    if (typeof value === 'string' || Array.isArray(value)) {
        len = value.length;
    } else if (value instanceof Set || value instanceof Map) {
        len = value.size;
    }

    if (len === undefined) return;

    if (rule.min !== undefined && len < rule.min) {
        context.errors.push(ValidationErrorBuilder.too_small(rule.min, value, false, context));
        if (!rule.allErrors) return;
    }

    if (rule.max !== undefined && len > rule.max) {
        context.errors.push(ValidationErrorBuilder.too_large(rule.max, value, false, context));
    }
};


ValidationRegistry.register({
    name: 'range',
    tags:['string'],
    execute: LengthProcessor,
    weight: ValidationWeight.QUANTITY,
    offset: 50,
});