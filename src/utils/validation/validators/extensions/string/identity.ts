// 导入所需的规则选项和核心验证工具
import { StringExtensionRuleOptions } from '../../../rules';                    // 字符串高级规则选项类型
import {
    ValidationErrorContext,         // 验证错误上下文类型
    ValidationPatternType,          // 验证模式枚举类型
    ValidationResult,               // 验证结果类型
    ValidatorBase,                  // 验证器基类
} from '../../../core';
import { validateStringByPresetPattern } from './pattern';                     // 使用指定模式进行验证的函数

/**
 * 验证邮箱地址格式是否正确
 * 
 * @param value - 待验证的邮箱地址字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validateEmail(
    value: string,
    rule: StringExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用EMAIL模式对邮箱地址进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.EMAIL, context);
}

/**
 * 验证电话号码格式是否正确
 * 
 * @param value - 待验证的电话号码字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validatePhone(
    value: string,
    rule: StringExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用PHONE模式对电话号码进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.PHONE, context);
}

/**
 * 验证用户名格式是否正确
 * 
 * @param value - 待验证的用户名字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validateUsername(
    value: string,
    rule: StringExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用USERNAME模式对用户名进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.USERNAME, context);
}

/**
 * 验证UUID格式是否正确
 * 
 * @param value - 待验证的UUID字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validateUUID(
    value: string,
    rule: StringExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用UUID模式对UUID进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.UUID, context);
}

/**
 * 验证信用卡号格式是否正确
 * 
 * @param value - 待验证的信用卡号字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validateCreditCard(
    value: string,
    rule: StringExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用CREDIT_CARD模式对信用卡号进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.CREDIT_CARD, context);
}

/**
 * 验证中国身份证号格式是否正确
 * 
 * @param value - 待验证的中国身份证号字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validateChineseID(
    value: string,
    rule: StringExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用CHINESE_ID模式对中国身份证号进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.CHINESE_ID, context);
}

/**
 * 验证中国邮政编码格式是否正确
 * 
 * @param value - 待验证的中国邮政编码字符串
 * @param rule - 字符串高级规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果
 */
export function validateChinesePostcode(
    value: string,
    rule: StringExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 使用CHINESE_POSTCODE模式对中国邮政编码进行验证
    return validateStringByPresetPattern(value, rule, ValidationPatternType.CHINESE_POSTCODE, context);
}

// 注册各种身份验证器到验证器基类中
ValidatorBase.registerValidator('email', validateEmail);                // 注册邮箱验证器
ValidatorBase.registerValidator('phone', validatePhone);                // 注册电话验证器
ValidatorBase.registerValidator('username', validateUsername);          // 注册用户名验证器
ValidatorBase.registerValidator('uuid', validateUUID);                  // 注册UUID验证器
ValidatorBase.registerValidator('creditCard', validateCreditCard);      // 注册信用卡验证器
ValidatorBase.registerValidator('chineseID', validateChineseID);        // 注册中国身份证验证器
ValidatorBase.registerValidator('chinesePostcode', validateChinesePostcode); // 注册中国邮编验证器