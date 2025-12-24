import {
    ValidationErrorBuilder,
    ValidationErrorContext,
    ValidationResult,
    ValidationRuleError,
    Validator,
} from '../../../core';
import { ArrayRuleOptions } from '../../../rules';
import { checkArrayType } from './type';
import { checkArrayLength } from './length';
import { checkArrayEnum } from './enum';
import { createCoreValidator, preprocessRequiredRule } from '../factory';
import { checkPresence } from '../../common';
import { normalizeChildRule } from '../convert';

/**
 * 检查数组验证规则是否需要值存在
 * 当规则中包含长度或枚举约束时，值必须存在
 * 
 * @param rule 数组验证规则
 * @returns 如果规则需要值存在则返回 true，否则返回 false
 */
const requiresArrayValuesCheck = (rule: ArrayRuleOptions): boolean => {
    return (
        rule.maxLength !== undefined ||
        rule.minLength !== undefined ||
        rule.exactLength !== undefined ||
        rule.enum !== undefined 
    );
};

/**
 * 数组验证器 - 组合多个验证函数形成完整的数组验证管道
 * 
 * 验证顺序：
 * 1. 存在性检查 (checkPresence)
 * 2. 类型检查 (checkArrayType) 
 * 3. 长度检查 (checkArrayLength)
 * 4. 枚举值检查 (checkArrayEnum)
 * 5. 子元素验证 (自定义逻辑)
 */
export const validateArray = createCoreValidator(
    (rule: ArrayRuleOptions): ArrayRuleOptions => {
        // 使用通用的预处理函数，传入特定于数组的检查函数
        return preprocessRequiredRule(rule, requiresArrayValuesCheck);
    },
    // 基础验证器列表，按顺序执行
    [checkPresence, checkArrayType, checkArrayLength, checkArrayEnum],
    
    /**
     * 自定义验证逻辑 - 主要用于验证数组中的每个子元素
     * 
     * @param value - 待验证的数组值
     * @param rule - 数组验证规则选项
     * @param context - 验证上下文
     * @returns 验证结果
     */
    (value: any, rule: ArrayRuleOptions, context: ValidationErrorContext = {}): ValidationResult => {
        // 如果值不是数组或者没有定义子元素规则，则跳过子元素验证
        if (!Array.isArray(value) || !rule.childRule) return null;
        
        // 获取并标准化子元素验证规则
        const childRule = rule.childRule;
        const validate = normalizeChildRule(childRule);

        // 是否需要收集所有子元素错误（true）还是遇到第一个错误就停止（false）
        const allChildsError = rule.allChildsError;
        let errors: ValidationRuleError[] = [];
        
        // 遍历数组中的每个元素进行验证
        for (let i = 0; i < value.length; i++) {
            // 为每个子元素创建独立的验证上下文，包括路径信息
            const itemContext = {
                ...context,
                path: context.path ? `${context.path}[${i}]` : `[${i}]`,
                parent: value,
            };
            
            // 执行子元素验证
            const result = validate(value[i], rule, itemContext);
            
            // 根据 allChildsError 设置决定如何处理错误：
            // 如果为 false 且有错误，则立即返回第一个错误
            // 如果为 true，则收集所有错误
            if (result && !allChildsError) {
                return result;
            } else {
                errors = errors.concat(result || []);
            }
        }
        
        // 标准化并返回所有收集到的错误
        return ValidationErrorBuilder.normalizeResult(errors);
    }
);

// 注册数组验证器
Validator.registerValidator('array', validateArray);