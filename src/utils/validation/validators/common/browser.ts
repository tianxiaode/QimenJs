import { ValidationErrorBuilder, ValidationErrorContext, ValidationResult } from '../../core';
import { ValidatorBase } from '../../core/ValidatorBase';

export function validateFormDate(
    value: any,
    _rule: {},
    context: ValidationErrorContext = {}
): ValidationResult {
    const isFormDataObj = typeof FormData !== 'undefined' && value instanceof FormData;
    if (!isFormDataObj) {
        return [ValidationErrorBuilder.type_mismatch('FormData', typeof value, context)];
    }
    return null;
}

export function validateURLSearchParams(
    value: any,
    _rule: {},
    context: ValidationErrorContext = {}
): ValidationResult {
    const isURLSearchParamsObj =
        typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
    if (!isURLSearchParamsObj) {
        return [ValidationErrorBuilder.type_mismatch('URLSearchParams', typeof value, context)];
    }
    return null;
}

export function validateBlob(
    value: any,
    _rule: {},
    context: ValidationErrorContext = {}
): ValidationResult {
    const isBlobObj = typeof Blob !== 'undefined' && value instanceof Blob;
    if (!isBlobObj) {
        return [ValidationErrorBuilder.type_mismatch('Blob', typeof value, context)];
    }
    return null;
}

export function validateFile(
    value: any,
    _rule: {},
    context: ValidationErrorContext = {}
): ValidationResult {
    const isFileObj = typeof File !== 'undefined' && value instanceof File;
    if (!isFileObj) {
        return [ValidationErrorBuilder.type_mismatch('File', typeof value, context)];
    }
    return null;
}

ValidatorBase.registerValidator('formData', validateFormDate);
ValidatorBase.registerValidator('urlSearchParams', validateURLSearchParams);
ValidatorBase.registerValidator('blob', validateBlob);
ValidatorBase.registerValidator('file', validateFile);
