import { ValidationErrorCode } from '../../core/constants';
import { isEmpty } from '../existence';
import { isString } from '../types';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';

/**
 * 检查值是否可迭代（实现了 Symbol.iterator）
 */
export function isIterable(value: any): ValidationResult {
    // isEmpty 成功表示值为 null/undefined，这时不可迭代
    const emptyCheck = isEmpty(value);
    const isValid = !emptyCheck.isValid && typeof value[Symbol.iterator] === 'function';

    if (isValid) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
        value,
        expected: 'iterable',
        actual: typeof value,
        errorMessage: 'Value must be iterable',
    });
}

/**
 * 检查值是否为可迭代对象（但不是字符串）
 */
export function isIterableButNotString(value: any): ValidationResult {
    const iterableCheck = isIterable(value);
    const stringCheck = isString(value);

    const isValid = iterableCheck.isValid && !stringCheck.isValid;

    if (isValid) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
        value,
        expected: 'iterable but not string',
        actual: typeof value,
        errorMessage: 'Value must be iterable but not a string',
    });
}

/**
 * 检查是否为类数组对象（有 length 属性）
 */
export function isArrayLike(value: any): ValidationResult {
    // 特殊处理字符串 - 它们是类数组的
    if (typeof value === 'string') {
        return createValidationSuccess();
    }

    const isValid =
        value != null &&
        typeof value === 'object' &&
        typeof value.length === 'number' &&
        value.length >= 0 &&
        (value.length === 0 || (value.length > 0 && value.length - 1 in value));

    if (isValid) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
        value,
        expected: 'array-like',
        actual: typeof value,
        errorMessage: 'Value must be array-like',
    });
}
