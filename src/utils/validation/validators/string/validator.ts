// src/utils/validation/validators/validator.ts
import { ExtendedStringValidationOptions, DelimitedStringValidationOptions, StringValidationOptions } from './types';
import {
    ValidationErrorCode,
    ValidationResult,
    createValidationSuccess,
    createValidationFailure,
    assertValidation,
    mergeValidationResults,
} from '../../core';
import { allRules } from '../../composition';
import {
    isString,
    getRuleFunctions,
    isFunction
} from '../../rules';
import { validateArray } from '../array';
import { validateSingleItem } from './delimited-utils'; // 新增工具函数


/**
 * 验证带分隔符的字符串
 */
function validateDelimitedString(
    processedValue: string,
    options: DelimitedStringValidationOptions
): ValidationResult {
    // 1. 分割和处理字符串
    let items = processedValue.split(options.delimiter!);
    
    if (options.trimItems) {
        items = items.map(item => item.trim());
    }
    
    if (!options.allowEmptyItems) {
        items = items.filter(item => item !== '');
    }
    
    if (options.deduplicate) {
        items = Array.from(new Set(items));
    }
    
    if (typeof options.transformItems === 'function') {
        items = options.transformItems(items);
    }

    // 2. 构建数组验证选项
    const arrayValidationOptions = {
        // 长度验证
        minLength: options.minCount,
        maxLength: options.maxCount,
        
        // 是否允许空数组
        allowEmpty: options.allowEmptyItems || processedValue === '',
        
        // 唯一性验证
        unique: options.deduplicate,
        
        // 元素验证
        itemValidation: options.itemValidation 
            ? (item: string, index: number) => validateSingleItem(item, options.itemValidation!)
            : undefined,
    };

    // 3. 调用数组验证器
    return validateArray(items, arrayValidationOptions);
}


export function validateString(
    value: any,
    options: ExtendedStringValidationOptions = {}
): ValidationResult {
    const defaultOptions: ExtendedStringValidationOptions = {
        required: false,
        nullable: false,
        trim: false,
        skipIfEmpty: false,
        ...options,
    };

    // 1. 空值处理
    if (value == null) {
        if (defaultOptions.nullable) {
            return createValidationSuccess();
        }
        if (defaultOptions.required) {
            return createValidationFailure(ValidationErrorCode.REQUIRED, {
                value,
                options: defaultOptions,
            });
        }
        return createValidationSuccess();
    }

    // 2. 类型验证
    const typeResult = isString(value);
    if (!typeResult.isValid) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING, {
            value,
            options: defaultOptions,
        });
    }

    const stringValue = value as string;

    // 3. 预处理
    let processedValue = stringValue;
    if (defaultOptions.trim) {
        processedValue = processedValue.trim();
    }
    if (defaultOptions.toLowerCase) {
        processedValue = processedValue.toLowerCase();
    }
    if (defaultOptions.toUpperCase) {
        processedValue = processedValue.toUpperCase();
    }

    // 4. 空字符串跳过验证
    if (processedValue === '' && defaultOptions.skipIfEmpty) {
        return createValidationSuccess();
    }

    // 5. 必填字段的空字符串检查
    if (defaultOptions.required && processedValue === '') {
        return createValidationFailure(ValidationErrorCode.REQUIRED, {
            processedValue,
            options: defaultOptions,
        });
    }

    // 6. 获取所有验证规则函数（自动排除非规则键）
    const rules = getRuleFunctions(defaultOptions);
    
    // 7. 添加自定义验证（custom 不会被 getRuleFunctions 包含）
    if (isFunction(defaultOptions.custom).isValid) {
        rules.push(defaultOptions.custom!);
    }


    // 8. 执行字符串基础验证
    let stringResult: ValidationResult = createValidationSuccess();
    if (rules.length > 0) {
        stringResult = allRules(...rules)(processedValue);
    }

    if(!stringResult.isValid) return stringResult; // 跳过分隔符验证


    // 9. 如果有分隔符，进行分隔符验证
    if (defaultOptions.delimiter) {
        return validateDelimitedString(processedValue, defaultOptions);
    }

    return stringResult;
    
}

/**
 * 断言字符串
 */
export function assertString(
  value: string,
  rules: ExtendedStringValidationOptions,
  context?: Record<string, any>
): string {
  const result = validateString(value, rules);
  assertValidation(result, context)
  
  return value; // 返回原始值，便于链式调用
}