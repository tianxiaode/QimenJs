/**
 * Worker句柄接口
 *
 * 定义了Worker实例的统一接口，提供与Worker通信和管理的基本方法
 * 设计原则：只负责Worker的通信和生命周期管理，不关心具体执行的算法
 *
 * 明确不负责：
 * - 不实现具体的哈希算法
 * - 不管理任务状态
 * - 不处理进度跟踪
 */
export interface WorkerHandle {
    /** Worker的唯一标识符 */
    readonly id: string;

    /**
     * 向Worker发送消息
     *
     * @param message 要发送的消息内容
     * @param transfer 可选的可转移对象数组，用于零拷贝传输
     */
    post<T = any>(message: T, transfer?: Transferable[]): void;

    /**
     * 注册消息监听，并返回一个取消监听的函数 (Unsubscribe pattern)
     * 这种模式比手动 add/remove 更不容易出错
     *
     * @param handler 消息处理函数
     * @returns 用于取消监听的函数
     */
    onMessage(handler: (msg: any) => void): () => void; // ✨ 修改点：返回取消函数

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
     * 释放Worker资源并终止其执行
     */
    terminate(): Promise<void>;

    /**
     * 检查Worker是否仍在运行
     *
     * @returns 如果Worker正在运行则返回true，否则返回false
     */
    isAlive(): boolean;
}
