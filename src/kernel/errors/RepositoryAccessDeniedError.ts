import { KernelErrorCode } from './codes';
import { KernelError } from './KernelError';

/**
 * 权限专用错误 (方便在 catch 时进行 instanceOf 判断)
 */
export class RepositoryAccessDeniedError extends KernelError {
    constructor(domain: string, action: string, context?: Record<string, any>) {
        const msg = `Access denied for action "${action}" in domain "${domain}"`;
        super(msg, KernelErrorCode.ACCESS_DENIED, { domain, action, ...context });
    }
}
