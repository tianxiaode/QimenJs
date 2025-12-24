import { ValidationErrorContext, ValidationResult, Validator } from '../../../core';

import { checkBooleanType } from './type';
import { checkBooleanEnum } from './enum';
import { checkPresence } from '../../common';
import { createCoreValidator, preprocessRequiredRule } from '../factory';
import { BooleanRuleOptions } from '@/utils/validation/rules';

/**
 * 检查布尔值验证规则是否需要值存在
 * 当规则中包含枚举约束时，值必须存在
 * 
 * @param rule 布尔值验证规则
 * @returns 如果规则需要值存在则返回 true，否则返回 false
 */
const requiresBooleanValuesCheck = (rule: BooleanRuleOptions): boolean => {
    return (
        rule.enum !== undefined
    );
};

/**
 * 布尔值验证管道
 * 
 * 组合多个布尔值相关的验证函数，形成完整的布尔值验证流程。
 * 验证按照以下顺序执行：
 * 1. 存在性检查 - 验证值是否符合 required/nullable/empty 规则
 * 2. 类型检查 - 验证值是否为布尔类型
 * 3. 枚举检查 - 验证布尔值是否在允许的枚举值列表中
 * 
 * 每个验证函数都会在前一个验证通过后依次执行，
 * 任何一个验证失败都会中断后续验证并返回错误结果。
 */
export const validateBoolean = createCoreValidator(
    (rule: BooleanRuleOptions): BooleanRuleOptions => {
        // 使用通用的预处理函数，传入特定于布尔值的检查函数
        return preprocessRequiredRule(rule, requiresBooleanValuesCheck);
    },
    [
        // 1. 首先检查值的存在性规则（required, nullable, empty）
        checkPresence,
        
        // 2. 检查值是否为布尔类型（true 或 false）
        checkBooleanType,
        
        // 3. 检查布尔值是否在预定义的枚举值列表中
        checkBooleanEnum,
    ]
);

// 将布尔值验证器注册到全局验证器库中，使其可以通过 'boolean' 类型名称调用
Validator.registerValidator('boolean', validateBoolean);