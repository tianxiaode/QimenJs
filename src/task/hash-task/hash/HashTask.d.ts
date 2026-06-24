import { MemoryManager } from '@/runtime';
import { ChunkProvider } from '../types';
import { TaskProgressSnapshot } from './HashTaskProgress';
import { WorkerPool } from '../worker';
/**
 * 进度监听器类型
 *
 * 定义了接收进度快照的回调函数类型
 */
type ProgressListener = (snapshot: TaskProgressSnapshot) => void;
/**
 * 哈希任务选项接口
 *
 * 定义了创建哈希任务所需的配置参数
 */
export interface HashTaskOptions {
    /** 哈希算法，可以是字符串（如'sha256'）或自定义哈希函数 */
    algorithm: ((data: ArrayBuffer) => string | Promise<string>) | string;
    /** 数据块提供者，用于获取待处理的数据块 */
    chunkProvider: ChunkProvider;
    /** 内存管理器，用于管理任务执行过程中的内存使用 */
    memoryManager: MemoryManager;
    /** Worker池，用于并行执行哈希计算 */
    workerPool: WorkerPool;
    /** 总字节数（可选） */
    totalBytes?: number;
}
/**
 * 哈希任务类
 *
 * 用于处理大文件或数据流的哈希计算任务，支持进度监控、暂停/恢复/取消操作
 *
 * 设计原则：
 * - 仅负责任务的生命周期管理
 * - 串联各个组件（State, Progress, Resources, Runner）
 * - 提供统一的外部接口
 *
 * 明确不负责：
 * - 不执行具体的哈希计算（由Runner和Worker负责）
 * - 不管理内存（由MemoryManager负责）
 * - 不调度Worker（由WorkerPool负责）
 *
 * @example
 * ```ts
 * const task = new HashTask({
 *   algorithm: 'sha256',
 *   chunkProvider: new FileChunkProvider(file),
 *   memoryManager: new MemoryManager(),
 *   workerPool: new BrowserWorkerPool(),
 * });
 *
 * task.onProgress((snapshot) => {
 *   console.log(`Progress: ${snapshot.percentage}%`);
 * });
 *
 * task.start();
 * const result = await task.result();
 * ```
 */
export declare class HashTask {
    private readonly options;
    private readonly state;
    private readonly progress;
    private readonly resources;
    private readonly runner;
    private progressListeners;
    private resultPromise;
    private resolveResult;
    private rejectResult;
    /**
     * 构造函数
     *
     * 初始化哈希任务的各项组件和状态
     *
     * @param options 哈希任务配置选项
     */
    constructor(options: HashTaskOptions);
    /**
     * 启动任务
     *
     * 开始执行哈希计算任务，并启动进度轮询机制
     */
    start(): Promise<void>;
    /**
     * 暂停任务
     *
     * 暂停当前正在执行的哈希计算任务
     */
    pause(): void;
    /**
     * 恢复任务
     *
     * 恢复之前暂停的哈希计算任务
     */
    resume(): void;
    /**
     * 取消任务
     *
     * 取消当前正在执行的哈希计算任务
     */
    cancel(): void;
    /**
     * 获取最终 hash 结果
     *
     * 返回一个Promise，当任务完成时包含哈希计算结果
     *
     * @returns 包含哈希结果的Promise
     */
    result(): Promise<ArrayBuffer>;
    /**
     * 订阅进度
     *
     * 添加进度监听器，当任务进度更新时会调用监听器
     *
     * @param listener 进度监听器函数
     * @returns 用于取消监听的函数
     */
    onProgress(listener: ProgressListener): () => void;
    /**
     * 轮询推送进度（简单稳定）
     *
     * 启动一个定时器，定期向所有进度监听器发送进度更新
     *
     * @private
     */
    private startProgressPolling;
}
export {};
//# sourceMappingURL=HashTask.d.ts.map