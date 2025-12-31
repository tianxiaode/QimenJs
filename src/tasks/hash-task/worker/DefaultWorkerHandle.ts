import { ILogger, Logger } from '@orbitjs/logger';
import { WorkerHandle } from './WorkerHandle';

export class DefaultWorkerHandle implements WorkerHandle {
    private logger: ILogger;
    private worker: Worker;
    public readonly id: string;
    // 内部维护一个清理函数集，确保 terminate 时彻底释放
    private cleanupFns: Set<() => void> = new Set();

    constructor(scriptUrl: string | URL) {
        this.id = `worker-${Math.random().toString(36).slice(2, 11)}`;
        this.worker = new Worker(scriptUrl);
        this.logger = Logger.for(this.constructor.name);
    }

    /**
     * 对应接口中的 post 方法
     */
    post<T = any>(message: T, transfer?: Transferable[]): void {
        // 这里的第二个参数可选，用于零拷贝
        this.worker.postMessage(message, transfer || []);
    }

    /**
     * 对应接口中的 onMessage
     * 这里我们返回一个取消订阅的函数，解决 removeEventListener 的痛点
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

    async terminate(): Promise<void> {
        this.logger.debug(`Terminating worker: ${this.id}`);
        // 1. 执行所有未完成的清理（移除事件监听）
        this.cleanupFns.forEach(unsub => unsub());
        this.cleanupFns.clear();

        // 2. 彻底终结线程
        this.worker.terminate();
    }

    isAlive(): boolean {
        return !!this.worker;
    }
}
