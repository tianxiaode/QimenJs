import { BaseError } from '@orbitjs/error';

export class HashWorkerError extends BaseError {
  constructor(message: string, public readonly context?: any) {
    super(`HashWorkerError: ${message}`, context);
    this.name = 'HashWorkerError';
  }
}