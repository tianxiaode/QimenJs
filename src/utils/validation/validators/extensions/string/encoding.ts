// 导入所需的工具函数、类型定义和规则选项
import {
    ValidationErrorContext,         // 验证错误上下文类型
    ValidationPatternType,          // 验证模式枚举类型
    ValidationResult,               // 验证结果类型
    Validator,                  // 验证器基类
} from '../../../core';
import { StringRequiredRuleOptions } from '../../../rules';       // 字符串高级规则选项类型
import { validateStringByPresetPattern } from './pattern';        // 使用指定模式进行验证的函数

/**
 * 验证Base64编码格式是否正确
 * 
 * 此验证器要求值必须存在且不为null，但允许空字符串
 * 如果值为 null 或 undefined，验证器将返回相应的错误
 * 
 * @param value - 待验证的Base64编码字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validateBase64(
    value: string,
    rule: StringRequiredRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用BASE64模式对Base64编码进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.BASE64, context);
}

// 注册Base64验证器到验证器基类中
Validator.registerValidator('base64', validateBase64);