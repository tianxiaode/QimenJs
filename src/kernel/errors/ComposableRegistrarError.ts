import { KernelErrorCode } from "./codes";
import { KernelError } from "./KernelError";

/**
 * Composable注册器相关错误类
 */
export class ComposableRegistrarError extends KernelError {
    constructor(message: string, code: KernelErrorCode, context?: Record<string, any>) {
        super(message, code, context);
    }
}