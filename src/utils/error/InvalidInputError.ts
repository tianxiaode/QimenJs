import { BaseError } from './BaseError';

/**
 * 🎯 无效输入错误
 * 当输入参数不符合预期时抛出
 */
export class InvalidInputError extends BaseError {
    constructor(
        message: string, // 消息作为第一个参数
        code: string | number, // 代码作为第二个参数
        context?: Record<string, any> // 上下文作为第三个参数
    ) {
        super(message, code, context);
        this.name = 'InvalidInputError';
    }

    /**
     * 快速创建字段验证错误
     */
    static forField(field: string, message: string, value?: any): InvalidInputError {
        return new InvalidInputError(`${field}: ${message}`, 'INVALID_FIELD', { field, value });
    }

    /**
     * 创建类型错误
     */
    static forType(field: string, expected: string, actual: any): InvalidInputError {
        return new InvalidInputError(
            `${field} must be ${expected}, got ${typeof actual}`, // 消息作为第一个参数
            'TYPE_MISMATCH', // 错误代码作为第二个参数
            { field, expected, actual } // 上下文作为第三个参数
        );
    }

    /**
     * 创建范围错误
     */
    static forRange(field: string, min?: number, max?: number, actual?: number): InvalidInputError {
        let message = `${field} is out of range`;
        const context: Record<string, any> = { field, actual };

        if (min !== undefined && max !== undefined) {
            message += ` (expected between ${min} and ${max})`;
            context.min = min;
            context.max = max;
        } else if (min !== undefined) {
            message += ` (expected at least ${min})`;
            context.min = min;
        } else if (max !== undefined) {
            message += ` (expected at most ${max})`;
            context.max = max;
        }

        return new InvalidInputError(message, 'OUT_OF_RANGE', context);
    }
}
