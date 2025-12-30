import { WorkerManagerOptions } from './types';
import { WorkerManagerBase } from './WorkerManagerBase';

/**
 * SimpleWorkerManager 是一个简化版的 Web Worker 管理器
 * 它基于 WorkerManagerBase 实现，通过构造函数传入的回调函数来处理消息和错误
 * 遵循"配置优于继承"的设计原则，支持通过 WorkerManagerOptions 配置回调函数
 */
export class SimpleWorkerManager extends WorkerManagerBase {
    /**
     * 构造函数
     * @param url Worker 脚本的 URL
     * @param handlers 可选的回调函数集合，包括 onMessage、onError、onMessageError
     */
    constructor(
        url: string,
        private handlers: WorkerManagerOptions = {}
    ) {
        super(url);
    }

    /**
     * 处理从 Worker 接收到的消息
     * 如果提供了 onMessage 回调函数，则调用它
     * @param event MessageEvent 事件对象
     */
    protected onMessage(event: MessageEvent) {
        this.handlers.onMessage?.(event);
    }

    /**
     * 处理 Worker 的错误事件
     * 如果提供了 onError 回调函数，则调用它
     * 同时调用父类的错误处理方法以保持默认行为
     * @param error ErrorEvent 事件对象
     */
    protected onError(error: ErrorEvent) {
        this.handlers.onError?.(error);
        super.onError(error);
    }

    /**
     * 处理 Worker 消息传递过程中的错误
     * 如果提供了 onMessageError 回调函数，则调用它
     * 同时调用父类的错误处理方法以保持默认行为
     * @param error MessageEvent 事件对象
     */
    protected onMessageError(error: MessageEvent) {
        this.handlers.onMessageError?.(error);
        super.onMessageError(error);
    }

}