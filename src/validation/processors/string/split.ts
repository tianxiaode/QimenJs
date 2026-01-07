import { doValidate, ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationProcessorHandler, ValidationRule, ValidationWeight } from '../../types';

export const SplitProcessor: ValidationProcessorHandler = async (context) => {
    const { value, rule, path } = context;

    // 1. 拆分逻辑
    if (typeof value !== 'string' || !rule.separator) return;

    let items = value.split(rule.separator);

    // 2. 清洗逻辑 (保留你原来的 rule.trim 配置)
    if (rule.trim) {
        items = items.map(v => v.trim());
    }

    // 3. 空项校验 (你的特色逻辑，很有必要)
    if (!rule.allowEmptyItem && items.some(v => v === '')) {
        context.errors.push(ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'non-empty items'
        }));
        if (!rule.allErrors) return; 
    }

    // --- 核心转变：构建虚拟数组规则并委托 ---
    
    const virtualArrayRule: ValidationRule = {
        type: 'array',
        // 映射数量校验：你的 minItems/maxItems 直接映射给数组的 min/max
        min: rule.minItems,
        max: rule.maxItems,
        // 映射子项规则：你的 itemRule 对应数组的 items
        itemRule: rule.itemRule,
        // 映射错误控制
        allErrors: rule.allItemsError ?? rule.allErrors
    };

    // 让专门的 Array 处理器去跑后续的：
    // - 数量校验 (LengthProcessor: 3000)
    // - 子项循环验证 (ArrayProcessor: 5000)
    const result = await doValidate(items, virtualArrayRule, { path });

    context.errors.push(...result.errors);

};

ValidationRegistry.register({
    name: 'string.split',
    tags: ['string'],
    weight: ValidationWeight.STRUCTURAL,
    offset: 50,
    execute: SplitProcessor,
});
    