// 导入所需的工具函数、类型定义和规则选项
import {
    getValidationPattern,           // 获取预定义验证模式的正则表达式
    ValidationErrorContext,         // 验证错误上下文类型
    ValidationPatternType,          // 验证模式枚举类型
    ValidationRuleError,            // 验证规则错误类型
} from '../../../core';
import { StringRequiredRuleOptions, StringExtensionRuleOptions } from '../../../rules';     // 字符串高级规则选项类型
import { validateRequiredString } from './required';

/**
 * 使用指定的模式类型对字符串进行验证
 * 
 * 此验证器要求值必须存在且不为null，但允许空字符串
 * 如果值为 null 或 undefined，验证器将返回相应的错误
 * 
 * @param value - 待验证的字符串值
 * @param rule - 字符串高级规则选项
 * @param patternType - 要使用的验证模式类型
 * @param context - 验证错误上下文，默认为空对象
 * @returns 如果验证失败返回错误数组，否则返回null
 */
export function validateStringByPresetPattern(
    value: string,
    rule: StringRequiredRuleOptions,
    patternType: ValidationPatternType,
    context: ValidationErrorContext = {}
): ValidationRuleError[] | null {
    // 根据模式类型获取对应的正则表达式
    const pattern = getValidationPattern(patternType);
    
    // 结合传入的规则和获取的模式进行字符串高级验证
    // 使用展开运算符(...)将rule中的属性与pattern合并
    return validateRequiredString(value, { pattern: pattern, ...rule }, context);
}