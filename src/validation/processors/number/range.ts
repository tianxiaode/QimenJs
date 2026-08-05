import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler } from '../../types';

/** 数字范围验证处理器 */
export const NumberRangeProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    //不需要做任何防御，相信上一处理器

    if (rule.min !== undefined && value < rule.min) {
        context.errors.push(ValidationErrorBuilder.too_small(rule.min, value, false, context));
        if (!rule.allErrors) return;
    }

    if (rule.max !== undefined && value > rule.max) {
        context.errors.push(ValidationErrorBuilder.too_large(rule.max, value, false, context));
    }
};
