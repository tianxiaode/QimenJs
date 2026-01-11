// 对外入口函数：用户只传 value 和 rule

import { ExecutionStep, ValidationContext, ValidationRule } from '../types';
import { ValidateFunction } from '../types/validate';
import { Registry } from '@orbitjs/registry';

/**
 * 上下文构造工厂
 */
export function createContext(
    value: any,
    rule: ValidationRule,
    partial: Partial<ValidationContext> = {}
): ValidationContext {
    return {
        // 核心数据
        value,
        rawValue: value,
        rule,
        path: partial.path || 'root',

        // 状态控制
        terminate: false,

        // 收集桶
        errors: [],
        steps: [], // 刚才讨论的执行日志记录在这里
        status: {
            isUndefined:false,
            isNull:false,
            isNaN:false,
            isEmpty:false,
            isModified:false,        },

        // 运行时元数据（可以存放临时计算结果，供下游处理器使用）
        metadata: {},

        // 混入外部传入的参数（如全局配置、多语言 i18n 等）
        ...partial,
    };
}

// 第三个参数可选，用于内部递归时透传 path 或其他状态
export const doValidate: ValidateFunction = async (value, rule, partialContext = {}) => {
    // 构造完整的“运行上下文”
    const context = createContext(value, rule, partialContext);

    // 1. 获取 validator。如果还没 use 挂载，Proxy 会抛出我们之前定义的错误
    const validator = Registry.validator; 
    
    // 2. 根据 rule.type 获取流水线
    const processors = validator.get(rule.type);

    for (const item of processors) {
        const step: ExecutionStep = {
            processor: item.name,
            weight: item.weight,
            action: 'executed',
        };

        // 1. 检查是否已经被前置处理器中断
        if (context.terminate) {
            step.action = 'skipped';
            step.reason = 'Pipeline already terminated';
            context.steps.push(step);
            continue;
        }

        // 2. 执行并计时
        const start = performance.now();
        await item.execute(context);
        const end = performance.now();

        // 3. 记录执行结果
        // 这里的关键是：处理器如果因为 if(rule.format !== 'date') 退出，
        // 我们可以在执行前后对比 context 的变化来判定它是否“真正”处理了逻辑
        step.duration = end - start;

        // 如果处理器内部设置了中断
        if (context.terminate) {
            step.action = 'terminated';
            step.reason = 'Processor raised fatal error';
        }

        context.steps.push(step);
    }

    return {
        isValid: context.errors.length === 0,
        errors: context.errors,
        value: context.value,
        context: context,
    };
};
