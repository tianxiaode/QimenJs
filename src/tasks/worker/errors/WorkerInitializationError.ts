import { BaseError } from '@orbitjs/error';

export class WorkerInitializationError extends BaseError {
  constructor(message: string, public readonly originalError?: Error) {
    super(`WorkerInitializationError: ${message}`, { originalError });
    this.name = 'WorkerInitializationError';
  }
}