import {
    smartCompare,
    ValidationErrorContext,
    ValidationResult,
    ValidationErrorBuilder,
    Validator,
} from '../../core';
import { CompareRuleOptions } from '../../rules';

/**
 * 比较验证器函数
 * 
 * 用于验证给定值与目标值之间的关系是否符合指定的操作符条件。
 * 支持多种比较操作符：等于(eq)、不等于(neq)、大于(gt)、大于等于(gte)、小于(lt)、小于等于(lte)
 * 默认使用严格比较模式(strict=true)，即类型不同的值会被认为不相等
 * 
 * @param value - 需要验证的值
 * @param rule - 比较规则配置对象
 * @param rule.operator - 比较操作符 ('eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte')
 * @param rule.target - 目标值，可以是具体值或者返回值的函数
 * @param rule.strict - 是否严格比较模式，默认为true（严格模式下，类型不同的值不相等）
 * @param context - 验证上下文，包含字段信息等
 * 
 * @returns 验证结果，验证通过返回null，验证失败返回ValidationError数组
 * 
 * @example
 * ```typescript
 * // 验证值是否等于10（严格模式）
 * validateCompare(10, { operator: 'eq', target: 10 });
 * 
 * // 验证值是否等于"10"（非严格模式，数字10和字符串"10"被认为相等）
 * validateCompare(10, { operator: 'eq', target: "10", strict: false });
 * 
 * // 验证值是否大于5
 * validateCompare(10, { operator: 'gt', target: 5 });
 * 
 * // 使用函数动态计算目标值
 * validateCompare(10, { operator: 'gte', target: (ctx) => ctx.minValue || 0 });
 * ```
 */
export function validateCompare(
    value: unknown,
    rule: CompareRuleOptions = { operator: 'eq', target: 0 },
    context: ValidationErrorContext = {}
): ValidationResult {
    // 获取严格比较模式设置，默认为true
    const strict = rule.strict ?? true;

    // 1. 解析目标值 - 如果target是函数则执行获取返回值，否则直接使用
    let targetValue = typeof rule.target === 'function' ? rule.target(context) : rule.target;

    // 2. 执行智能比较，返回比较结果
    // 返回值: NaN(无法比较)、-1(小于)、0(等于)、1(大于)
    const result = smartCompare(value, targetValue, strict);

    // 如果比较结果为NaN，说明无法进行比较，返回无效值错误
    if (Number.isNaN(result)) {
        return [
            ValidationErrorBuilder.invalid_value('target', {
                ...context,
                expectedType: 'comparable value',
            }),
        ];
    }

    // 3. 根据操作符判断是否通过验证
    const pass =
        (rule.operator === 'eq' && result === 0) ||           // 等于
        (rule.operator === 'neq' && result !== 0) ||          // 不等于
        (rule.operator === 'gt' && result > 0) ||             // 大于
        (rule.operator === 'gte' && result >= 0) ||           // 大于等于
        (rule.operator === 'lt' && result < 0) ||             // 小于
        (rule.operator === 'lte' && result <= 0);             // 小于等于

    // 如果未通过验证，构建并返回错误信息
    if (!pass) {
        return [
            ValidationErrorBuilder.condition_failed(context?.field ?? '', rule.operator, value, {
                target: targetValue,
                operator: rule.operator,
            }),
        ];
    }

    // 验证通过返回null
    return null;
}

// 将比较验证器注册到验证器基础类中，键名为'compare'
Validator.registerValidator('compare', validateCompare);