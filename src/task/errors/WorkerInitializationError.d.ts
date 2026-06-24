import { ErrorBase } from '@orbitjs/error';
/**
 * Worker初始化错误类
 *
 * 当Web Worker初始化失败时抛出此错误。此错误类保存了原始错误信息，
 * 便于调试Worker创建过程中遇到的问题。
 */
export declare class WorkerInitializationError extends ErrorBase {
    readonly originalError?: Error | undefined;
    /**
     * 构造函数
     *
     * @param message - 错误消息，描述初始化失败的原因
     * @param originalError - 可选参数，原始错误对象，用于进一步的错误诊断
     */
    constructor(message: string, originalError?: Error | undefined);
    /**
     * 重写toJSON方法以包含originalError
     */
    toJSON(): Record<string, any>;
}
//# sourceMappingURL=WorkerInitializationError.d.ts.map