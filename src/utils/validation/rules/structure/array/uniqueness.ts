import { ValidationErrorCode } from '../../../core';
import { isArray } from '../../types';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../../core';

/**
 * 检查数组是否唯一（无重复元素）
 */
export function hasUniqueItems(): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        const seen = new Set<any>();
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (seen.has(item)) {
                return createValidationFailure(ValidationErrorCode.DUPLICATE, {
                    index: i,
                    value: item,
                    duplicateOfIndex: Array.from(seen).indexOf(item),
                });
            }
            seen.add(item);
        }

        return createValidationSuccess();
    };
}

/**
 * 根据指定函数检查数组是否唯一
 */
export function hasUniqueItemsBy<T>(selector: (item: T) => any): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        const seen = new Set<any>();
        const seenByKey = new Map<any, number>();

        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const key = selector(item);

            if (seen.has(key)) {
                const firstIndex = seenByKey.get(key)!;
                return createValidationFailure(ValidationErrorCode.DUPLICATE, {
                    index: i,
                    value: item,
                    duplicateOfIndex: firstIndex,
                    duplicateKey: key,
                });
            }

            seen.add(key);
            seenByKey.set(key, i);
        }

        return createValidationSuccess();
    };
}