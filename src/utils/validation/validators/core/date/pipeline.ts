import { ValidationErrorContext, ValidationResult, Validator } from '../../../core';

import { checkDateType } from './type';
import { checkDateRange } from './range';
import { createCoreValidator } from '../factory';
import { checkPresence } from '../presence';

/**
 * 日期验证管道
 * 
 * 组合多个日期相关的验证函数，形成完整的日期验证流程。
 * 验证按照以下顺序执行：
 * 1. 存在性检查 - 验证值是否符合 required/nullable/empty 规则
 * 2. 类型检查 - 验证值是否为有效的日期类型
 * 3. 范围检查 - 验证日期是否在指定范围内
 * 
 * 每个验证函数都会在前一个验证通过后依次执行，
 * 任何一个验证失败都会中断后续验证并返回错误结果。
 * 
 * 注意：虽然导入了 validateBase64，但在当前管道中并未使用，
 * 可能是为了未来扩展预留或者移除未使用的导入。
 */
export const validateDate = createCoreValidator([
    // 1. 首先检查值的存在性规则（required, nullable, empty）
    checkPresence,
    
    // 2. 检查值是否为有效的日期类型（排除 Invalid Date）
    checkDateType,
    
    // 3. 检查日期是否在指定范围内（min, max）
    checkDateRange,
]);

// 将日期验证器注册到全局验证器库中，使其可以通过 'date' 类型名称调用
Validator.registerValidator('date', validateDate);