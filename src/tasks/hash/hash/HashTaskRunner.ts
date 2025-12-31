import { HashTaskResources } from './HashTaskResources';
import { HashTaskState } from './HashTaskState';
import { Chunk } from '../types';
import { HashTaskProgress } from './HashTaskProgress';

/**
 * HashTaskRunner 只负责流程控制：
 * 驱动任务生命周期
 * 串联 State / Progress / Resources
 * 把「计算」委托给 worker
 * 处理中断（pause / cancel）
 * ❌ 明确不做：
 * 不分 chunk（ChunkProvider 的事）
 * 不实现 hash 算法
 * 不处理内存细节
 * 不做健康监控
 * 不做任务调度
 */

interface ChunkProvider {
    next(): Promise<Chunk | null>;
    reset?(): void;
}

interface HashAlgorithm {
    init?(): void;
    update(data: ArrayBuffer): void;
    digest(): Promise<ArrayBuffer>;
}

interface WorkerMessage {
    type: 'hash';
    chunk: Chunk;
}

interface WorkerResult {
    type: 'done';
    data: ArrayBuffer;
}

export class HashTaskRunner {
    private paused = false;
    private cancelled = false;

    constructor(
        private readonly state: HashTaskState,
        private readonly progress: HashTaskProgress,
        private readonly resources: HashTaskResources,
        private readonly chunkProvider: ChunkProvider
    ) {}

    async run(algorithm: string, totalBytes?: number): Promise<ArrayBuffer> {
        this.state.start();
        this.progress.init(totalBytes);

        await this.resources.acquire(totalBytes);

        try {
            const worker = this.resources.getWorker();

            // 👇 在这里初始化算法
            worker.postMessage({ type: 'init', algorithm });

            while (!this.cancelled) {
                await this.waitIfPaused();

                const chunk = await this.chunkProvider.next();
                if (!chunk) break;

                await this.runChunk(worker, chunk);
                this.progress.onChunk(chunk);
            }

            // 👇 最终计算 digest
            const result = await this.finalize(worker);

            this.state.complete();
            return result;
        } catch (err) {
            this.state.fail(err as Error);
            throw err;
        } finally {
            await this.resources.release();
        }
    }

    pause(): void {
        if (!this.state.canPause()) return;
        this.paused = true;
        this.state.pause();
    }

    resume(): void {
        if (!this.state.canResume()) return;
        this.paused = false;
        this.state.resume();
    }

    cancel(): void {
        this.cancelled = true;
        this.state.cancel();
    }

    private async waitIfPaused(): Promise<void> {
        while (this.paused && !this.cancelled) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    private runChunk(worker: any, chunk: Chunk): Promise<WorkerResult> {
        return new Promise((resolve, reject) => {
            const onMessage = (e: MessageEvent) => {
                if (e.data?.type === 'done') {
                    worker.removeEventListener('message', onMessage);
                    resolve(e.data);
                }
            };

            worker.addEventListener('message', onMessage);
            worker.postMessage({ type: 'hash', chunk });
        });
    }

    private finalize(worker: any): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const onMessage = (e: MessageEvent) => {
                if (e.data?.type === 'digest') {
                    worker.removeEventListener('message', onMessage);
                    resolve(e.data.result);
                }
            };

            worker.addEventListener('message', onMessage);
            worker.postMessage({ type: 'final' });
        });
    }
}
