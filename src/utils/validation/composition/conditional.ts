import { ValidationResult, ValidationRuleError } from '../core';

/**
 * 条件规则：仅当条件满足时才应用规则
 * @param condition 条件函数
 * @param rule 规则函数
 * @returns 条件规则函数
 */
export function conditionalRule<T>(
    condition: (value: T) => boolean,
    rule: (value: T) => ValidationResult
): (value: T) => ValidationResult {
    return (value: T): ValidationResult => {
        if (condition(value)) {
            return rule(value);
        }
        return { isValid: true, errors: [] };
    };
}

/**
 * 可选值验证：如果值不存在(null/undefined)则跳过验证，存在则应用规则
 * @param rule 验证规则
 * @returns 条件规则函数
 */
export function optionalRule<T>(
    rule: (value: T) => ValidationResult
): (value: T) => ValidationResult {
    return conditionalRule((value: T) => value !== null && value !== undefined, rule);
}

/**
 * 条件验证：当指定条件为真时应用规则
 * @param condition 条件函数
 * @param rule 验证规则
 * @returns 条件规则函数
 */
export function whenRule<T>(
    condition: (value: T) => boolean,
    rule: (value: T) => ValidationResult
): (value: T) => ValidationResult {
    return conditionalRule(condition, rule);
}

/**
 * 反向条件验证：当指定条件为假时应用规则
 * @param condition 条件函数
 * @param rule 验证规则
 * @returns 条件规则函数
 */
export function unlessRule<T>(
    condition: (value: T) => boolean,
    rule: (value: T) => ValidationResult
): (value: T) => ValidationResult {
    return conditionalRule((value: T) => !condition(value), rule);
}

/**
 * 多条件分支验证：根据不同的条件应用不同的规则
 * @param cases 条件-规则映射数组
 * @returns 条件规则函数
 */
export function switchRule<T>(
    cases: Array<{
        condition: (value: T) => boolean;
        rule: (value: T) => ValidationResult;
    }>
): (value: T) => ValidationResult {
    return (value: T): ValidationResult => {
        for (const { condition, rule } of cases) {
            if (condition(value)) {
                return rule(value);
            }
        }
        return { isValid: true, errors: [] };
    };
}

/**
 * 仅在值存在且非空字符串时执行验证
 * @param rule 规则函数
 * @returns 条件规则函数
 */
export function onlyIfNonEmptyString<T>(
    rule: (value: T) => ValidationResult
): (value: T) => ValidationResult {
    return conditionalRule(
        (value: T) =>
            value !== null &&
            value !== undefined &&
            typeof value === 'string' &&
            value.trim() !== '',
        rule
    );
}

/**
 * 仅在值存在且为有效数字（非null/undefined且非NaN）时执行验证
 * @param rule 规则函数
 * @returns 条件规则函数
 */
export function onlyIfValidNumber<T>(
    rule: (value: T) => ValidationResult
): (value: T) => ValidationResult {
    return conditionalRule(
        (value: T) =>
            value !== null && value !== undefined && typeof value === 'number' && !isNaN(value),
        rule
    );
}

/**
 * 仅在值存在且为非空数组时执行验证
 * @param rule 规则函数
 * @returns 条件规则函数
 */
export function onlyIfNonEmptyArray<T>(
    rule: (value: T) => ValidationResult
): (value: T) => ValidationResult {
    return conditionalRule(
        (value: T) =>
            value !== null && value !== undefined && Array.isArray(value) && value.length > 0,
        rule
    );
}