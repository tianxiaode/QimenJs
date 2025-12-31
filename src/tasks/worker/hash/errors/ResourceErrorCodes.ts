import { ErrorBase } from "@orbitjs/error";

/**
 * 🎯 资源限制错误代码枚举
 */
export const ResourceErrorCodes = {
  MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED', // 内存限制超出
  WORKER_LIMIT_EXCEEDED: 'WORKER_LIMIT_EXCEEDED', // Worker数量限制
  CPU_LIMIT_EXCEEDED: 'CPU_LIMIT_EXCEEDED',     // CPU使用限制
  TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',   // 时间限制
  CONCURRENT_LIMIT_EXCEEDED: 'CONCURRENT_LIMIT_EXCEEDED', // 并发限制
} as const;

export type ResourceErrorCode = typeof ResourceErrorCodes[keyof typeof ResourceErrorCodes];

/**
 * 🎯 资源限制错误类
 */
export class ResourceHashError extends ErrorBase {
  constructor(
    message: string,
    code: ResourceErrorCode,
    context?: {
      limit?: number;
      current?: number;
      resourceType?: string;
      suggestion?: string;
    }
  ) {
    super(message, code, context);
  }
}