import { ErrorBase } from '@orbitjs/error';

export class HashWorkerError extends ErrorBase {
    constructor(
        message: string,
        public readonly context?: any
    ) {
        super(`HashWorkerError: ${message}`, 'HashWorkerError', context);
        this.name = 'HashWorkerError';
    }
}
