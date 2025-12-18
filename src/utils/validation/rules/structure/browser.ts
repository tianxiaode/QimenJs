// rules/structures/browser.ts
import { ValidationErrorCode } from '../../core/constants';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';

/**
 * 检查是否为 FormData 对象（浏览器环境）
 */
export function isFormData(value: any): ValidationResult {
    const isFormDataObj = typeof FormData !== 'undefined' && value instanceof FormData;

    if (isFormDataObj) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
        value,
        expected: 'FormData',
        actual: typeof value,
        errorMessage: 'Value must be a FormData object'
    });
}

/**
 * 检查是否为 URLSearchParams 对象（浏览器环境）
 */
export function isURLSearchParams(value: any): ValidationResult {
    const isURLSearchParamsObj =
        typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;

    if (isURLSearchParamsObj) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
        value,
        expected: 'URLSearchParams',
        actual: typeof value,
        errorMessage: 'Value must be a URLSearchParams object'
    });
}

/**
 * 检查是否为 File 对象（浏览器环境）
 */
export function isFile(value: any): ValidationResult {
    const isFileObj = typeof File !== 'undefined' && value instanceof File;

    if (isFileObj) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
        value,
        expected: 'File',
        actual: typeof value,
        errorMessage: 'Value must be a File object'
    });
}

/**
 * 检查是否为 Blob 对象（浏览器环境）
 */
export function isBlob(value: any): ValidationResult {
    const isBlobObj = typeof Blob !== 'undefined' && value instanceof Blob;

    if (isBlobObj) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
        value,
        expected: 'Blob',
        actual: typeof value,
        errorMessage: 'Value must be a Blob object'
    });
}