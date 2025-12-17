import { ValidationErrorCode } from '../../core';
import { isString, isArray, isObject, isMap, isSet } from '../types';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';

/**
 * 通用大小验证，可用于数组/对象/Map/Set
 * @param value 
 * @param min 
 * @param max 
 */
export function hasSize(value: any, min: number, max: number): ValidationResult {
    let size: number | undefined;
    
    if (isArray(value).isValid) {
        size = value.length;
    } else if (isMap(value).isValid || isSet(value).isValid) {
        size = value.size;
    } else if (isObject(value).isValid) {
        size = Object.keys(value).length;
    }
    
    if (size === undefined) {
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_HAS_SIZE, { value });
    }
    
    if (size >= min && size <= max) {
        return createValidationSuccess();
    }
    
    return createValidationFailure(ValidationErrorCode.SIZE_OUT_OF_RANGE, {
        value,
        min,
        max,
        actualSize: size
    });
}