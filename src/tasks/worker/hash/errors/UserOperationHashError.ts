import { ErrorBase } from "@orbitjs/error";


/**
 * 🎯 用户操作错误代码枚举
 */
export const UserOperationErrorCodes = {
  OPERATION_CANCELLED: 'OPERATION_CANCELLED',   // 操作被取消
  OPERATION_PAUSED: 'OPERATION_PAUSED',         // 操作已暂停
  INVALID_OPERATION: 'INVALID_OPERATION',       // 无效的操作
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',   // 配置错误
} as const;

export type UserOperationErrorCode = typeof UserOperationErrorCodes[keyof typeof UserOperationErrorCodes];

/**
 * 🎯 用户操作错误类
 */
export class UserOperationHashError extends ErrorBase {
  constructor(
    message: string,
    code: UserOperationErrorCode,
    context?: {
      currentState?: string;
      operation?: string;
      progress?: number;
    }
  ) {
    super(message, code, context);
  }
}