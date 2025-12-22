import {
    isEmptyValue,
    RulePresenceOptions,
    ValidationErrorBuilder,
    ValidationErrorContext,
    ValidationResult,
} from '../../core';
import { Validator } from '../../core/Validator';

/**
 * 验证值的存在性规则
 * 
 * @param value - 需要验证的值
 * @param rule - 存在性验证规则选项
 * @param context - 验证错误上下文信息
 * @returns 验证结果，成功返回null，失败返回错误信息数组
 */
export function validatePresence(
    value: any,
    rule: RulePresenceOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 解构规则选项，设置默认值
    const { required = false, nullable = true, empty = true } = rule;

    // 1️⃣ required：检查值是否必须存在（不能为undefined或null）
    if (required) {
        if (value === undefined || value === null) {
            return [ValidationErrorBuilder.required(context)];
        }
    }

    // 2️⃣ nullable：检查是否允许值为null
    if (value === null && !nullable) {
        return [ValidationErrorBuilder.invalid_value(value, context)];
    }

    // 3️⃣ empty：检查是否允许空值（如空字符串、空数组等）
    if (!empty && isEmptyValue(value)) {
        return [ValidationErrorBuilder.invalid_value(value, context)];
    }

    // 所有验证通过
    return null;
}

// 将存在性验证器注册到验证器基础类中，使其可以被全局使用
Validator.registerValidator('presence', validatePresence);