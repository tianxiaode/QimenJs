import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler } from '../../types';

/**
 * 比较两个数组是否完全相同
 *
 * @param a - 第一个数组
 * @param b - 第二个数组
 * @returns 如果两个数组长度相同且每个对应位置元素相等则返回true，否则返回false
 */
function isSameArray(a: any[], b: any[]): boolean {
    // 首先检查数组长度是否相等
    if (a.length !== b.length) return false;

    // 使用every方法检查每个对应位置的元素是否相等
    return a.every((v, i) => v === b[i]);
}

export const ArrayIncludesProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule } = context;

    //不要做任何防御，要相信上一处理器

    // --- 核心逻辑：枚举值验证 ---
    // 检查是否存在 includes 规则
    if (rule.includes === undefined) return;
    
    // 获取允许的值列表，支持函数形式
    const includesValues =
        typeof rule.includes === 'function' ? rule.includes(rule) : (rule.includes as any[][]);

    if (Array.isArray(includesValues)) {
        // 检查当前值是否与枚举中的任何一个数组完全匹配
        const isMatch = includesValues.some(enumValue => isSameArray(enumValue, value));

        if (!isMatch) {
            context.errors.push(ValidationErrorBuilder.not_allowed(value, includesValues, context));
        }
    }
    // 如果定义了 includes 规则，无论成功还是失败，都直接结束此处理器的逻辑
    // 这样确保 includes 规则的独立性
    return;
};
