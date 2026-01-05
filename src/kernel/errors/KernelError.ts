import { ErrorBase } from "@orbitjs/error";
import { KernelErrorCode } from "./codes";
/**
 * Kernel 通用错误类
 */
export class KernelError extends ErrorBase {
    constructor(message: string, code: KernelErrorCode, context?: Record<string, any>) {
        super(message, code, context);
    }
}

