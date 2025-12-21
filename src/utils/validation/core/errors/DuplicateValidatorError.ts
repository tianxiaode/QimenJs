// 新建文件 DuplicateValidatorError.ts
import { BaseError } from '../../../error';

/**
 * 重复注册验证器错误
 * 当尝试注册已存在的验证器时抛出此错误
 */
export class DuplicateValidatorError extends BaseError {
    constructor(
        validatorKey: string, // 验证器键名
        existingValidatorInfo?: string, // 已存在验证器的信息
        context?: Record<string, any> // 上下文信息（可选）
    ) {
        const message = existingValidatorInfo
            ? `Validator with key "${validatorKey}" is already registered. Existing validator: ${existingValidatorInfo}`
            : `Validator with key "${validatorKey}" is already registered.`;

        super(message, 'DUPLICATE_VALIDATOR', {
            validatorKey,
            existingValidatorInfo,
            ...context,
        });
    }
}
