import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler } from '../../types';

/** 数组唯一性验证处理器 */
export const ArrayUniqueProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    // 如果不是数组或未设置unique参数，跳过验证
    if (rule.unique !== true) return;

    // 检查数组元素是否唯一
    const seen = new Set();
    for (const item of value) {
        // 对于对象，我们使用JSON.stringify来比较（注意这可能不是100%准确，但对于大多数情况足够）
        const key = typeof item === 'object' && item !== null ? JSON.stringify(item) : item;

        if (seen.has(key)) {
            context.errors.push(ValidationErrorBuilder.duplicate('array', item, context));
            if (!rule.allErrors) return;
        } else {
            seen.add(key);
        }
    }
};
