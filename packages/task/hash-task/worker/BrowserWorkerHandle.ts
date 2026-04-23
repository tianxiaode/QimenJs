import { WorkerHandle } from './WorkerHandle';

/**
 * 浏览器环境下的Worker句柄实现
 * 
 * 提供了浏览器环境下Worker句柄接口的实现，用于与Web Worker通信
 * 设计原则：只负责与Worker的通信和生命周期管理，不关心具体执行的算法
 * 
 * 明确不负责：
 * - 不执行具体的哈希计算
 * - 不管理任务状态
 * - 不处理算法逻辑
 */
export class BrowserWorkerHandle implements WorkerHandle {
    private worker: Worker;
    public readonly id: string;

    /**
     * 构造函数
     * 
     * @param workerScriptUrl Worker脚本的URL
     */
    constructor(workerScriptUrl: string) {
        this.id = `worker-${Math.random().toString(36).substr(2, 9)}`;
        this.worker = new Worker(workerScriptUrl);
    }

    /**
     * 向Worker发送消息
     * 
     * @param message 要发送的消息内容
     * @param transfer 可选的可转移对象数组，用于零拷贝传输
     */
    post<T = any>(message: T, transfer?: Transferable[]): void {
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

        // 返回一个清理函数，这就是我们之前讨论的"自清理"模式
        return () => this.worker.removeEventListener('message', wrapper);
    }

    /**
     * 注册错误监听，并返回一个取消监听的函数
     * 
     * @param handler 错误处理函数
     * @returns 用于取消监听的函数
     */
    onError(handler: (err: Error) => void): () => void {
        const wrapper = (e: ErrorEvent) => handler(new Error(e.message));
        this.worker.addEventListener('error', wrapper);
        return () => this.worker.removeEventListener('error', wrapper);
    }

    /**
     * 终止Worker
     * 
     * 终止Worker线程
     */
    async terminate(): Promise<void> {
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