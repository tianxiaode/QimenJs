"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaRegistrarError = void 0;
const KernelError_1 = require("./KernelError");
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
class SchemaRegistrarError extends KernelError_1.KernelError {
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
        Object.setPrototypeOf(this, SchemaRegistrarError.prototype);
    }
}
exports.SchemaRegistrarError = SchemaRegistrarError;
//# sourceMappingURL=SchemaRegistrarError.js.map