import {
    ValidationErrorBuilder,
    ValidationErrorContext,
    ValidationResult,
    Validator,
} from '../../../core';
import { ObjectRuleOptions } from '../../../rules';
import { validateObject } from '../../core';

/**
 * 验证给定值是否为空对象（即不包含任何可枚举属性的对象）
 * 
 * @param value - 需要验证的值
 * @param rule - 对象验证规则选项
 * @param context - 验证上下文，包含路径和其他元数据
 * @returns 验证结果，如果验证失败则返回错误数组，否则返回 null
 */
export function validateEmptyObject(
    value: any,
    rule: ObjectRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 首先执行基本的对象类型验证
    const baseResult = validateObject(value, rule, context);
    // 如果基本验证失败，直接返回验证结果
    if (baseResult) return baseResult;
    
    // 获取对象的所有可枚举属性键
    const keys = Object.keys(value);
    
    // 如果对象有属性（不是空对象），验证失败，返回 null 表示通过验证
    if (keys.length > 0) return null;
    
    // 如果是空对象，创建并返回验证错误
    return [ValidationErrorBuilder.invalid_value('empty object', context)];
}

// 将空对象验证器注册到全局验证器基础类中，使其可以通过 'emptyObject' 名称调用
Validator.registerValidator('emptyObject', validateEmptyObject);