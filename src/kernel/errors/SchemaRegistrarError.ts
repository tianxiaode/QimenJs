import { KernelError } from './KernelError';
import { KernelErrorCode } from './codes';

/**
 * SchemaRegistrar错误类
 * 
 * 用于表示SchemaRegistrar操作过程中发生的错误
 * 
 * @example
 * ```ts
 * // 创建一个错误实例
 * const error = new SchemaRegistrarError(
 *   'Schema not found: mySchema',
 *   KernelErrorCode.SCHEMA_NOT_FOUND
 * );
 * 
 * // 创建带有上下文信息的错误
 * const errorWithContext = new SchemaRegistrarError(
 *   'Failed to register schema',
 *   KernelErrorCode.SCHEMA_REGISTRATION_FAILED,
 *   { schemaName: 'mySchema', reason: 'invalid format' }
 * );
 * ```
 */
export class SchemaRegistrarError extends KernelError {
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
    Object.setPrototypeOf(this, SchemaRegistrarError.prototype);
  }
}