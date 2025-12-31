import { ErrorBase } from "@orbitjs/error";

export class AlgorithmExecutionError extends ErrorBase {
  constructor(
    message: string,
    context?: {
      phase: 'init' | 'update' | 'digest'
      chunkIndex?: number
      originalError?: unknown
    }
  ) {
    super(message, 'ALGORITHM_ERROR', context);
  }
}
