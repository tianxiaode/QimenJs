import { ErrorBase } from '@orbitjs/error';

export class WorkerInitializationError extends ErrorBase {
    constructor(
        message: string,
        public readonly originalError?: Error
    ) {
        super(`WorkerInitializationError: ${message}`, 'WORKER_INITIALIZATION_ERROR', {
            originalError,
        });
        this.name = 'WorkerInitializationError';
    }
}
