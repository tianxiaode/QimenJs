import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const CommonTypeProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule, path } = context;

    // 如果没有type规则，跳过处理
    if (!rule.type) return;

    // 验证各种通用类型
    switch (rule.type) {
        case 'string':
            if (typeof value !== 'string') {
                context.errors.push(ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: 'string'
                }));
            }
            break;
        case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
                context.errors.push(ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: 'number'
                }));
            }
            break;
        case 'boolean':
            if (typeof value !== 'boolean') {
                context.errors.push(ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: 'boolean'
                }));
            }
            break;
        case 'object':
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                context.errors.push(ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: 'object'
                }));
            }
            break;
        case 'array':
            if (!Array.isArray(value)) {
                context.errors.push(ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: 'array'
                }));
            }
            break;
        case 'function':
            if (typeof value !== 'function') {
                context.errors.push(ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: 'function'
                }));
            }
            break;
        case 'undefined':
            if (value !== undefined) {
                context.errors.push(ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: 'undefined'
                }));
            }
            break;
        case 'null':
            if (value !== null) {
                context.errors.push(ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: 'null'
                }));
            }
            break;
    }
};

ValidationRegistry.register({
    name: 'common.type',
    tags: ['common'],
    weight: ValidationWeight.SEMANTIC,
    offset: 10,
    execute: CommonTypeProcessor,
});