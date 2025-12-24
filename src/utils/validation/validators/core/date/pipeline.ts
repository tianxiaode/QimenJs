import { ValidationErrorContext, ValidationResult, Validator } from '../../../core';

import { checkDateType } from './type';
import { checkDateRange } from './range';
import { createCoreValidator, preprocessRequiredRule } from '../factory';
import { checkPresence } from '../../common';
import { DateRuleOptions } from '@/utils/validation/rules';

/**
 * 检查日期验证规则是否需要值存在
 * 当规则中包含范围约束时，值必须存在
 * 
 * @param rule 日期验证规则
 * @returns 如果规则需要值存在则返回 true，否则返回 false
 */
const requiresDateValuesCheck = (rule: DateRuleOptions): boolean => {
    return (
        rule.min !== undefined ||
        rule.max !== undefined
    );
};

/**
 * 日期验证管道
 * 
 * 组合多个日期相关的验证函数，形成完整的日期验证流程。
 * 验证按照以下顺序执行：
 * 1. Gates检查 - 验证值的存在性规则和类型（如果任一检查失败，则后续验证不执行）
 * 2. 范围检查 - 验证日期是否在指定范围内
 *
 * Gates验证包括：
 * - 存在性检查 - 验证值是否符合 required/nullable/empty 规则
 * - 类型检查 - 验证值是否为有效的日期类型
 * 
 * 如果任一gates验证失败，后续验证将不会执行。
 * 
 * 注意：虽然导入了 validateBase64，但在当前管道中并未使用，
 * 可能是为了未来扩展预留或者移除未使用的导入。
 */
export const validateDate = createCoreValidator(
    (rule: DateRuleOptions): DateRuleOptions => {
        // 使用通用的预处理函数，传入特定于日期的检查函数
        return preprocessRequiredRule(rule, requiresDateValuesCheck);
    },
    [
        // Gates: 首先检查值的存在性规则（required, nullable, empty）
        checkPresence,
        
        // Gates: 检查值是否为有效的日期类型（排除 Invalid Date）
        checkDateType,
    ],
    [
        // 3. 检查日期是否在指定范围内（min, max）
        checkDateRange,
    ]
);

// 将日期验证器注册到全局验证器库中，使其可以通过 'date' 类型名称调用
Validator.registerValidator('date', validateDate);