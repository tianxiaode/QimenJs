import { ErrorBase } from '@orbitjs/error';

export class RepositoryFlowAbortedError extends ErrorBase {
    constructor(message: string, context?: Record<string, any>) {
        const code = 'REPO_ABORTED';

        super(message, code, context);

    // 维护正确的原型链
    Object.setPrototypeOf(this, RepositoryFlowAbortedError.prototype);        
    }
}
