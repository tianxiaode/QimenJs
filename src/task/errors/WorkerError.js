"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerError = void 0;
const error_1 = require("@orbitjs/error");
/**
 * Worker相关错误类
 *
 * 用于处理与Worker管理相关的错误，包括启动失败、通信错误等
 * 继承自ErrorBase，提供了错误代码和上下文信息
 */
class WorkerError extends error_1.ErrorBase {
    /**
     * 构造函数
     *
     * @param message - 错误消息，描述具体的错误原因
     * @param context - 可选参数，提供与错误相关的上下文信息
     */
    constructor(message, context) {
        super(message, 'WORKER_ERROR', context);
        // 保持正确的原型链
        Object.setPrototypeOf(this, WorkerError.prototype);
    }
}
exports.WorkerError = WorkerError;
//# sourceMappingURL=WorkerError.js.map