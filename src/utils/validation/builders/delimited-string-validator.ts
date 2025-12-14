import { ValidationResult, DelimitedStringValidationRules } from '../base';
import { ValidationErrorCode } from '../constants';
import { isEmpty } from '../constraints';
import { isString, isRequired } from '../primitives';
import { matchesPattern } from '../patterns';
import { allRules, conditionalRule } from '../composition';
import { buildArrayValidator } from './array-validator';
import { createValidationSuccess, createValidationFailure } from '../base/results';

/**
 * 构建分隔符分隔的字符串验证器
 * @param rules 分隔符字符串验证规则配置
 * @returns 验证函数
 */
export function buildDelimitedStringValidator(
    rules: DelimitedStringValidationRules
): (value: string) => ValidationResult {
    const validators: Array<(value: string) => ValidationResult> = [];

    // 类型检查
    validators.push((value: string) => isString(value));

    // 必填验证
    if (rules.required) {
        validators.push((value: string) => isRequired(value));
    }

    // 分隔符字符串特定验证
    validators.push(
        conditionalRule(
            (value: string) => !isEmpty(value).isValid,
            (value: string) => validateDelimitedString(value, rules)
        )
    );

    return allRules(...validators);
}

/**
 * 验证分隔符分隔的字符串
 */
function validateDelimitedString(
    value: string,
    rules: DelimitedStringValidationRules
): ValidationResult {
    // 分割字符串
    let items = value.split(rules.delimiter || ',');

    // 处理项
    if (rules.trimItems !== false) {
        items = items.map(item => item.trim());
    }

    // 构建数组验证规则
    const arrayValidationRules: any = {};

    // 设置数组长度规则
    if (rules.minItems !== undefined) {
        arrayValidationRules.minLength = rules.minItems;
    }

    if (rules.maxItems !== undefined) {
        arrayValidationRules.maxLength = rules.maxItems;
    }

    // 设置数组项验证规则
    if (rules.itemMinLength !== undefined || rules.itemMaxLength !== undefined || rules.itemPattern || rules.validateItem) {
        arrayValidationRules.items = (item: any) => {
            const errors: any[] = [];
            
            // 项长度验证
            if (rules.itemMinLength !== undefined && item.length < rules.itemMinLength) {
                errors.push(createValidationFailure(ValidationErrorCode.ITEM_MIN_LENGTH, {
                    item,
                    itemLength: item.length,
                    itemMinLength: rules.itemMinLength,
                    errorMessage: `Each item must be at least ${rules.itemMinLength} characters long`
                }));
            }

            if (rules.itemMaxLength !== undefined && item.length > rules.itemMaxLength) {
                errors.push(createValidationFailure(ValidationErrorCode.ITEM_MAX_LENGTH, {
                    item,
                    itemLength: item.length,
                    itemMaxLength: rules.itemMaxLength,
                    errorMessage: `Each item must be no more than ${rules.itemMaxLength} characters long`
                }));
            }

            // 项模式验证
            if (rules.itemPattern) {
                const patternResult = matchesPattern(rules.itemPattern)(item);
                if (!patternResult.isValid) {
                    errors.push(patternResult);
                }
            }

            // 自定义单项验证
            if (rules.validateItem) {
                const customResult = rules.validateItem(item);
                if (!customResult.isValid) {
                    errors.push(customResult);
                }
            }

            if (errors.length > 0) {
                // 合并所有错误
                return {
                    isValid: false,
                    errors: errors.flatMap(e => e.errors)
                };
            }

            return createValidationSuccess();
        };
    }

    // 使用数组验证器验证分割后的数组
    const arrayValidator = buildArrayValidator(arrayValidationRules);
    const arrayResult = arrayValidator(items);

    // 处理空项检查（这是分隔符字符串特有的逻辑）
    if (!rules.allowEmptyItems) {
        const emptyItems = items.filter(item => item === '');
        if (emptyItems.length > 0) {
            const emptyItemsError = createValidationFailure(ValidationErrorCode.EMPTY_ITEMS_NOT_ALLOWED, {
                value,
                emptyItemsCount: emptyItems.length,
                errorMessage: 'Empty items are not allowed'
            });
            
            return emptyItemsError;
        }
    }

    return arrayResult;
}