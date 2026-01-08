import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const PatternProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;

    // --- 核心逻辑：排他性自定义正则 ---
    // 如果定义了单数 pattern，它具有最高优先级，且不再执行任何其他正则校验
    if (rule.pattern instanceof RegExp) {
        if (!rule.pattern.test(value)) {
            context.errors.push(
                ValidationErrorBuilder.pattern_mismatch(rule.pattern.source, value, context)
            );
        }
        // 关键点：只要定义了 pattern，无论成功还是失败，都直接结束此处理器的逻辑
        // 这样就保证了它和 email、patterns 数组是互斥的
        return;
    }

    // --- 以下逻辑仅在没有定义 rule.pattern 的情况下才会执行 ---

    // 1. 处理注册表标准开关 (email, phone 等)
    const registeredNames = ValidationRegistry.getPatternNames();
    for (const name of registeredNames) {
        if ((rule as any)[name] === true || rule.format === name) {
            const regex = ValidationRegistry.getPattern(name);
            if (regex && !regex.test(value)) {
                context.errors.push(
                    ValidationErrorBuilder.pattern_mismatch(regex.source, value, context)
                );
                if (!rule.allErrors) return; // 报错即停止
            }
        }
    }
};


ValidationRegistry.register({
    name: 'pattern',
    tags: ['string'],
    weight: ValidationWeight.SEMANTIC,
    offset: 50,
    execute: PatternProcessor,
});