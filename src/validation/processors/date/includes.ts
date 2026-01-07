import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const DateIncludesProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    //不要做任何防御，要相信上一处理器

    // --- 核心逻辑：枚举值验证 ---
    // 检查是否存在 includes 规则
    if (rule.includes === undefined) return;
    // 获取允许的值列表，支持函数形式
    const includesValues =
        typeof rule.includes === 'function' ? rule.includes(rule) : (rule.includes as Date[]);

    if (Array.isArray(includesValues)) {
        // 检查当前值是否在允许数组中
        // 对于日期，我们需要比较时间戳来判断是否相等
        const isInclude = includesValues.some(includeDate => 
            value.getTime() === includeDate.getTime()
        );

        if (!isInclude) {
            context.errors.push(ValidationErrorBuilder.not_allowed(value, includesValues, context));
        }
    }

};

ValidationRegistry.register({
    name: 'date-includes',
    tags: ['date'],
    weight: ValidationWeight.RELATION,
    offset: 110,
    execute: DateIncludesProcessor,
});