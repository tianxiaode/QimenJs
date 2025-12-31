import {
    ValidationTypeNotDefinedError,
} from '../../validation/core/errors';
import { ValidationErrorContext, ValidationResult } from '../../validation/core/types';
import { Validator } from '../../validation/core/Validator';

/**
 * 同步验证函数
 * @param rules 验证规则对象，包含 type 字段指定验证器类型
 * @param value 待验证的值
 * @returns 验证结果
 */
export function validateSync(
    rules: any,
    value: any,
    context: ValidationErrorContext = {}
): ValidationResult {

    // 直接调用 ValidatorBase.executeValidator
    return Validator.executeValidator(value, rules, context);
}

/**
 * Promise形式的验证函数
 * @param rules 验证规则对象，包含 type 字段指定验证器类型
 * @param value 待验证的值
 * @returns Promise<ValidationResult>
 */
export function validatePromise(
    rules: any,
    value: any,
    context: ValidationErrorContext = {}
): Promise<ValidationResult> {
    return new Promise(resolve => {
        try {
            const result = validateSync(rules, value, context);
            resolve(result);
        } catch (error:any) {
            // 将同步函数中的错误转换为验证错误结果
            if (error instanceof ValidationTypeNotDefinedError) {
                resolve([
                    {
                        code: 'VALIDATION_TYPE_NOT_DEFINED',
                        params: { message: error.message },
                        context: { ...context, error: error.context },
                    },
                ]);
            } else {
                // 对于其他错误，也转换为 ValidationResult 格式
                resolve([
                    {
                        code: 'EXECUTION_ERROR',
                        params: { message: error.message || String(error) },
                        context: { ...context, error },
                    },
                ]);
            }
        }
    });
}

/**
 * 回调式验证函数
 * @param rules 验证规则对象，包含 type 字段指定验证器类型
 * @param value 待验证的值
 * @param callback 回调函数
 */
export function validateCallback(
    rules: any,
    value: any,
    callback: (result: ValidationResult) => void,
    context: ValidationErrorContext = {}
): void {
    try {
        const result = validateSync(rules, value, context);
        callback(result);
    } catch (error: any) {
        // 特别处理 ValidationTypeNotDefinedError
        if (error instanceof ValidationTypeNotDefinedError) {
            callback([
                {
                    code: 'VALIDATION_TYPE_NOT_DEFINED',
                    params: { message: error.message },
                    context: { ...context, error: error.context },
                },
            ]);
        } else {
            // 如果验证过程中出现其他错误，构造标准的 ValidationResult 格式
            callback([
                {
                    code: 'EXECUTION_ERROR',
                    params: { message: error.message || String(error) },
                    context: { ...context, error },
                },
            ]);
        }
    }
}