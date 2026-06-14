import { KernelError } from './KernelError';
import { KernelErrorCode } from './codes';
/**
 * 实体操作相关错误类
 *
 * 用于处理实体管理过程中的错误，如实体不存在、操作冲突等
 * 继承自KernelError，提供特定于实体操作的错误处理能力
 *
 * @example
 * ```ts
 * try {
 *   entityManager.updateEntity(entityId, newData);
 * } catch (error) {
 *   throw new EntityError(
 *     `无法更新实体: ${entityId}`,
 *     KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS,
 *     { entityId, operation: 'update', timestamp: Date.now() }
 *   );
 * }
 * ```
 */
export declare class EntityError extends KernelError {
    /**
     * 构造函数
     *
     * @param message - 错误描述信息
     * @param code - 错误代码，来自KernelErrorCode枚举
     * @param context - 可选的上下文信息，用于提供更多关于错误的详细信息
     */
    constructor(message: string, code: KernelErrorCode, context?: Record<string, any>);
}
//# sourceMappingURL=EntityError.d.ts.map