import {
    ValidationRuleError,
    ValidationErrorContext,
    ValidationResult,
    normalizeValidationResult,
    ValidatorFunction,
    RuleObjectPropertiesOptions,
} from '../../../core';
import { normalizeChildRule } from '../convert';

/**
 * 验证对象属性规则
 *
 * 根据定义的属性规则验证对象中每个属性的值。
 *
 * @param value - 要验证的对象
 * @param properties - 属性规则映射
 * @param allPropertiesError - 是否收集所有属性的错误而不是遇到第一个错误就停止
 * @param context - 验证上下文
 * @returns 验证结果，验证失败时返回错误数组，否则返回 null
 */
export function validateProperties(
    value: any,
    properties: Record<string, ValidatorFunction | RuleObjectPropertiesOptions>,
    allPropertiesError: boolean = false,
    context: ValidationErrorContext = {}
): ValidationResult {
    let errors: ValidationRuleError[] = [];

    // 遍历所有定义的属性规则
    for (const key of Object.keys(properties)) {
        // 获取属性规则和对应值
        const fieldRule: ValidatorFunction | RuleObjectPropertiesOptions = properties[key];
        const fieldValue = value[key];

        // 构建属性路径用于错误报告
        const fieldPath = context && context.path ? `${context.path}.${key}` : key;

        // 规范化属性验证规则
        const validate = normalizeChildRule(fieldRule);

        // 执行属性验证
        const result = validate(fieldValue, {} as any, { ...context, path: fieldPath });

        // 处理验证结果
        if (result && allPropertiesError) {
            // 如果需要收集所有错误，将错误添加到错误数组中
            errors = errors.concat(result);
        } else if (result) {
            // 如果只需要第一个错误，立即返回
            return result;
        }
    }

    // 返回规范化后的错误结果
    return normalizeValidationResult(errors);
}
