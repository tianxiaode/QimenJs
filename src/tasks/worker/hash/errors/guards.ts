
import { ErrorBase } from "@orbitjs/error";
import { FileHashError } from './FileHashError';
import { WorkerHashError } from './WorkerHashErrorCodes';
import { AlgorithmHashError } from './AlgorithmHashError';
import { UserOperationHashError } from './UserOperationHashError';
import { ResourceHashError } from './ResourceErrorCodes';

/**
 * 🎯 错误类型守卫函数
 */
export const HashErrorGuards = {
  isFileHashError: (error: any): error is FileHashError => 
    error instanceof FileHashError,
  
  isWorkerHashError: (error: any): error is WorkerHashError => 
    error instanceof WorkerHashError,
  
  isAlgorithmHashError: (error: any): error is AlgorithmHashError => 
    error instanceof AlgorithmHashError,
  
  isUserOperationHashError: (error: any): error is UserOperationHashError => 
    error instanceof UserOperationHashError,
  
  isResourceHashError: (error: any): error is ResourceHashError => 
    error instanceof ResourceHashError,
  
  isHashError: (error: any): error is ErrorBase => 
    error instanceof ErrorBase,
};

/**
 * 🎯 错误恢复策略接口
 */
export interface ErrorRecoveryStrategy {
  maxRetries: number;                    // 最大重试次数
  retryDelay: number;                    // 重试延迟（ms）
  shouldRetry: (error: ErrorBase) => boolean; // 是否应该重试
  onRetry: (error: ErrorBase, attempt: number) => void; // 重试回调
}

/**
 * 🎯 默认错误恢复策略
 */
export const DefaultErrorRecoveryStrategy: ErrorRecoveryStrategy = {
  maxRetries: 3,
  retryDelay: 100,
  shouldRetry: (error: ErrorBase) => {
    // 可以重试的错误类型
    const retryableCodes = [
      'CHUNK_READ_ERROR',
      'WORKER_TIMEOUT',
      'ALGORITHM_TIMEOUT',
    ];
    return retryableCodes.includes(error.code as any);
  },
  onRetry: (error, attempt) => {
    console.warn(`Retrying after error (attempt ${attempt}/${3}):`, error.message);
  },
};