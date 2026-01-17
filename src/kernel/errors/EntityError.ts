import { KernelError } from './KernelError';
import { KernelErrorCode } from './codes';

/**
 * 实体操作相关错误类
 */
export class EntityError extends KernelError {
    constructor(message: string, code: KernelErrorCode, context?: Record<string, any>) {
        super(message, code, context);
    }
}

