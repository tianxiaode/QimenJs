import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from "../../core";


export function validateFormDate(value:any, _rule:any, context?:ValidationErrorContext): ValidatorResult {
    const isFormDataObj = typeof FormData !== 'undefined' && value instanceof FormData;
    if(!isFormDataObj){
        return ValidationErrorBuilder.type_mismatch('FormData', typeof value, context);
    }
    return null;
}

export function validateURLSearchParams(value:any, _rule:any, context?:ValidationErrorContext): ValidatorResult {
    const isURLSearchParamsObj = typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
    if(!isURLSearchParamsObj){
        return ValidationErrorBuilder.type_mismatch('URLSearchParams', typeof value, context);
    }
    return null;    
}

export function validateBlob(value:any, _rule:any, context?:ValidationErrorContext): ValidatorResult {
    const isBlobObj = typeof Blob !== 'undefined' && value instanceof Blob;
    if(!isBlobObj){
        return ValidationErrorBuilder.type_mismatch('Blob', typeof value, context);
    }
    return null;
}

export function validateFile(value:any, _rule:any, context?:ValidationErrorContext): ValidatorResult {
    const isFileObj = typeof File !== 'undefined' && value instanceof File;
    if(!isFileObj){
        return ValidationErrorBuilder.type_mismatch('File', typeof value, context);
    }
    return null;
}