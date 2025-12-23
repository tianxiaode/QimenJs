import { ValidationErrorContext, ValidationResult, Validator } from '../../../core';

import { checkStringType } from './type';
import { checkStringLength } from './length';
import { checkStringPattern } from './pattern';
import { checkStringEnum } from './enum';
import { checkPresence } from '../../common';
import { createCoreValidator } from '../factory';
import { StringRuleOptions } from '@/utils/validation/rules';
import { validatePattern } from '../../common';

/**
 * 字符串验证管道
 * 
 * 组合多个字符串相关的验证函数，形成完整的字符串验证流程。
 * 验证按照以下顺序执行：
 * 1. 存在性检查 - 验证值是否符合 required/nullable/empty 规则
 * 2. 类型检查 - 验证值是否为字符串类型
 * 3. 长度检查 - 验证字符串长度是否符合要求
 * 4. 模式检查 - 验证字符串是否匹配指定的正则表达式
 * 5. 枚举检查 - 验证字符串是否在允许的枚举值列表中
 * 
 * 每个验证函数都会在前一个验证通过后依次执行，
 * 任何一个验证失败都会中断后续验证并返回错误结果。
 */
export const validateString = createCoreValidator([
    // 1. 首先检查值的存在性规则（required, nullable, empty）
    checkPresence,
    
    // 2. 检查值是否为字符串类型
    checkStringType,
    
    // 3. 检查字符串长度是否符合要求（minLength, maxLength, exactLength）
    checkStringLength,
    
    // 4. 检查字符串是否匹配指定的正则表达式模式
    checkStringPattern,
    
    // 5. 检查字符串是否在预定义的枚举值列表中
    checkStringEnum,
],   (
        value: any,
        rule: StringRuleOptions,
        context: ValidationErrorContext = {}
    ): ValidationResult => {

        //6.附加规则检查
        return validatePattern(value, rule, context);
});

// 注册字符串验证器
Validator.registerValidator('string', validateString);