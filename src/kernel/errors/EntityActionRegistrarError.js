"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityActionRegistrarError = void 0;
const KernelError_1 = require("./KernelError");
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
class EntityActionRegistrarError extends KernelError_1.KernelError {
    /**
     * 构造函数
     *
     * @param message - 错误描述信息
     * @param code - 错误代码，来自KernelErrorCode枚举
     * @param context - 可选的上下文信息，用于提供更多关于错误的详细信息
     */
    constructor(message, code, context) {
        super(message, code, context);
        // 保持正确的原型链
        Object.setPrototypeOf(this, EntityActionRegistrarError.prototype);
    }
}
exports.EntityActionRegistrarError = EntityActionRegistrarError;
//# sourceMappingURL=EntityActionRegistrarError.js.map