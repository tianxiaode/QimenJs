import { BaseError } from '@orbitjs/error';

export class AlgorithmNotSupportedError extends BaseError {
  constructor(algorithm: string, public readonly algorithmName: string) {
    super(`AlgorithmNotSupportedError: Algorithm "${algorithm}" is not supported in this environment`);
    this.name = 'AlgorithmNotSupportedError';
  }
}