import { validateArray } from '../array';
import { StringValidationOptions } from './types';
import { allRules } from '../../composition';
import { getRuleFunctions, isFunction } from '../../rules';
import { ValidationResult, createValidationSuccess } from '../../core';

/**
 * 处理分隔符字符串验证的核心逻辑
 */
export function validateItems(
    items: string[],
    options: {
        minCount?: number;
        maxCount?: number;
        allowEmpty?: boolean;
        unique?: boolean;
        itemValidation?: StringValidationOptions;
    }
): ValidationResult {
    // 构建数组验证选项
    const arrayValidationOptions = {
        // 长度验证
        minLength: options.minCount,
        maxLength: options.maxCount,

        // 是否允许空数组
        allowEmpty: options.allowEmpty || false,

        // 唯一性验证
        unique: options.unique,

        // 元素验证
        itemValidation: options.itemValidation
            ? (item: string, index: number) => validateSingleItem(item, options.itemValidation!)
            : undefined,
    };

    return validateArray(items, arrayValidationOptions);
}

/**
 * 验证单个分隔项
 */
export function validateSingleItem(
    item: string,
    itemOptions: StringValidationOptions
): ValidationResult {
    const rules = getRuleFunctions(itemOptions);

    if (isFunction(itemOptions.custom).isValid) {
        rules.push(itemOptions.custom!);
    }

    return rules.length > 0 ? allRules(...rules)(item) : createValidationSuccess();
}

/**
 * 处理分隔符分割
 */
export function splitAndProcess(
    value: string,
    delimiter: string,
    options: {
        trimItems?: boolean;
        allowEmptyItems?: boolean;
        deduplicate?: boolean;
        transformItems?: (items: string[]) => string[];
    }
): string[] {
    let items = value.split(delimiter);

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

    return items;
}
