import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler } from '../../types';

export const ArrayTypeProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value } = context;

    //不需要做任何防御，相信上一处理器已经把null值处理了，避免流水线隐性错误

    // 检查值是否为数组类型，如果不是则返回类型不匹配错误
    if (!Array.isArray(value)) {
        context.errors.push(ValidationErrorBuilder.type_mismatch('array', typeof value, context));
        context.terminate = true;
    }
};
