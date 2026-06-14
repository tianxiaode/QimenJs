import { KernelErrorCode } from "./codes";
import { KernelError } from "./KernelError";
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
export declare class StreamError extends KernelError {
    /**
     * 构造函数
     *
     * @param message - 错误描述信息
     * @param code - 错误代码，来自KernelErrorCode枚举
     * @param context - 可选的上下文信息，用于提供更多关于错误的详细信息
     */
    constructor(message: string, code: KernelErrorCode, context?: Record<string, any>);
}
//# sourceMappingURL=StreamError.d.ts.map