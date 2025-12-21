// 导入所需的工具函数和类型定义
import {
    getValidationPattern,           // 获取预定义的验证模式正则表达式
    normalizeValidationResult,      // 标准化验证结果
    ValidationErrorContext,         // 验证错误上下文类型
    ValidationPatternType,          // 验证模式枚举类型
    ValidationRuleError,            // 验证规则错误类型
    ValidatorBase,                  // 验证器基类
} from '../../../core';
import { PasswordRuleOptions } from '@/utils/validation/rules';  // 密码规则选项类型
import { validateStringExtension } from './extension';              // 字符串高级验证函数
import { validatePattern } from '../../common';                 // 模式验证函数

/**
 * 验证密码是否符合指定规则
 * 
 * @param value - 待验证的值
 * @param rule - 密码验证规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 如果验证失败返回错误数组，否则返回null
 */
export function validatePassword(
    value: any,
    rule: PasswordRuleOptions,
    context: ValidationErrorContext = {}
): ValidationRuleError[] | null {
    // 先执行字符串高级验证（如长度、必填等）
    const validateStringResult = validateStringExtension(value, rule, context);
    if (validateStringResult) {
        // 如果字符串验证失败，直接返回错误结果
        return validateStringResult;
    }

    // 初始化错误数组
    const errors: ValidationRuleError[] = [];
    
    // 定义需要检查的密码模式类型
    const patterns = [
        ValidationPatternType.UPPERCASE,      // 大写字母
        ValidationPatternType.LOWERCASE,      // 小写字母
        ValidationPatternType.DIGIT,          // 数字
        ValidationPatternType.SPECIAL_CHAR,   // 特殊字符
    ];

    // 依次验证每个模式要求
    for (const p of patterns) {
        // 获取对应模式的正则表达式
        let pattern = getValidationPattern(p);
        // 执行模式验证
        const patternResult = validatePattern(value, { pattern: pattern }, context);
        if (patternResult) {
            // 如果验证失败，将错误添加到错误数组中
            errors.push(...patternResult);
        }
    }

    // 标准化并返回验证结果
    return normalizeValidationResult(errors);
}

// 注册密码验证器到验证器基类中
ValidatorBase.registerValidator('password', validatePassword);