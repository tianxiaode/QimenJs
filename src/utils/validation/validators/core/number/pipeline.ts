import { ValidationErrorContext, ValidationResult, ValidatorBase } from '../../../core';

import { checkNumberType } from './type';
import { checkNumberInteger } from './integer';
import { checkNumberRange } from './range';
import { checkNumberEnum } from './enum';
import { checkPresence } from '../presence';
import { createCoreValidator } from '../factory';

/**
 * 数字验证管道
 * 
 * 组合多个数字相关的验证函数，形成完整的数字验证流程。
 * 验证按照以下顺序执行：
 * 1. 存在性检查 - 验证值是否符合 required/nullable/empty 规则
 * 2. 类型检查 - 验证值是否为有效的数字类型
 * 3. 整数检查 - 验证数字是否为整数（如果规则要求）
 * 4. 范围检查 - 验证数字是否在指定范围内
 * 5. 枚举检查 - 验证数字是否在允许的枚举值列表中
 * 
 * 每个验证函数都会在前一个验证通过后依次执行，
 * 任何一个验证失败都会中断后续验证并返回错误结果。
 */
export const validateNumber = createCoreValidator([
    // 1. 首先检查值的存在性规则（required, nullable, empty）
    checkPresence,
    
    // 2. 检查值是否为有效的数字类型（排除 NaN 和 Infinity）
    checkNumberType,
    
    // 3. 检查数字是否为整数（如果规则要求）
    checkNumberInteger,
    
    // 4. 检查数字是否在指定范围内（min, max, exclusiveMin, exclusiveMax）
    checkNumberRange,
    
    // 5. 检查数字是否在预定义的枚举值列表中
    checkNumberEnum,
]);

// 将数字验证器注册到全局验证器库中，使其可以通过 'number' 类型名称调用
ValidatorBase.registerValidator('number', validateNumber);