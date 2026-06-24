"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerInitializationError = void 0;
const error_1 = require("@orbitjs/error");
/**
 * Worker初始化错误类
 *
 * 当Web Worker初始化失败时抛出此错误。此错误类保存了原始错误信息，
 * 便于调试Worker创建过程中遇到的问题。
 */
class WorkerInitializationError extends error_1.ErrorBase {
    /**
     * 构造函数
     *
     * @param message - 错误消息，描述初始化失败的原因
     * @param originalError - 可选参数，原始错误对象，用于进一步的错误诊断
     */
    constructor(message, originalError) {
        super(`WorkerInitializationError: ${message}`, 'WORKER_INITIALIZATION_ERROR', {
            originalError,
        });
        this.originalError = originalError;
        this.name = 'WorkerInitializationError';
    }
    /**
     * 重写toJSON方法以包含originalError
     */
    toJSON() {
        const baseJson = super.toJSON();
        return {
            ...baseJson,
            originalError: this.originalError
        };
    }
}
exports.WorkerInitializationError = WorkerInitializationError;
//# sourceMappingURL=WorkerInitializationError.js.map