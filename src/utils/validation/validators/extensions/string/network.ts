// 导入所需的类型定义和工具函数
import { RequiredStringRuleOptions, StringExtensionRuleOptions } from '../../../rules';                    // 字符串高级规则选项类型
import {
    ValidationErrorContext,         // 验证错误上下文类型
    ValidationPatternType,          // 验证模式枚举类型
    ValidationResult,               // 验证结果类型
    ValidationRuleError,
    Validator,            // 验证规则错误类型
} from '../../../core';
import { validateStringByPresetPattern } from './pattern';                     // 使用指定模式进行验证的函数

/**
 * 验证URL格式是否正确
 * 
 * 此验证器要求值必须存在且不为null，但允许空字符串
 * 如果值为 null 或 undefined，验证器将返回相应的错误
 * 
 * @param value - 待验证的URL字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validateUrl(
    value: string,
    rule: RequiredStringRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用指定的URL模式进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.URL, context);
}

/**
 * 验证IPv4地址格式是否正确
 * 
 * 此验证器要求值必须存在且不为null，但允许空字符串
 * 如果值为 null 或 undefined，验证器将返回相应的错误
 * 
 * @param value - 待验证的IPv4地址字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 如果验证失败返回错误数组，否则返回null
 */
export function validateIPv4(
    value: string,
    rule: RequiredStringRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用指定的IPv4模式进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.IPV4, context);
}

/**
 * 验证IPv6地址格式是否正确
 * 
 * 此验证器要求值必须存在且不为null，但允许空字符串
 * 如果值为 null 或 undefined，验证器将返回相应的错误
 * 
 * @param value - 待验证的IPv6地址字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，可选参数
 * @returns 如果验证失败返回错误数组，否则返回null
 */
export function validateIPv6(
    value: string,
    rule: RequiredStringRuleOptions,
    context?: ValidationErrorContext
): ValidationResult {
    // 使用指定的IPv6模式进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.IPV6, context);
}

/**
 * 验证MAC地址格式是否正确
 * 
 * 此验证器要求值必须存在且不为null，但允许空字符串
 * 如果值为 null 或 undefined，验证器将返回相应的错误
 * 
 * @param value - 待验证的MAC地址字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，可选参数
 * @returns 如果验证失败返回错误数组，否则返回null
 */
export function validateMacAddress(
    value: string,
    rule: RequiredStringRuleOptions,
    context?: ValidationErrorContext
): ValidationResult {
    // 使用指定的MAC地址模式进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.MAC_ADDRESS, context);
}

Validator.registerValidator('url', validateUrl);
Validator.registerValidator('ipv4', validateIPv4);
Validator.registerValidator('ipv6', validateIPv6);
Validator.registerValidator('macAddress', validateMacAddress);