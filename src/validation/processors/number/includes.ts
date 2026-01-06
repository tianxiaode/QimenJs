import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const NumberIncludesProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;

    // 保护：只处理数字类型
    if (typeof value !== 'number') return;

    // --- 核心逻辑：枚举值验证 ---
    // 检查是否存在 includes 规则
    if (rule.includes !== undefined) {
        // 获取允许的值列表，支持函数形式
        const includesValues = typeof rule.includes === 'function' 
            ? rule.includes(rule) 
            : rule.includes as number[];
        
        if (Array.isArray(includesValues)) {
            // 检查当前值是否在允许数组中
            if (!includesValues.includes(value)) {
                context.errors.push(
                    ValidationErrorBuilder.not_allowed(value, includesValues, context)
                );
            }
        }
        // 如果定义了 includes 规则，无论成功还是失败，都直接结束此处理器的逻辑
        // 这样确保 includes 规则的独立性
        return;
    }
};

ValidationRegistry.register({
    name: 'number-includes',
    tags: ['number'],
    weight: ValidationWeight.SEMANTIC,
    offset: 45,
    execute: NumberIncludesProcessor,
});