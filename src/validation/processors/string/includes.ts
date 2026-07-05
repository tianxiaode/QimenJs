import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler } from '../../types';

export const StringIncludesProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    //不要做任何防御，要相信上一处理器已经确认值为字符串，且不是null，否则会隐藏流水线逻辑错误

    // --- 核心逻辑：枚举值验证 ---
    // 检查是否存在 includes 规则
    if (rule.includes === undefined) return;
    // 获取允许的值列表，支持函数形式
    const includesValues =
        typeof rule.includes === 'function' ? rule.includes(rule) : (rule.includes as string[]);

    if (Array.isArray(includesValues)) {
        // 检查当前值是否在允许数组中
        if (!includesValues.includes(value)) {
            context.errors.push(ValidationErrorBuilder.not_allowed(value, includesValues, context));
        }
    }
};
