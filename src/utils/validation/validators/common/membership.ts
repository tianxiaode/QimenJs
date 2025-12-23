import {
    smartCompare,
    ValidationErrorBuilder,
    ValidationErrorContext,
    ValidationResult,
} from '../../core';
import { Validator } from '../../core/Validator';
import { ContainsRuleOptions } from '../../rules';

/**
 * 验证值是否包含在指定集合中
 * @param value - 待验证的值
 * @param rule - 包含规则选项
 * @param context - 验证上下文
 * @returns 验证结果，如果验证失败返回错误数组，否则返回null
 */
export function validateContains(
    value: unknown,
    rule: ContainsRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 确定是验证包含(true)还是不包含(false)，默认为包含
    const contains = rule.contains !== false;
    // 确定比较是否严格模式，默认为严格比较
    const strict = rule.strict ?? true;

    // 获取目标集合，支持动态获取函数或直接提供数组
    const collection = typeof rule.target === 'function' ? rule.target(context) : rule.target;

    // 检查目标是否为数组，如果不是则返回类型错误
    if (!Array.isArray(collection)) {
        return [
            ValidationErrorBuilder.invalid_value('target', {
                ...context,
                expectedType: 'array',
            }),
        ];
    }

    // 检查值是否存在于集合中
    const found = collection.some(item => {
        const result = smartCompare(value, item, strict);
        return result === 0; // smartCompare返回0表示相等
    });

    // 如果应该是包含但未找到，则返回错误
    if (contains && !found) {
        return [ValidationErrorBuilder.not_allowed(value, collection, context)];
    }

    // 如果应该是不包含但找到了，则返回错误
    if (!contains && found) {
        return [ValidationErrorBuilder.not_allowed(value, collection, context)];
    }

    // 验证通过
    return null;
}

/**
 * 验证数组中的元素是否唯一
 * @param values - 待验证的数组
 * @param _rule - 规则选项（此验证器不需要特定规则）
 * @param context - 验证上下文
 * @returns 验证结果，如果发现重复项返回错误数组，否则返回null
 */
export function validateUnique(
    values: readonly any[],
    _rule: any = {},
    context: ValidationErrorContext = {}
): ValidationResult {
    // 检查输入是否为数组
    if (!Array.isArray(values)) {
        return [
            ValidationErrorBuilder.invalid_value('collection', {
                ...context,
                expectedType: 'array',
            }),
        ];
    }

    // 使用Set来跟踪已见过的值
    const seen = new Set<any>();

    // 遍历数组检查重复项
    for (const value of values) {
        if (seen.has(value)) {
            // 发现重复值，返回错误
            return [ValidationErrorBuilder.not_allowed(value, values, context)];
        }
        seen.add(value);
    }

    // 所有元素都是唯一的
    return null;
}

// 注册验证器到全局验证器基础类
Validator.registerValidator('contains', validateContains);
Validator.registerValidator('unique', validateUnique);