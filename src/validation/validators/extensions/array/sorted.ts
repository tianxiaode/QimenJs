import { ValidationErrorBuilder, ValidationErrorContext, ValidationResult, Validator } from '../../../core';
import { SortedRuleOptions } from '../../../rules';
import { validateArray } from '../../core';
import { validateRequiredArray } from './required';

/**
 * 数组排序验证器
 * 
 * 该验证器用于验证数组元素是否按照指定的顺序排列。
 * 支持升序、降序以及自定义排序函数三种方式。
 * 
 * 验证流程：
 * 1. 首先执行基础数组验证（确保值存在且为数组）
 * 2. 根据规则创建比较函数
 * 3. 遍历数组检查相邻元素是否符合排序要求
 * 
 * @param value - 待验证的值，应为数组类型
 * @param rule - 排序验证规则选项
 * @param context - 验证上下文，包含路径等信息
 * @returns 验证结果，如果验证失败返回错误数组，否则返回null
 * 
 * @example
 * ```typescript
 * // 升序验证
 * validateSorted([1, 2, 3], { sorted: 'asc' });
 * 
 * // 降序验证
 * validateSorted([3, 2, 1], { sorted: 'desc' });
 * 
 * // 自定义排序验证
 * validateSorted(users, { sorted: (a, b) => a.age - b.age });
 * ```
 */
export function validateSorted(
    value: any,
    rule: SortedRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 先进行基础数组验证，确保值存在且为数组
    // 通过覆盖 required 和 nullable 属性确保值必须存在且不为 null
    const baseResult = validateRequiredArray(value, rule, context);
    if (baseResult) return baseResult;
    
    // 创建比较函数
    // 如果 sorted 是函数，则直接使用；否则根据 'asc' 或 'desc' 创建相应的比较函数
    const compare =
        typeof rule.sorted === 'function'
            ? rule.sorted
            : (a: any, b: any) => (rule.sorted === 'asc' ? (a > b ? 1 : -1) : a < b ? 1 : -1);

    // 遍历数组，检查每一对相邻元素是否符合排序要求
    // 从第二个元素开始，与前一个元素进行比较
    for (let i = 1; i < value.length; i++) {
        // 如果比较结果大于0，说明前一个元素应该排在后一个元素之后
        // 这违反了排序规则，因此返回错误
        if (compare(value[i - 1], value[i]) > 0) {
            return [
                ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: 'sorted array',
                    message: `Array is not sorted properly at index ${i}`
                }),
            ];
        }
    }
    
    // 所有相邻元素都符合排序要求，验证通过
    return null;
}

// 注册验证器到全局验证器基础类
// 名称为 'sorted'，可以在规则中通过 type: 'sorted' 来引用此验证器
Validator.registerValidator('sorted', validateSorted);