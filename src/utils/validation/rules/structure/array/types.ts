import { ValidationErrorCode } from '../../../core';
import { isArray,isString, isNumber, isBoolean, isObject, isFunction } from '../../types';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../../core';

/**
 * 检查数组元素类型
 */
export function hasItemType<T>(
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function'
): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            let isValid = true;

            switch (type) {
                case 'string':
                    isValid = isString(item).isValid;
                    break;
                case 'number':
                    isValid = isNumber(item).isValid;
                    break;
                case 'boolean':
                    isValid = isBoolean(item).isValid;
                    break;
                case 'object':
                    isValid = isObject(item).isValid;
                    break;
                case 'array':
                    isValid = isArray(item).isValid;
                    break;
                case 'function':
                    isValid = isFunction(item).isValid;
                    break;
            }

            if (!isValid) {
                return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                    index: i,
                    value: item,
                    expected: type,
                    actual: typeof item,
                });
            }
        }

        return createValidationSuccess();
    };
}

/**
 * 使用自定义函数检查数组元素类型
 */
export function hasItemTypeCheck<T>(
    checkFn: (item: any) => boolean
): (value: T[]) => ValidationResult {
    return (value: T[]): ValidationResult => {
        if (!isArray(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { value });
        }

        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (!checkFn(item)) {
                return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
                    index: i,
                    value: item,
                    actualValue: item,
                });
            }
        }

        return createValidationSuccess();
    };
}