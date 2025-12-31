import { MemoryManager } from '@/runtime-env';
import { ChunkProvider } from '../types';
import { HashTaskProgress, TaskProgressSnapshot } from './HashTaskProgress';
import { HashTaskRunner } from './HashTaskRunner';
import { HashTaskState } from './HashTaskState';
import { HashTaskResources } from './HashTaskResources';
import { WorkerPool } from '../worker';

type ProgressListener = (snapshot: TaskProgressSnapshot) => void;

export interface HashTaskOptions {
    algorithm: ((data: ArrayBuffer) => string | Promise<string>) | string;
    chunkProvider: ChunkProvider;
    memoryManager: MemoryManager;
    workerPool: WorkerPool;
    totalBytes?: number;
}

export class HashTask {
    private readonly state = new HashTaskState();
    private readonly progress = new HashTaskProgress();
    private readonly resources: HashTaskResources;
    private readonly runner: HashTaskRunner;

    private progressListeners = new Set<ProgressListener>();
    private resultPromise: Promise<ArrayBuffer>;
    private resolveResult!: (v: ArrayBuffer) => void;
    private rejectResult!: (e: Error) => void;

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
     */
    start(): void {
        this.runner
            .run()
            .then(result => this.resolveResult(result))
            .catch(err => this.rejectResult(err));

        this.startProgressPolling();
    }
    pause(): void {
        this.runner.pause();
    }

    resume(): void {
        this.runner.resume();
    }

    cancel(): void {
        this.runner.cancel();
    }

    /**
     * 获取最终 hash 结果
     */
    result(): Promise<ArrayBuffer> {
        return this.resultPromise;
    }

    /**
     * 订阅进度
     */
    onProgress(listener: ProgressListener): () => void {
        this.progressListeners.add(listener);
        return () => this.progressListeners.delete(listener);
    }

    /**
     * 轮询推送进度（简单稳定）
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
