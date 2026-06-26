import { ErrorBase } from "./ErrorBase";
import { KernelErrorCode } from "./codes";

/**
 * Kernel 通用错误类
 * 
 * 作为内核模块所有特定错误类型的基类，继承自ErrorBase
 * 提供统一的错误处理机制和上下文信息支持
 * 
 * @example
 * ```ts
 * // 创建一个简单的错误
 * const error = new KernelError('操作失败', KernelErrorCode.STREAM_REQUEST_FAILED);
 * 
 * // 创建带有上下文信息的错误
 * const errorWithContext = new KernelError('流请求失败', KernelErrorCode.STREAM_REQUEST_FAILED, {
 *   url: 'https://api.example.com/data',
 *   method: 'GET',
 *   statusCode: 404
 * });
 * ```
 */
export class KernelError extends ErrorBase {
  /**
   * 构造函数
   * 
   * @param message - 错误描述信息
   * @param code - 错误代码，来自KernelErrorCode枚举
   * @param context - 可选的上下文信息，用于提供更多关于错误的详细信息
   */
  constructor(message: string, code: KernelErrorCode, context?: Record<string, any>) {
    super(message, code, context);
    
    // 保持正确的原型链
    Object.setPrototypeOf(this, KernelError.prototype);
  }
}
