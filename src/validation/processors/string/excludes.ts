import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const StringExcludesProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;

    // 保护：只处理字符串且非空字符串
    if (typeof value !== 'string' || value === '') return;

    // --- 核心逻辑：排除值验证 ---
    // 检查是否存在 excludes 规则
    if (rule.excludes !== undefined) {
        // 获取排除的值列表，支持函数形式
        const excludesValues = typeof rule.excludes === 'function' 
            ? rule.excludes(rule) 
            : rule.excludes as string[];
        
        if (Array.isArray(excludesValues)) {
            // 检查当前值是否在排除数组中
            if (excludesValues.includes(value)) {
                context.errors.push(
                    ValidationErrorBuilder.not_allowed(value, excludesValues, context)
                );
            }
        }
        // 如果定义了 excludes 规则，无论成功还是失败，都直接结束此处理器的逻辑
        // 这样确保 excludes 规则的独立性
        return;
    }
};

ValidationRegistry.register({
    name: 'string-excludes',
    tags: ['string'],
    weight: ValidationWeight.SEMANTIC,
    offset: 46,
    execute: StringExcludesProcessor,
});