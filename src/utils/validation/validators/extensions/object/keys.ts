import {
    ValidationErrorBuilder,
    ValidationErrorContext,
    ValidationResult,
    ValidationRuleError,
    Validator,
} from '../../../core';
import { ObjectKeysRuleOptions } from '../../../rules';
import { validateObject } from '../../core';
import { validateRequiredObject } from './required';

/**
 * 验证对象是否包含指定的必需键
 *
 * @param value - 需要验证的值
 * @param rule - 对象键验证规则选项，包含必需的键列表
 * @param context - 验证上下文，包含路径和其他元数据
 * @returns 验证结果，如果验证失败则返回错误数组，否则返回 null
 */
export function validateHasKeys(
    value: any,
    rule: ObjectKeysRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 首先执行基本的对象类型验证
    const baseResult = validateRequiredObject(value, rule, context);
    // 如果基本验证失败，直接返回验证结果
    if (baseResult) return baseResult;

    const allErrors = rule.allErrors ?? false;

    // 检查 keys 是否为有效类型（字符串或数组）
    if (typeof rule.keys !== 'string' && !Array.isArray(rule.keys)) {
        return [ValidationErrorBuilder.invalid_value('invalid keys', context)];
    }

    // 处理空键列表的情况
    if (!rule.keys || (Array.isArray(rule.keys) && rule.keys.length === 0)) {
        return null; // 没有指定必需键，验证通过
    }

    const errors: ValidationRuleError[] = [];

    // 统一处理 keys 为数组格式
    const keys = typeof rule.keys === 'string' ? [rule.keys] : rule.keys;

    // 遍历每个必需键，检查是否存在
    for (const key of keys) {
        // 使用 hasOwnProperty 检查对象自身是否具有指定属性
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
            if (allErrors) {
                // 收集所有错误
                errors.push(ValidationErrorBuilder.missing_field(key, context));
            } else {
                // 立即返回第一个错误
                return [ValidationErrorBuilder.missing_field(key, context)];
            }
        }
    }
    return ValidationErrorBuilder.normalizeResult(errors);
}

// 将键验证器注册到全局验证器基础类中，使其可以通过 'hasKeys' 名称调用
Validator.registerValidator('hasKeys', validateHasKeys);
