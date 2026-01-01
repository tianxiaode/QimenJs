import { MemoryManager } from '@/runtime-env';
import { ChunkProvider, IHashTask } from '../types';
import { HashTaskProgress, TaskProgressSnapshot } from './HashTaskProgress';
import { HashTaskRunner } from './HashTaskRunner';
import { HashTaskState } from './HashTaskState';
import { HashTaskResources } from './HashTaskResources';
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
export class HashTask {
    private readonly state = new HashTaskState();
    private readonly progress = new HashTaskProgress();
    private readonly resources: HashTaskResources;
    private readonly runner: HashTaskRunner;

    private progressListeners = new Set<ProgressListener>();
    private resultPromise: Promise<ArrayBuffer>;
    private resolveResult!: (v: ArrayBuffer) => void;
    private rejectResult!: (e: Error) => void;

    /**
     * 构造函数
     * 
     * 初始化哈希任务的各项组件和状态
     * 
     * @param options 哈希任务配置选项
     */
    constructor(private readonly options: HashTaskOptions) {
        this.state = new HashTaskState();
        this.progress = new HashTaskProgress();
        const totalSize = options.chunkProvider.getTotalSize();
        this.progress.init(totalSize);

        this.resources = new HashTaskResources(options.memoryManager, options.workerPool);

        this.runner = new HashTaskRunner(
            this.state,
            this.progress,
            this.resources,
            options
        );

        this.resultPromise = new Promise<ArrayBuffer>((resolve, reject) => {
            this.resolveResult = resolve;
            this.rejectResult = reject;
        });
    }

    /**
     * 启动任务
     * 
     * 开始执行哈希计算任务，并启动进度轮询机制
     */
    start(): void {
        this.runner
            .run()
            .then(result => this.resolveResult(result))
            .catch(err => this.rejectResult(err));

        this.startProgressPolling();
    }

    /**
     * 暂停任务
     * 
     * 暂停当前正在执行的哈希计算任务
     */
    pause(): void {
        this.runner.pause();
    }

    /**
     * 恢复任务
     * 
     * 恢复之前暂停的哈希计算任务
     */
    resume(): void {
        this.runner.resume();
    }

    /**
     * 取消任务
     * 
     * 取消当前正在执行的哈希计算任务
     */
    cancel(): void {
        this.runner.cancel();
    }

    /**
     * 获取最终 hash 结果
     * 
     * 返回一个Promise，当任务完成时包含哈希计算结果
     * 
     * @returns 包含哈希结果的Promise
     */
    result(): Promise<ArrayBuffer> {
        return this.resultPromise;
    }

    /**
     * 订阅进度
     * 
     * 添加进度监听器，当任务进度更新时会调用监听器
     * 
     * @param listener 进度监听器函数
     * @returns 用于取消监听的函数
     */
    onProgress(listener: ProgressListener): () => void {
        this.progressListeners.add(listener);
        return () => this.progressListeners.delete(listener);
    }

    /**
     * 轮询推送进度（简单稳定）
     * 
     * 启动一个定时器，定期向所有进度监听器发送进度更新
     * 
     * @private
     */
    private startProgressPolling(): void {
        const tick = () => {
            if (
                this.state.value === 'completed' ||
                this.state.value === 'failed' ||
                this.state.value === 'cancelled'
            ) {
                return;
            }

            const snapshot = this.progress.snapshot();
            this.progressListeners.forEach(fn => fn(snapshot));

            setTimeout(tick, 200);
        };

        tick();
    }
}