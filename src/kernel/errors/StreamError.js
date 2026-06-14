"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamError = void 0;
const KernelError_1 = require("./KernelError");
/**
 * 流式请求相关错误类
 *
 * 用于处理流式数据请求和处理过程中的错误
 * 继承自KernelError，提供特定于流式请求的错误处理能力
 *
 * @example
 * ```ts
 * try {
 *   await streamClient.requestStream(url);
 * } catch (error) {
 *   throw new StreamError(
 *     `流请求失败: ${url}`,
 *     KernelErrorCode.STREAM_REQUEST_FAILED,
 *     { url, method: 'GET', startTime: Date.now(), endTime: Date.now() }
 *   );
 * }
 * ```
 */
class StreamError extends KernelError_1.KernelError {
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
        Object.setPrototypeOf(this, StreamError.prototype);
    }
}
exports.StreamError = StreamError;
//# sourceMappingURL=StreamError.js.map