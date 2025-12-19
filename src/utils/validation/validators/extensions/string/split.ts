import { validateString } from '../../core/string';
import { ValidationErrorBuilder, ValidatorResult } from '../../../core';
import { StringSplitRule } from '../../../rules';

export function validateStringSplit(
    value: any,
    rule: StringSplitRule,
    context?: any
): ValidatorResult {
    // 1️⃣ 确保是字符串
    const baseError = validateString(value, { ...rule, required: true, nullable: false }, context);
    if (baseError && baseError.length > 0) return baseError[0];

    const str = value as string;

    // 2️⃣ 拆分
    let items = str.split(rule.separator);

    if (rule.trim) {
        items = items.map(v => v.trim());
    }

    // 3️⃣ 空项校验
    if (!rule.allowEmptyItem) {
        const hasEmpty = items.some(v => v === '');
        if (hasEmpty) {
            return ValidationErrorBuilder.invalid_value(str, {
                ...context,
                expected: 'non-empty items',
            });
        }
    }

    // 4️⃣ 数量校验
    if (rule.minItems !== undefined && items.length < rule.minItems) {
        return ValidationErrorBuilder.too_small(rule.minItems, items.length, false, context);
    }

    if (rule.maxItems !== undefined && items.length > rule.maxItems) {
        return ValidationErrorBuilder.too_large(rule.maxItems, items.length, false, context);
    }

    // 5️⃣ 子项验证（核心价值）
    if (rule.itemRule) {
        for (let i = 0; i < items.length; i++) {
            const itemError = validateString(items[i], rule.itemRule, {
                ...context,
                path: context?.path ? `${context.path}[${i}]` : `[${i}]`,
            });

            if (itemError && itemError.length > 0) {
                return itemError[0];
            }
        }
    }

    return null;
}
