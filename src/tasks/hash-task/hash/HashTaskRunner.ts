import { ILogger, Logger } from "@orbitjs/logger";
import { HashTaskResources } from './HashTaskResources';
import { HashTaskState } from './HashTaskState';
import { Chunk } from '../types';
import { HashTaskProgress } from './HashTaskProgress';
import { WorkerHandle, WorkerScriptBuilder } from '../worker';
import { HashTaskOptions } from './HashTask';
import { HashTaskHealthMonitor } from './HashTaskHealthMonitor';

/**
 * HashTaskRunner类
 * 
 * 该类只负责流程控制：
 * - 驱动任务生命周期
 * - 串联 State / Progress / Resources
 * - 把「计算」委托给 worker
 * - 处理中断（pause / cancel）
 * 
 * 明确不负责：
 * - 不分块（ChunkProvider 的事）
 * - 不实现 hash 算法
 * - 不处理内存细节
 * - 不做健康监控
 * - 不做任务调度
 */
export class HashTaskRunner {
    private logger: ILogger;
    private builder = new WorkerScriptBuilder();

    /**
     * 构造函数
     * 
     * @param state 任务状态管理器
     * @param progress 任务进度管理器
     * @param resources 任务资源管理器
     * @param options 哈希任务选项
     */
    constructor(
        private readonly state: HashTaskState,
        private readonly progress: HashTaskProgress,
        private readonly resources: HashTaskResources,
        private readonly options: HashTaskOptions
    ) {
        this.logger = Logger.for("HashTaskRunner");
    }

    /**
     * 获取ChunkProvider的辅助属性，让代码更易读
     */
    private get chunkProvider() {
        return this.options.chunkProvider;
    }

    /**
     * 执行哈希任务
     * 
     * @returns Promise<ArrayBuffer> 包含哈希结果的Promise
     */
    async run(): Promise<ArrayBuffer> {
        this.logger.debug(`Starting hash task with algorithm: ${this.options.algorithm}`);
        const scriptSource = this.builder.build(this.options.algorithm);

        // 使用新定义的辅助属性计算内存
        const memoryRequired = this.calculateRequiredMemory();

        this.logger.debug(`Acquiring resources: memory=${(memoryRequired/1024/1024).toFixed(2)}MB`);
        await this.resources.acquire(scriptSource, memoryRequired);
        const monitor = new HashTaskHealthMonitor(this.state, this.progress, this.resources);
        monitor.start();

        try {
            // 注意：此时 State 的迁移需要符合你上传的 HashTaskState.ts 逻辑
            if (this.state.canStart()) {
                this.state.start();
            }

            return await this.executeHashing();
        } catch (err) {
            // 如果 state 有 fail 方法，在这里调用
            // this.state.fail(err);
            this.logger.error("Task failed:", err);
            throw err;
        } finally {
            this.logger.debug("Releasing resources and stopping monitor.");
            monitor.stop();
            await this.resources.release();
        }
    }

    /**
     * 暂停任务：通过状态机实现
     */
    pause(): void {
        if (this.state.canPause()) {
            this.state.pause();
        }
    }

    /**
     * 恢复任务：通过状态机实现
     */
    resume(): void {
        if (this.state.canResume()) {
            this.state.resume();
        }
    }

    /**
     * 取消任务：直接调用状态机的 cancel
     * 状态变更为 'cancelled' 后，executeHashing 循环中的 isCancelled() 会检测到并抛出异常
     */
    cancel(): void {
        if (this.state.canCancel()) {
            this.state.cancel();
        }
    }

    /**
     * 等待任务恢复（如果处于暂停状态）
     * 
     * @private
     */
    private async waitIfPaused(): Promise<void> {
        // ✅ 统一使用 state 判定，不再需要私有变量
        while (this.state.value === 'paused' && !this.state.isCancelled()) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    /**
     * 运行单个数据块的哈希计算
     * 
     * @param worker Worker句柄
     * @param chunk 要处理的数据块
     * @returns Promise<void> 表示处理完成的Promise
     * @private
     */
    private async runChunk(worker: WorkerHandle, chunk: Chunk): Promise<void> {
        return new Promise((resolve, reject) => {
            let unsubscribe: () => void;

            // 1. 定义处理器
            const handler = (msg: any) => {
                // 只响应当前 chunk 的确认消息
                if (msg.type === 'ack' && msg.chunkId === chunk.id) {
                    if (unsubscribe) unsubscribe(); // ✨ 执行清理！
                    resolve();
                } else if (msg.type === 'error') {
                    if (unsubscribe) unsubscribe(); // ✨ 出错也要清理！
                    reject(new Error(msg.message));
                }
            };

            // 2. 订阅消息
            unsubscribe = worker.onMessage(handler);

            // 3. 发送数据
            worker.post(
                { type: 'update', chunkId: chunk.id, data: chunk.data },
                [chunk.data] // 零拷贝转移
            );
        });
    }

    /**
     * 完成哈希计算并获取最终结果
     * 
     * @param worker Worker句柄
     * @returns Promise<ArrayBuffer> 包含最终哈希结果的Promise
     * @private
     */
    private async finalize(worker: WorkerHandle): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            let unsubscribe: () => void;

            const onMessage = (msg: any) => {
                if (msg.type === 'digest') {
                    if (unsubscribe) unsubscribe(); // ✨ 清理
                    resolve(msg.result);
                }
            };

            unsubscribe = worker.onMessage(onMessage);
            worker.post({ type: 'final' });
        });
    }
    
    /**
     * 计算所需内存大小
     * 
     * @returns 所需的内存大小（以字节为单位）
     * @private
     */
    private calculateRequiredMemory(): number {
        // 所有的 Provider 现在都有这个方法了
        const chunkSize = this.chunkProvider.getChunkSize();

        // 预留 2 个分片 + 1MB 冗余
        return chunkSize * 2 + 1024 * 1024;
    }

    /**
     * 执行哈希计算的主要逻辑
     * 
     * @returns Promise<ArrayBuffer> 包含最终哈希结果的Promise
     * @private
     */
    private async executeHashing(): Promise<ArrayBuffer> {
        const worker = this.resources.getWorker();
        const provider = this.chunkProvider;

        while (provider.hasNext()) {
            // 1. 检查暂停
            await this.waitIfPaused();

            // 2. 检查取消
            if (this.state.isCancelled()) {
                throw new Error('Task cancelled');
            }

            const chunk = await provider.next();
            if (!chunk) break;

            // 3. 执行哈希
            await this.runChunk(worker, chunk);

            // 4. 更新进度
            this.progress.onChunk(chunk);
        }

        const result = await this.finalize(worker);

        // ✨ 完成后同步状态机
        if (this.state.canPause()) {
            // 此时状态通常是 running
            this.state.complete();
        }

        return result;
    }
}