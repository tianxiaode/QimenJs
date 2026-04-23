import { ErrorBase } from '@orbitjs/error';

/**
 * Worker初始化错误类
 * 
 * 当Web Worker初始化失败时抛出此错误。此错误类保存了原始错误信息，
 * 便于调试Worker创建过程中遇到的问题。
 */
export class WorkerInitializationError extends ErrorBase {
    /**
     * 构造函数
     * 
     * @param message - 错误消息，描述初始化失败的原因
     * @param originalError - 可选参数，原始错误对象，用于进一步的错误诊断
     */
    constructor(
        message: string,
        public readonly originalError?: Error
    ) {
        super(`WorkerInitializationError: ${message}`, 'WORKER_INITIALIZATION_ERROR', {
            originalError,
        });
        this.name = 'WorkerInitializationError';
    }
    
    /**
     * 重写toJSON方法以包含originalError
     */
    public toJSON(): Record<string, any> {
        const baseJson = super.toJSON();
        return {
            ...baseJson,
            originalError: this.originalError
        };
    }
}