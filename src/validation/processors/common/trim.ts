import { ValidationContext, ValidationProcessorHandler } from '../../types';

export const TrimProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    let { value, rule } = context;

    // 1. 空值保护：只处理有值的字符串
    if (value === null || value === undefined || typeof value !== 'string') {
        return;
    }

    // 2. 执行 Trim 逻辑
    // rule.trim 为 true 或 'all'：去除首尾空格
    if (rule.trim === true || rule.trim === 'all') {
        value = value.trim();
    }

    // rule.trim 为 'inner'：将内部多个连续空格压缩为一个，并去除首尾
    if (rule.trim === 'inner') {
        value = value.trim().replace(/\s+/g, ' ');
    }

    // 3. 将处理后的值写回上下文，供后续所有处理器（如 Email, MinLength）使用
    context.value = value;
};
