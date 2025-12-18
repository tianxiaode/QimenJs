import { ValidationErrorCode } from '../../core';
import { isString, isArray, isObject, isMap, isSet } from '../types';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';

/**
 * 通用大小验证，可用于数组/对象/Map/Set
 * 
 * 支持的数据类型：
 * - 数组 (Array)
 * - 对象 (Object)
 * - Map
 * - Set
 * 
 * @param value 要验证的值
 * @param min 最小大小
 * @param max 最大大小
 * @returns ValidationResult 验证结果
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
        return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, { 
            value,
            expected: 'type with size property (Array, Object, Map, or Set)',
            actual: typeof value,
            errorMessage: 'Value must have a size property'
        });
    }
    
    if (size >= min && size <= max) {
        return createValidationSuccess();
    }
    
    if (size < min) {
        return createValidationFailure(ValidationErrorCode.TOO_SMALL, {
            value,
            min,
            actual: size,
            actualSize: size,
            errorMessage: `Size must be at least ${min}, but got ${size}`
        });
    }
    
    return createValidationFailure(ValidationErrorCode.TOO_LARGE, {
        value,
        max,
        actual: size,
        actualSize: size,
        errorMessage: `Size must be at most ${max}, but got ${size}`
    });
}