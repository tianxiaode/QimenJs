// rules/constraints/empty.ts
import { ValidationErrorCode } from '../constants';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../base';

/**
 * 检查字符串是否为空
 */
export function isEmptyString(value: any): ValidationResult {
    if (typeof value !== 'string') {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING, { value });
    }

    if (value.trim().length === 0) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 检查数组是否为空
 */
export function isEmptyArray(value: any): ValidationResult {
    if (!Array.isArray(value)) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_ARRAY, { value });
    }

    if (value.length === 0) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 检查对象是否为空
 */
export function isEmptyObject(value: any): ValidationResult {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_OBJECT, { value });
    }

    if (Object.keys(value).length === 0) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 检查 Map 是否为空
 */
export function isEmptyMap(value: any): ValidationResult {
    if (!(value instanceof Map)) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_MAP, { value });
    }

    if (value.size === 0) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 检查 Set 是否为空
 */
export function isEmptySet(value: any): ValidationResult {
    if (!(value instanceof Set)) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_SET, { value });
    }

    if (value.size === 0) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}

/**
 * 通用检查：值是否为空
 */
export function isEmpty(value: any): ValidationResult {
    // 检查 null 或 undefined
    if (value === null || value === undefined) {
        return createValidationSuccess();
    }

    // 检查字符串
    if (typeof value === 'string') {
        return isEmptyString(value);
    }

    // 检查数组
    if (Array.isArray(value)) {
        return isEmptyArray(value);
    }

    // 检查 Map
    if (value instanceof Map) {
        return isEmptyMap(value);
    }

    // 检查 Set
    if (value instanceof Set) {
        return isEmptySet(value);
    }

    // 检查对象
    if (typeof value === 'object') {
        return isEmptyObject(value);
    }

    // 其他类型视为非空
    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, { value });
}