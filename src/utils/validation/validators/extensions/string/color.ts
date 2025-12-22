// 导入所需的工具函数、类型定义和规则选项
import {
    ValidationErrorContext,         // 验证错误上下文类型
    ValidationPatternType,          // 验证模式枚举类型
    ValidationResult,               // 验证结果类型
    Validator,                  // 验证器基类
} from '../../../core';
import { StringExtensionRuleOptions } from '../../../rules';       // 字符串高级规则选项类型
import { validateStringByPresetPattern } from './pattern';        // 使用指定模式进行验证的函数

/**
 * 验证十六进制颜色值格式是否正确
 * 
 * @param value - 待验证的十六进制颜色值字符串（如 #FF0000）
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validateHexColor(
    value: string,
    rule: StringExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用HEX_COLOR模式对十六进制颜色值进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.HEX_COLOR, context);
}

/**
 * 验证RGB颜色值格式是否正确
 * 
 * @param value - 待验证的RGB颜色值字符串（如 rgb(255, 0, 0)）
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validateRGBColor(
    value: string,
    rule: StringExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用RGB_COLOR模式对RGB颜色值进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.RGB_COLOR, context);
}

/**
 * 验证RGBA颜色值格式是否正确
 * 
 * @param value - 待验证的RGBA颜色值字符串（如 rgba(255, 0, 0, 0.5)）
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validateRGBAColor(
    value: string,
    rule: StringExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用RGBA_COLOR模式对RGBA颜色值进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.RGBA_COLOR, context);
}

// 注册颜色验证器到验证器基类中
Validator.registerValidator('hexColor', validateHexColor);   // 注册十六进制颜色验证器
Validator.registerValidator('rgbColor', validateRGBColor);   // 注册RGB颜色验证器
Validator.registerValidator('rgbaColor', validateRGBAColor); // 注册RGBA颜色验证器