import {
    RulePresenceOptions,
    ValidationErrorBuilder,
    ValidationErrorContext,
    ValidationResult,
    Validator,
} from '../../../core';
import { checkPresence } from './check';

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
    return ValidationErrorBuilder.normalizeResult(checkPresence(value, rule, context));
}

// 将存在性验证器注册到验证器基础类中，使其可以被全局使用
Validator.registerValidator('presence', validatePresence);
