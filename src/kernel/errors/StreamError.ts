import { KernelErrorCode } from "./codes";
import { KernelError } from "./KernelError";

/**
 * 流式请求相关错误类
 */
export class StreamError extends KernelError {
    constructor(message: string, code: KernelErrorCode, context?: Record<string, any>) {
        super(message, code, context);
    }
}