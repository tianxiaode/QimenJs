import { ValidationErrorContext, ValidationResult, Validator } from '../../../core';

import { checkNumberType } from './type';
import { checkNumberInteger } from './integer';
import { checkNumberRange } from './range';
import { checkNumberEnum } from './enum';
import { checkPresence } from '../../common';
import { createCoreValidator, preprocessRequiredRule } from '../factory';
import { NumberRuleOptions } from '@/utils/validation/rules';

/**
 * 检查数字验证规则是否需要值存在
 * 当规则中包含范围或枚举约束时，值必须存在
 * 
 * @param rule 数字验证规则
 * @returns 如果规则需要值存在则返回 true，否则返回 false
 */
const requiresNumberValuesCheck = (rule: NumberRuleOptions): boolean => {
    return (
        rule.min !== undefined ||
        rule.max !== undefined ||
        rule.exclusiveMin !== undefined ||
        rule.exclusiveMax !== undefined ||
        rule.enum !== undefined ||
        rule.integer !== undefined
    );
};

/**
 * 数字验证管道
 *
 * 组合多个数字相关的验证函数，形成完整的数字验证流程。
 * 验证按照以下顺序执行：
 * 1. Gates检查 - 验证值的存在性规则和类型（如果任一检查失败，则后续验证不执行）
 * 2. 整数检查 - 验证数字是否为整数（如果规则要求）
 * 3. 范围检查 - 验证数字是否在指定范围内
 * 4. 枚举检查 - 验证数字是否在允许的枚举值列表中
 *
 * Gates验证包括：
 * - 存在性检查 - 验证值是否符合 required/nullable/empty 规则
 * - 类型检查 - 验证值是否为有效的数字类型
 * 
 * 如果任一gates验证失败，后续验证将不会执行。
 */
export const validateNumber = createCoreValidator(
    (rule: NumberRuleOptions): NumberRuleOptions => {
        // 使用通用的预处理函数，传入特定于数字的检查函数
        return preprocessRequiredRule(rule, requiresNumberValuesCheck);
    },
    [
        // Gates: 首先检查值的存在性规则（required, nullable, empty）
        checkPresence,

        // Gates: 检查值是否为有效的数字类型（排除 NaN 和 Infinity）
        checkNumberType,
    ],
    [
        // 3. 检查数字是否为整数（如果规则要求）
        checkNumberInteger,

        // 4. 检查数字是否在指定范围内（min, max, exclusiveMin, exclusiveMax）
        checkNumberRange,

        // 5. 检查数字是否在预定义的枚举值列表中
        checkNumberEnum,
    ]
);

// 将数字验证器注册到全局验证器库中，使其可以通过 'number' 类型名称调用
Validator.registerValidator('number', validateNumber);