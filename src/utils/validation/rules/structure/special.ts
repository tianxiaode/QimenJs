// rules/structures/special.ts
import { ValidationErrorCode } from '../../core/constants';
import { isEmpty } from '../existence';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';

/**
 * 检查是否为 Promise 对象
 */
export function isPromise(value: any): ValidationResult {
    const isPromiseObj =
        value instanceof Promise ||
        (value &&
            typeof value === 'object' &&
            typeof value.then === 'function' &&
            typeof value.catch === 'function');

    if (isPromiseObj) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_NOT_PROMISE, { value });
}

/**
 * 检查是否为 Error 对象
 */
export function isError(value: any): ValidationResult {
    if (value instanceof Error) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_NOT_ERROR, { value });
}

/**
 * 检查值是否为类 Promise 对象（有 then 方法）
 */
export function isThenable(value: any): ValidationResult {
    // 修改这里：使用 isEmpty 并反转逻辑
    const emptyCheck = isEmpty(value);
    const isValid = 
        !emptyCheck.isValid && // 值不为空（即不为 null 或 undefined）
        typeof value === 'object' && 
        typeof value.then === 'function';

    if (isValid) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_NOT_THENABLE, { value });
}

/**
 * 检查是否为异步函数
 */
export function isAsyncFunction(value: any): ValidationResult {
    const isValid =
        typeof value === 'function' &&
        value.constructor &&
        value.constructor.name === 'AsyncFunction';

    if (isValid) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_NOT_ASYNC_FUNCTION, { value });
}

/**
 * 检查是否为生成器函数
 */
export function isGeneratorFunction(value: any): ValidationResult {
    const isValid =
        typeof value === 'function' &&
        value.constructor &&
        value.constructor.name === 'GeneratorFunction';

    if (isValid) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_NOT_GENERATOR_FUNCTION, { value });
}

/**
 * 检查是否为纯对象（plain object，通过 {} 或 new Object() 创建）
 */
export function isPlainObject(value: any): ValidationResult {
    // 首先检查基本类型
    if (typeof value !== 'object' || value === null) {
        return {
            isValid: false,
            errors: [
                {
                    errorCode: ValidationErrorCode.TYPE_NOT_OBJECT,
                    errorParams: { value },
                },
            ],
        };
    }

    // 检查原型链
    const proto = Object.getPrototypeOf(value);
    const isValid = proto === null || proto === Object.prototype;

    if (isValid) {
        return { isValid: true, errors: [] };
    }

    return {
        isValid: false,
        errors: [
            {
                errorCode: ValidationErrorCode.TYPE_NOT_PLAIN_OBJECT,
                errorParams: { value },
            },
        ],
    };
}
