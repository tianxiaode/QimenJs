import { ILogger, Logger } from '@qimenjs/logger';
import { WorkerHandle } from './WorkerHandle';

/**
 * 默认Worker句柄实现
 *
 * 提供了Worker句柄接口的默认实现，用于与Web Worker通信
 * 设计原则：只负责与Worker的通信和生命周期管理，不关心具体执行的算法
 *
 * 明确不负责：
 * - 不执行具体的哈希计算
 * - 不管理任务状态
 * - 不处理算法逻辑
 */
export class DefaultWorkerHandle implements WorkerHandle {
    private logger: ILogger;
    private worker: Worker;
    public readonly id: string;
    // 内部维护一个清理函数集，确保 terminate 时彻底释放
    private cleanupFns: Set<() => void> = new Set();

    /**
     * 构造函数
     *
     * @param scriptUrl Worker脚本的URL
     */
    constructor(scriptUrl: string | URL) {
        this.id = `worker-${Math.random().toString(36).slice(2, 11)}`;
        this.worker = new Worker(scriptUrl);
        this.logger = Logger.for(this.constructor.name);
    }

    /**
     * 向Worker发送消息
     *
     * @param message 要发送的消息内容
     * @param transfer 可选的可转移对象数组，用于零拷贝传输
     */
    post<T = any>(message: T, transfer?: Transferable[]): void {
        // 这里的第二个参数可选，用于零拷贝
        this.worker.postMessage(message, transfer || []);
    }

    /**
     * 注册消息监听，并返回一个取消监听的函数
     *
     * @param handler 消息处理函数
     * @returns 用于取消监听的函数
     */
    onMessage(handler: (msg: any) => void): () => void {
        const wrapper = (e: MessageEvent) => handler(e.data);
        this.worker.addEventListener('message', wrapper);

        const unsubscribe = () => {
            this.worker.removeEventListener('message', wrapper);
            this.cleanupFns.delete(unsubscribe);
        };

        this.cleanupFns.add(unsubscribe);
        return unsubscribe;
    }

    /**
     * 注册错误监听，并返回一个取消监听的函数
     *
     * @param handler 错误处理函数
     * @returns 用于取消监听的函数
     */
    onError(handler: (err: Error) => void): () => void {
        const wrapper = (e: ErrorEvent) => {
            this.logger.error(`Worker Error [${this.id}]:`, e.message); // 增加日志记录
            handler(new Error(e.message));
        };
        this.worker.addEventListener('error', wrapper);

        const unsubscribe = () => {
            this.worker.removeEventListener('error', wrapper);
            this.cleanupFns.delete(unsubscribe);
        };

        this.cleanupFns.add(unsubscribe);
        return unsubscribe;
    }

    /**
     * 终止Worker
     *
     * 清理所有事件监听器并终止Worker线程
     */
    async terminate(): Promise<void> {
        this.logger.debug(`Terminating worker: ${this.id}`);
        // 1. 执行所有未完成的清理（移除事件监听）
        this.cleanupFns.forEach(unsub => unsub());
        this.cleanupFns.clear();

        // 2. 彻底终结线程
        this.worker.terminate();
    }

    /**
     * 检查Worker是否仍在运行
     *
     * @returns 如果Worker正在运行则返回true，否则返回false
     */
    isAlive(): boolean {
        return !!this.worker;
    }
}
