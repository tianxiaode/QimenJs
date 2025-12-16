// rules/composition/index.ts
import { ValidationResult, ValidationRuleError } from '../core';

/**
 * 组合多个规则，全部通过才算通过 (AND 逻辑)
 * @param rules 规则函数数组
 * @returns 组合后的规则函数
 */
export function allRules<T>(
    ...rules: Array<(value: T) => ValidationResult>
): (value: T) => ValidationResult {
    return (value: T): ValidationResult => {
        const allErrors: ValidationRuleError[] = [];
        let isValid = true;

        for (const rule of rules) {
            const result = rule(value);
            if (!result.isValid) {
                isValid = false;
                allErrors.push(...result.errors);
            }
        }

        return {
            isValid,
            errors: allErrors,
        };
    };
}

/**
 * 组合多个规则，任一通过就算通过 (OR 逻辑)
 * @param rules 规则函数数组
 * @returns 组合后的规则函数
 */
export function anyRules<T>(
    ...rules: Array<(value: T) => ValidationResult>
): (value: T) => ValidationResult {
    return (value: T): ValidationResult => {
        const failedResults: ValidationResult[] = [];

        for (const rule of rules) {
            const result = rule(value);
            if (result.isValid) {
                return { isValid: true, errors: [] };
            }
            failedResults.push(result);
        }

        // 如果所有规则都失败，合并所有错误
        const allErrors = failedResults.flatMap(r => r.errors);
        return {
            isValid: false,
            errors: allErrors,
        };
    };
}

/**
 * 反转规则结果 (NOT 逻辑)
 * @param rule 规则函数
 * @returns 反转后的规则函数
 */
export function notRule<T>(rule: (value: T) => ValidationResult): (value: T) => ValidationResult {
    return (value: T): ValidationResult => {
        const result = rule(value);
        if (result.isValid) {
            return {
                isValid: false,
                errors: [
                    {
                        errorCode: 'NOT_SATISFY_CONDITION',
                        errorParams: { value },
                    },
                ],
            };
        } else {
            return {
                isValid: true,
                errors: [],
            };
        }
    };
}

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
 * 仅在值存在（非null/undefined）时执行验证
 * 适用于可选字段的验证
 * @param rule 规则函数
 * @returns 条件规则函数
 */
export function onlyIfPresent<T>(
    rule: (value: T) => ValidationResult
): (value: T) => ValidationResult {
    return conditionalRule((value: T) => value !== null && value !== undefined, rule);
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
 * 仅在值存在且不为空字符串时执行验证
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
