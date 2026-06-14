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
export declare class BrowserWorkerHandle implements WorkerHandle {
    private worker;
    readonly id: string;
    /**
     * 构造函数
     *
     * @param workerScriptUrl Worker脚本的URL
     */
    constructor(workerScriptUrl: string);
    /**
     * 向Worker发送消息
     *
     * @param message 要发送的消息内容
     * @param transfer 可选的可转移对象数组，用于零拷贝传输
     */
    post<T = any>(message: T, transfer?: Transferable[]): void;
    /**
     * 注册消息监听，并返回一个取消监听的函数
     *
     * @param handler 消息处理函数
     * @returns 用于取消监听的函数
     */
    onMessage(handler: (msg: any) => void): () => void;
    /**
     * 注册错误监听，并返回一个取消监听的函数
     *
     * @param handler 错误处理函数
     * @returns 用于取消监听的函数
     */
    onError(handler: (err: Error) => void): () => void;
    /**
     * 终止Worker
     *
     * 终止Worker线程
     */
    terminate(): Promise<void>;
    /**
     * 检查Worker是否仍在运行
     *
     * @returns 如果Worker正在运行则返回true，否则返回false
     */
    isAlive(): boolean;
}
//# sourceMappingURL=BrowserWorkerHandle.d.ts.map