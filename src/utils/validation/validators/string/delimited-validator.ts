// delimited-string.ts
import { assertValidation, ValidationResult } from '../../core';
import { validateString } from './validator';
import { validateArray } from '../array';
import { DelimitedStringValidationOptions } from './types';

/**
 * 验证带分隔符的字符串
 */
export function validateDelimitedString(
    value: any,
    options: DelimitedStringValidationOptions
): ValidationResult {
    const defaultOptions: DelimitedStringValidationOptions = {
        allowEmptyItems: false,
        trimItems: false,
        deduplicate: false,
        ...options,
    };

    // 1. 基础字符串验证
    const baseResult = validateString(value, defaultOptions);
    if (!baseResult.isValid) {
        return baseResult;
    }

    const stringValue = value as string;

    // 2. 处理空字符串
    if (stringValue === '') {
        // 空字符串会生成空数组，让数组验证器去处理
    }

    // 3. 拆分和处理字符串
    let items = stringValue.split(defaultOptions.delimiter);
    
    if (defaultOptions.trimItems) {
        items = items.map(item => item.trim());
    }
    
    if (!defaultOptions.allowEmptyItems) {
        items = items.filter(item => item !== '');
    }
    
    if (defaultOptions.deduplicate) {
        items = Array.from(new Set(items));
    }
    
    if (typeof defaultOptions.transformItems === 'function') {
        items = defaultOptions.transformItems(items);
    }

    // 4. 构建数组验证选项
    const arrayValidationOptions = {
        // 长度验证
        minLength: defaultOptions.minCount,
        maxLength: defaultOptions.maxCount,
        
        // 是否允许空数组
        allowEmpty: defaultOptions.allowEmptyItems || stringValue === '',
        
        // 唯一性验证（如果设置了deduplicate为true，那么数组本身不应该有重复）
        unique: defaultOptions.deduplicate,
        
        // 元素验证
        itemValidation: defaultOptions.itemValidation 
            ? (item: string, index: number) => validateString(item, defaultOptions.itemValidation!)
            : undefined,
    };

    // 5. 调用数组验证器
    return validateArray(items, arrayValidationOptions);
    
}

/**
 * 断言字符串
 * @param value 要验证的值
 * @param rules 验证规则
 * @param context 验证上下文 
 * @returns 
 */
export function assertDelimitedString(
  value: string,
  rules: DelimitedStringValidationOptions,
  context?: Record<string, any>
): string {
  const result = validateDelimitedString(value, rules);
  assertValidation(result, context)
  
  return value; // 返回原始值，便于链式调用
}

