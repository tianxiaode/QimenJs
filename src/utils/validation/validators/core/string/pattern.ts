import { ValidationErrorBuilder, ValidationErrorContext, CheckResult } from '../../../core';
import { StringRuleOptions } from '../../../rules';

/**
 * 检查字符串模式匹配
 * 
 * 使用正则表达式验证字符串是否符合指定的模式要求。
 * 如果字符串不匹配给定的正则表达式模式，则返回模式不匹配错误。
 * 
 * @param value - 需要验证的字符串值
 * @param rule - 字符串验证规则，应包含 pattern 属性（正则表达式）
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回模式不匹配错误对象
 */
export function checkStringPattern(
    value: string,
    rule: StringRuleOptions,
    context?: ValidationErrorContext
): CheckResult {
    // 如果规则中没有定义 pattern 属性，则跳过模式验证
    if (!rule.pattern) return null;

    // 使用正则表达式的 test 方法检查字符串是否匹配模式
    if (!rule.pattern.test(value)) {
        // 字符串不匹配指定的正则表达式模式，返回模式不匹配错误
        // 使用 pattern.source 获取正则表达式的源文本作为错误信息的一部分
        return ValidationErrorBuilder.pattern_mismatch(rule.pattern.source, value, context);
    }

    // 字符串匹配模式，验证通过
    return null;
}