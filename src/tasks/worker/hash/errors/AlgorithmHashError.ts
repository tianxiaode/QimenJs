import { ErrorBase } from "@orbitjs/error";

/**
 * 🎯 算法计算错误代码枚举
 */
export const AlgorithmHashErrorCodes = {
  ALGORITHM_EXECUTION_ERROR: 'ALGORITHM_EXECUTION_ERROR', // 算法执行错误
  INVALID_ALGORITHM: 'INVALID_ALGORITHM',       // 无效的算法函数
  ALGORITHM_TIMEOUT: 'ALGORITHM_TIMEOUT',       // 算法计算超时
  CHUNK_COMPUTE_ERROR: 'CHUNK_COMPUTE_ERROR',   // 分片计算错误
  MERGE_ERROR: 'MERGE_ERROR',                   // 结果合并错误
  INVALID_OUTPUT: 'INVALID_OUTPUT',             // 无效的输出格式
} as const;

export type AlgorithmHashErrorCode = typeof AlgorithmHashErrorCodes[keyof typeof AlgorithmHashErrorCodes];

/**
 * 🎯 算法计算错误类
 */
export class AlgorithmHashError extends ErrorBase {
  constructor(
    message: string,
    code: AlgorithmHashErrorCode,
    context?: {
      chunkIndex?: number;
      dataSize?: number;
      algorithmName?: string;
      originalError?: Error;
    }
  ) {
    super(message, code, context);
  }
}