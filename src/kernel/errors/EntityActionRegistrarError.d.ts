import { KernelError } from './KernelError';
import { KernelErrorCode } from './codes';
/**
 * EntityActionRegistrar错误类
 *
 * 用于表示EntityActionRegistrar操作过程中发生的错误
 *
 * @example
 * ```ts
 * // 创建一个错误实例
 * const error = new EntityActionRegistrarError(
 *   'Action not found: myAction',
 *   KernelErrorCode.ACTION_NOT_FOUND
 * );
 *
 * // 创建带有上下文信息的错误
 * const errorWithContext = new EntityActionRegistrarError(
 *   'Failed to register action',
 *   KernelErrorCode.ACTION_REGISTRATION_FAILED,
 *   { actionName: 'myAction', reason: 'duplicate name' }
 * );
 * ```
 */
export declare class EntityActionRegistrarError extends KernelError {
    /**
     * 构造函数
     *
     * @param message - 错误描述信息
     * @param code - 错误代码，来自KernelErrorCode枚举
     * @param context - 可选的上下文信息，用于提供更多关于错误的详细信息
     */
    constructor(message: string, code: KernelErrorCode, context?: Record<string, any>);
}
//# sourceMappingURL=EntityActionRegistrarError.d.ts.map