import { ValidationContext, ValidationProcessorHandler } from '../../types';

/** 值转换验证处理器 */
export const TransformProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    let { value, rule } = context;

    // 1. 默认值处理 (Default)
    if (value === undefined && rule.default !== undefined) {
        value = rule.default;
    }

    // 2. 字符串清洗 (Trim)
    if (typeof value === 'string' && rule.trim !== false) {
        // 默认开启 trim
        value = value.trim();
    }

    // 3. 类型强制转换 (Transform)
    // 比如 rule.transform = (v) => Number(v)
    if (typeof rule.transform === 'function') {
        value = rule.transform(value, context.rule);
    }

    // 重要：将转换后的值回填到 context，供后续处理器使用
    context.value = value;
};
