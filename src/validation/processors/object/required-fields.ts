import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler } from '../../types';

/** 对象必填字段验证处理器 */
export const ObjectRequiredFieldsProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule, path } = context;

    const { requiredFields = [], additionalProperties = true } = rule;
    const actualKeys = Object.keys(value);

    // 1. 检查必填项是否缺失
    for (const field of requiredFields) {
        if (!(field in value)) {
            context.errors.push(
                ValidationErrorBuilder.required({
                    ...context,
                    path: path ? `${path}.${field}` : field,
                })
            );
        }
    }

    // 2. 检查是否有额外字段（当 additionalProperties 为 false 时）
    if (additionalProperties === false) {
        for (const key of actualKeys) {
            if (!requiredFields.includes(key)) {
                context.errors.push(
                    ValidationErrorBuilder.not_allowed(key, requiredFields, {
                        ...context,
                        path: path ? `${path}.${key}` : key,
                    })
                );
            }
        }
    }
};
