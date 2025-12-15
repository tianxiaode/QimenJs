export * from './BaseError';
export * from './InvalidInputError';


/**
 * 🎯 错误工具函数
 */
export namespace ErrorUtils {
  /**
   * 检查是否是特定类型的错误
   */
  export function isErrorOfType<T extends Error>(
    error: unknown,
    errorType: new (...args: any[]) => T
  ): error is T {
    return error instanceof errorType;
  }
  
  /**
   * 安全地抛出错误（包装非 Error 对象）
   */
  export function safeThrow(error: unknown, defaultMessage = 'Unknown error'): never {
    if (error instanceof Error) {
      throw error;
    } else if (typeof error === 'string') {
      throw new Error(error);
    } else {
      throw new Error(`${defaultMessage}: ${JSON.stringify(error)}`);
    }
  }
  
  /**
   * 创建错误映射
   */
  export function createErrorMap<T extends Record<string, string>>(errors: T) {
    return errors;
  }
}