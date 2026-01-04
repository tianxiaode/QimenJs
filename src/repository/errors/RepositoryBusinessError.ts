import { ErrorBase } from "@orbitjs/error";

export class RepositoryBusinessError extends ErrorBase {
    constructor(message: string, context?: Record<string, any>) {
        const code = 'REPO_BUSINESS_ERROR';

        super(message, code, context);

        // 维护正确的原型链
        Object.setPrototypeOf(this, RepositoryBusinessError.prototype);
    }
}
