import { ErrorBase } from "@orbitjs/error";

/**
 * 🎯 文件相关错误代码枚举
 */
export const FileHashErrorCodes = {
  FILE_READ_ERROR: 'FILE_READ_ERROR',           // 文件读取失败
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',             // 文件过大
  FILE_NOT_SUPPORTED: 'FILE_NOT_SUPPORTED',     // 不支持的文件类型
  CHUNK_READ_ERROR: 'CHUNK_READ_ERROR',         // 分片读取失败
  INVALID_FILE_STATE: 'INVALID_FILE_STATE',     // 无效的文件状态
} as const;

export type FileHashErrorCode = typeof FileHashErrorCodes[keyof typeof FileHashErrorCodes];

/**
 * 🎯 文件相关错误类
 */
export class FileHashError extends ErrorBase {
  constructor(
    message: string,
    code: FileHashErrorCode,
    context?: {
      fileName?: string;
      fileSize?: number;
      chunkIndex?: number;
      offset?: number;
      originalError?: Error;
    }
  ) {
    super(message, code, context);
  }
}