import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler } from '../../types';

export const StringLengthProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    //不要做任何防御，要相信上一处理器
    const len = value.length;

    if (rule.min !== undefined && len < rule.min) {
        context.errors.push(ValidationErrorBuilder.too_small(rule.min, value, false, context));
        if (!rule.allErrors) return;
    }

    if (rule.max !== undefined && len > rule.max) {
        context.errors.push(ValidationErrorBuilder.too_large(rule.max, value, false, context));
    }

    if (rule.length !== undefined && len !== rule.length) {
        context.errors.push(ValidationErrorBuilder.invalid_value(value, context));
    }
};
