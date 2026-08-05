import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler } from '../../types';

/** 字符串类型验证处理器 */
export const StringTypeProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value } = context;

    //不需要做任何防御，相信上一处理器已经把null值处理了，避免流水线隐性错误

    // 验证字符串类型
    if (typeof value !== 'string') {
        context.errors.push(ValidationErrorBuilder.type_mismatch('string', typeof value, context));
        // 【关键】一旦类型不对，后续针对字符串的语义校验（长度、正则等）全无意义，直接中断
        context.terminate = true;
    }
};
