import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const DateExcludesProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    //不要做任何防御，要相信上一处理器

    // --- 核心逻辑：排除值验证 ---
    // 检查是否存在 excludes 规则
    if (rule.excludes === undefined) return;
    // 获取不允许的值列表，支持函数形式
    const excludesValues =
        typeof rule.excludes === 'function' ? rule.excludes(rule) : (rule.excludes as Date[]);

    if (Array.isArray(excludesValues)) {
        // 检查当前值是否在排除数组中
        // 对于日期，我们需要比较时间戳来判断是否相等
        const isExclude = excludesValues.some(excludeDate => 
            value.getTime() === excludeDate.getTime()
        );

        if (isExclude) {
            context.errors.push(ValidationErrorBuilder.not_allowed(value, excludesValues, context));
        }
    }

};

ValidationRegistry.register({
    name: 'date-excludes',
    tags: ['date'],
    weight: ValidationWeight.RELATION,
    offset: 115,
    execute: DateExcludesProcessor,
});