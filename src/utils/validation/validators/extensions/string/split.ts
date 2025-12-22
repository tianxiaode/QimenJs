// 导入所需的工具函数、类型定义和规则选项
import { validateString } from '../../core/string';                         // 基础字符串验证函数
import {
    ValidationErrorBuilder,          // 验证错误构建器
    ValidationErrorContext,         // 验证错误上下文类型
    ValidationResult,               // 验证结果类型
    ValidationRuleError,            Validator,            // 验证规则错误类型
} from '../../../core';
import { StringSplitRuleOptions } from '../../../rules';                   // 字符串拆分规则选项类型
import { validateStringExtension } from './extension';                        // 字符串高级验证函数

/**
 * 验证拆分后的字符串数组是否符合指定规则
 * 
 * @param value - 待验证的值
 * @param rule - 字符串拆分规则选项
 * @param context - 验证错误上下文，默认为空对象
 * @returns 验证结果，验证通过返回null，验证失败返回错误信息数组
 */
export function validateStringSplit(
    value: any,
    rule: StringSplitRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 1️⃣ 确保是字符串
    const baseError = validateString(value, { ...rule, required: true, nullable: false }, context);
    if (baseError) return baseError;

    const str = value as string;

    // 2️⃣ 按照指定分隔符拆分字符串为数组
    let items = str.split(rule.separator);

    // 如果需要去除空格，则对每个项目进行trim操作
    if (rule.trim) {
        items = items.map(v => v.trim());
    }

    // 3️⃣ 空项校验：检查是否允许空项目
    if (!rule.allowEmptyItem) {
        const hasEmpty = items.some(v => v === '');
        if (hasEmpty) {
            return [
                ValidationErrorBuilder.invalid_value(str, {
                    ...context,
                    expected: 'non-empty items',
                }),
            ];
        }
    }

    // 4️⃣ 数量校验：检查拆分后的项目数量是否符合要求
    if (rule.minItems !== undefined && items.length < rule.minItems) {
        return [ValidationErrorBuilder.too_small(rule.minItems, items.length, false, context)];
    }

    if (rule.maxItems !== undefined && items.length > rule.maxItems) {
        return [ValidationErrorBuilder.too_large(rule.maxItems, items.length, false, context)];
    }

    // 5️⃣ 子项验证（核心价值）：对拆分后的每个子项进行验证
    if (rule.itemRule) {
        // allItemsError控制是否收集所有错误还是遇到第一个错误就返回
        const allItemsErrors = rule.allItemsError ?? false;
        const errors: ValidationRuleError[] = [];
        
        for (let i = 0; i < items.length; i++) {
            // 对每个子项应用验证规则，并传递正确的路径上下文
            const itemError = validateStringExtension(items[i], rule.itemRule, {
                ...context,
                path: context?.path ? `${context.path}[${i}]` : `[${i}]`,
            });

            if (itemError) {
                // 如果不需要收集所有错误，应该返回当前错误而不是errors数组
                if (!allItemsErrors) {
                    return itemError; // 修复：原代码中此处返回了errors（未定义的变量）
                }
                errors.push(...itemError);
            }
        }
        // 返回标准化的验证结果
        return ValidationErrorBuilder.normalizeResult(errors);
    }

    // 所有验证通过
    return null;
}

Validator.registerValidator('split', validateStringSplit);