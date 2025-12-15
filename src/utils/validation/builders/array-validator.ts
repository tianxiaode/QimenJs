import { ValidationResult, ArrayValidationRules, ValidationRuleError } from '../base';
import { isArray, isRequired } from '../primitives';
import { hasMinLength, hasMaxLength } from '../constraints';
import { allRules, conditionalRule } from '../composition';
import { createValidationSuccess, createValidationFailure } from '../base/results'; // 导入工具函数

/**
 * 构建数组验证器
 * @param rules 数组验证规则配置
 * @returns 验证函数
 */
export function buildArrayValidator(
    rules: ArrayValidationRules={}
): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        // 1. 类型检查
        const arrayCheck = isArray(value as any);
        if (!arrayCheck.isValid) {
            return arrayCheck;
        }
        const validators: Array<(value: any[]) => ValidationResult> = [];

        // 必填验证
        if (rules.required) {
            validators.push((value: any[]) => isRequired(value));
        }

        // 最小长度验证
        if (rules.minLength !== undefined) {
            validators.push(
                conditionalRule(
                    (value: any[]) => Array.isArray(value) && value.length > 0,
                    (value: any[]) => hasMinLength(rules.minLength!)(value)
                )
            );
        }

        // 最大长度验证
        if (rules.maxLength !== undefined) {
            validators.push(
                conditionalRule(
                    (value: any[]) => Array.isArray(value),
                    (value: any[]) => hasMaxLength(rules.maxLength!)(value)
                )
            );
        }

        // 数组项验证
        if (rules.items) {
            validators.push(
                conditionalRule(
                    (value: any[]) => Array.isArray(value),
                    (value: any[]) => validateArrayItems(value, rules.items!)
                )
            );
        }

        // 自定义验证
        if (rules.custom) {
            validators.push(conditionalRule((value: any[]) => Array.isArray(value), rules.custom));
        }

        return validators.length > 0 ? allRules(...validators)(value) : createValidationSuccess();
    };
}

/**
 * 验证数组项
 */
function validateArrayItems(
    value: any[],
    itemValidator: (item: any) => ValidationResult
): ValidationResult {
    const errors: ValidationRuleError[] = [];

    for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const itemResult = itemValidator(item);

        if (!itemResult.isValid) {
            errors.push(
                ...itemResult.errors.map(error => ({
                    ...error,
                    errorCode: `ITEM_${error.errorCode}`,
                    errorParams: {
                        ...(error.errorParams || {}),
                        index: i,
                        item,
                    },
                }))
            );
        }
    }

    if (errors.length === 0) {
        return createValidationSuccess();
    }

    return {
        isValid: false,
        errors,
    };
}
