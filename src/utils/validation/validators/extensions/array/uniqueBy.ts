import { ValidationErrorContext, ValidationResult, ValidationErrorBuilder, ValidatorBase } from '../../../core';
import { UniqueByRuleOptions } from '../../../rules';
import { validateArray } from '../../core';

/**
 * 基于指定属性或函数的数组唯一性验证器
 * 
 * 该验证器用于验证数组中元素的唯一性，但不同于简单的值唯一性检查，
 * 它允许指定根据对象的某个属性或通过函数计算出的值来进行唯一性判断。
 * 
 * 验证流程：
 * 1. 首先执行基础数组验证（类型检查、存在性检查等）
 * 2. 如果提供了 uniqueBy 选项，则执行唯一性检查
 * 3. 使用指定的属性名或函数提取比较键值
 * 4. 检查所有键值是否唯一
 * 
 * @param value - 待验证的值，应为数组类型
 * @param rule - 唯一性验证规则选项
 * @param context - 验证上下文，包含路径等信息
 * @returns 验证结果，如果验证失败返回错误数组，否则返回null
 * 
 * @example
 * ```typescript
 * // 验证用户数组中每个用户的ID唯一
 * validateUniqueBy(users, { uniqueBy: 'id' });
 * 
 * // 验证用户数组中每个用户的邮箱唯一（忽略大小写）
 * validateUniqueBy(users, { uniqueBy: user => user.email.toLowerCase() });
 * ```
 */
export function validateUniqueBy(
    value: any,
    rule: UniqueByRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    const { uniqueBy } = rule;

    // 先进行基础数组验证，确保值存在且为数组
    // 通过覆盖 required 和 nullable 属性确保值必须存在且不为 null
    const baseResult = validateArray(value, { ...rule, required: true, nullable: false }, context);
    if (baseResult) {
        return baseResult;
    }

    // 如果没有提供 uniqueBy，则跳过唯一性检查
    // 这种情况理论上不应该发生，因为 uniqueBy 是必填项
    if (!uniqueBy) {
        return null;
    }

    // 创建用于提取比较键的函数
    // 如果 uniqueBy 是字符串，则创建访问该属性的函数
    // 如果 uniqueBy 是函数，则直接使用该函数
    const getter =
        typeof uniqueBy === 'function' ? uniqueBy : (item: any) => item?.[uniqueBy as string];

    // 使用 Set 跟踪已见过的键值，提供 O(1) 的查找性能
    const seen = new Set<any>();

    // 遍历数组检查唯一性
    for (const item of value) {
        try {
            // 获取用于比较的键值
            // 对于每个数组元素，使用 getter 函数提取比较键
            const key = getter(item);

            // 检查是否已存在相同的键值
            // 如果 Set 中已存在该键值，说明出现了重复，返回错误
            if (seen.has(key)) {
                return [ValidationErrorBuilder.duplicate('array', key, context)];
            }

            // 将键值添加到 Set 中，用于后续比较
            seen.add(key);
        } catch (error) {
            // 如果 getter 函数执行出错（例如访问不存在的属性），返回错误
            return [
                ValidationErrorBuilder.invalid_value(item, {
                    ...context,
                    message: `Failed to extract unique key: ${error instanceof Error ? error.message : String(error)}`,
                }),
            ];
        }
    }

    // 所有元素都通过了唯一性检查，没有发现重复项
    return null;
}

// 注册验证器到全局验证器基础类
// 名称为 'uniqueBy'，可以在规则中通过 type: 'uniqueBy' 来引用此验证器
ValidatorBase.registerValidator('uniqueBy', validateUniqueBy);