import { ErrorBase } from '@orbitjs/error';

export class EntityManagerFlowAbortedError extends ErrorBase {
    constructor(message: string, context?: Record<string, any>) {
        const code = 'ENTITY_MANAGER_ABORTED';

        super(message, code, context);

    // 维护正确的原型链
    Object.setPrototypeOf(this, EntityManagerFlowAbortedError.prototype);        
    }
}