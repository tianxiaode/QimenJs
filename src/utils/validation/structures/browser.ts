// rules/structures/browser.ts
import { ValidationErrorCode } from '../constants';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../base';

/**
 * 检查是否为 FormData 对象（浏览器环境）
 */
export function isFormData(value: any): ValidationResult {
  const isFormDataObj = typeof FormData !== 'undefined' && value instanceof FormData;
  
  if (isFormDataObj) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_FORM_DATA, { value });
}

/**
 * 检查是否为 URLSearchParams 对象（浏览器环境）
 */
export function isURLSearchParams(value: any): ValidationResult {
  const isURLSearchParamsObj = typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
  
  if (isURLSearchParamsObj) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_URL_SEARCH_PARAMS, { value });
}

/**
 * 检查是否为 File 对象（浏览器环境）
 */
export function isFile(value: any): ValidationResult {
  const isFileObj = typeof File !== 'undefined' && value instanceof File;
  
  if (isFileObj) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_FILE, { value });
}

/**
 * 检查是否为 Blob 对象（浏览器环境）
 */
export function isBlob(value: any): ValidationResult {
  const isBlobObj = typeof Blob !== 'undefined' && value instanceof Blob;
  
  if (isBlobObj) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_BLOB, { value });
}