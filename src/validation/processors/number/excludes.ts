import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler } from '../../types';

export const NumberExcludesProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    //不要做任何防御，要相信上一处理器

    // --- 核心逻辑：排除值验证 ---
    // 检查是否存在 excludes 规则
    if (rule.excludes === undefined) return;

    // 获取排除的值列表，支持函数形式
    const excludesValues =
        typeof rule.excludes === 'function' ? rule.excludes(rule) : (rule.excludes as number[]);

    if (Array.isArray(excludesValues)) {
        // 检查当前值是否在排除数组中
        if (excludesValues.includes(value)) {
            context.errors.push(ValidationErrorBuilder.not_allowed(value, excludesValues, context));
        }
    }
};
