// 对外入口函数：用户只传 value 和 rule

import { ValidationContext } from "../types";
import { ValidateFunction } from "../types/validate";

// 第三个参数可选，用于内部递归时透传 path 或其他状态
export const validate: ValidateFunction = async (value, rule, partialContext = {}) => {
    
    // 构造完整的“运行上下文”
    const context: ValidationContext = {
        value,
        rule,
        // 如果没有传入 path（入口处），则默认为空字符串
        path: partialContext.path || '', 
        errors: [],
    };

    const processors = ValidationRegistry.getSortedProcessors(rule.type);
    
    for (const processor of processors) {
        await processor.execute(context);
        if (!rule.allErrors && context.errors.length > 0) break;
    }

    return {
        valid: context.errors.length === 0,
        errors: context.errors,
        value: context.value
    };
};