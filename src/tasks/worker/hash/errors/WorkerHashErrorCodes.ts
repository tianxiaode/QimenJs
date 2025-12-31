import { ErrorBase } from "@orbitjs/error";

/**
 * 🎯 Worker相关错误代码枚举
 */
export const WorkerHashErrorCodes = {
  WORKER_INIT_ERROR: 'WORKER_INIT_ERROR',       // Worker初始化失败
  WORKER_TIMEOUT: 'WORKER_TIMEOUT',             // Worker响应超时
  WORKER_CRASHED: 'WORKER_CRASHED',             // Worker崩溃
  WORKER_COMMUNICATION_ERROR: 'WORKER_COMMUNICATION_ERROR', // 通信错误
  WORKER_SCRIPT_ERROR: 'WORKER_SCRIPT_ERROR',   // Worker脚本错误
  WORKER_POOL_FULL: 'WORKER_POOL_FULL',         // Worker池已满
} as const;

export type WorkerHashErrorCode = typeof WorkerHashErrorCodes[keyof typeof WorkerHashErrorCodes];

/**
 * 🎯 Worker相关错误类
 */
export class WorkerHashError extends ErrorBase {
  constructor(
    message: string,
    code: WorkerHashErrorCode,
    context?: {
      workerId?: number;
      taskId?: string;
      originalError?: Error;
      workerUrl?: string;
    }
  ) {
    super(message, code, context);
  }
}