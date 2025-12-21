import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { StringRuleOptions } from '../../../rules';

/**
 * 检查字符串长度
 * 
 * 根据规则配置验证字符串长度是否符合要求，支持三种长度限制：
 * 1. 精确长度 (exactLength)
 * 2. 最小长度 (minLength)
 * 3. 最大长度 (maxLength)
 * 
 * 验证优先级：exactLength > minLength + maxLength
 * 如果设置了精确长度，则只检查精确长度，忽略其他长度限制
 * 
 * @param value - 需要验证的字符串值
 * @param rule - 字符串长度验证规则
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回相应的错误对象
 */
export function checkStringLength(
    value: string,
    rule: StringRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 检查精确长度限制：如果设置了精确长度且当前值长度不匹配
    if (rule.exactLength !== undefined && value.length !== rule.exactLength) {
        // 返回无效值错误，期望值为指定的精确长度
        return ValidationErrorBuilder.invalid_value(rule.exactLength, context);
    }

    // 检查最小长度限制：如果设置了最小长度且当前值长度小于最小长度
    if (rule.minLength !== undefined && value.length < rule.minLength) {
        // 返回值太小错误
        return ValidationErrorBuilder.too_small(rule.minLength, context);
    }

    // 检查最大长度限制：如果设置了最大长度且当前值长度大于最大长度
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        // 返回值太大错误
        return ValidationErrorBuilder.too_large(rule.maxLength, context);
    }

    // 所有长度检查通过
    return null;
}