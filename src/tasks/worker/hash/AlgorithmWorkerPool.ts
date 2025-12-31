// workers/AlgorithmWorkerPool.ts

import { ILogger, Logger } from '@orbitjs/logger';
import { AlgorithmWorker } from './AlgorithmWorker';
import { HashAlgorithm, AlgorithmOptions } from './types';

interface WorkerTask {
    chunk: ArrayBuffer;
    options?: AlgorithmOptions;
    resolve: (hash: string) => void;
    reject: (error: Error) => void;
    startTime: number;
}

/**
 * 🎯 算法Worker池
 * 管理多个AlgorithmWorker实例，提供负载均衡和故障恢复
 */
export class AlgorithmWorkerPool {
    private logger: ILogger;
    private workers: AlgorithmWorker[] = [];
    private taskQueue: WorkerTask[] = [];
    private isRunning: boolean = false;
    private isPaused: boolean = false;
    private isCancelled: boolean = false;
    private workerHealthCheckInterval?: NodeJS.Timeout;

    private stats = {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        queueWaitTime: 0,
        totalComputeTime: 0,
    };

    constructor(
        private algorithm: HashAlgorithm,
        private poolSize: number = Math.min(navigator.hardwareConcurrency || 4, 8),
        private options?: {
            healthCheckInterval?: number; // 健康检查间隔（毫秒）
            maxQueueSize?: number; // 最大队列长度
            workerTimeoutMs?: number; // Worker超时时间
        }
    ) {
        this.logger = Logger.for(this.constructor.name);

        this.logger.info('AlgorithmWorkerPool initializing', {
            poolSize,
            algorithmName: algorithm.name || 'anonymous',
            options: this.options,
        });
    }

    /**
     * 🎯 初始化Worker池
     */
    public async initialize(): Promise<void> {
        if (this.isRunning) {
            this.logger.warn('Worker pool already initialized');
            return;
        }

        try {
            this.logger.debug('Starting worker pool initialization');
            const startTime = performance.now();

            // 创建Worker实例
            for (let i = 0; i < this.poolSize; i++) {
                const worker = new AlgorithmWorker(this.algorithm, i, {
                    timeoutMs: this.options?.workerTimeoutMs,
                });
                this.workers.push(worker);

                // 异步初始化Worker
                worker.initialize().catch(error => {
                    this.logger.error(`Failed to initialize worker ${i}`, { error });
                });
            }

            // 启动健康检查
            this.startHealthCheck();

            this.isRunning = true;
            const initTime = performance.now() - startTime;

            this.logger.info('Worker pool initialized successfully', {
                poolSize: this.workers.length,
                initTime: initTime.toFixed(2),
            });
        } catch (error) {
            this.logger.error('Failed to initialize worker pool', { error });
            await this.cleanup();
            throw error;
        }
    }

    /**
     * 🎯 提交计算任务
     */
    public async computeChunk(chunk: ArrayBuffer, options?: AlgorithmOptions): Promise<string> {
        if (!this.isRunning) {
            throw new Error('Worker pool not initialized');
        }

        if (this.isCancelled) {
            throw new Error('Worker pool cancelled');
        }

        // 检查队列长度
        if (this.options?.maxQueueSize && this.taskQueue.length >= this.options.maxQueueSize) {
            this.logger.warn('Task queue is full', {
                queueSize: this.taskQueue.length,
                maxQueueSize: this.options.maxQueueSize,
            });
            throw new Error('Task queue is full');
        }

        const startTime = performance.now();
        this.stats.totalTasks++;

        return new Promise<string>((resolve, reject) => {
            const task: WorkerTask = {
                chunk,
                options,
                resolve: (hash: string) => {
                    const endTime = performance.now();
                    this.stats.completedTasks++;
                    this.stats.totalComputeTime += endTime - startTime;
                    resolve(hash);
                },
                reject: (error: Error) => {
                    this.stats.failedTasks++;
                    reject(error);
                },
                startTime,
            };

            // 如果有空闲Worker，立即执行
            const idleWorker = this.findIdleWorker();
            if (idleWorker && !this.isPaused) {
                this.executeTask(idleWorker, task);
            } else {
                // 否则加入队列等待
                const queueTime = performance.now();
                task.resolve = (hash: string) => {
                    const endTime = performance.now();
                    this.stats.queueWaitTime += endTime - queueTime;
                    this.stats.completedTasks++;
                    this.stats.totalComputeTime += endTime - startTime;
                    resolve(hash);
                };

                this.taskQueue.push(task);
                this.logger.debug('Task queued', {
                    queueSize: this.taskQueue.length,
                    chunkSize: chunk.byteLength,
                });

                // 尝试调度任务
                this.scheduleTasks();
            }
        });
    }

    /**
     * 🎯 查找空闲Worker
     */
    private findIdleWorker(): AlgorithmWorker | null {
        // 简单的轮询策略，可以改为更智能的负载均衡
        for (const worker of this.workers) {
            const status = worker.getStatus();
            if (status.isInitialized && status.pendingTasks === 0) {
                return worker;
            }
        }
        return null;
    }

    /**
     * 🎯 执行任务
     */
    private async executeTask(worker: AlgorithmWorker, task: WorkerTask): Promise<void> {
        try {
            this.logger.debug('Executing task on worker', {
                workerId: worker.getStatus().workerId,
                chunkSize: task.chunk.byteLength,
            });

            const hash = await worker.computeChunk(task.chunk, task.options);
            task.resolve(hash);
        } catch (error) {
            this.logger.error('Task execution failed', {
                error: error instanceof Error ? error.message : String(error),
            });

            // 将失败的任务重新加入队列（可以添加重试逻辑）
            if (!this.isCancelled && !this.isPaused) {
                this.logger.debug('Retrying failed task');
                this.taskQueue.unshift(task); // 加入队列头部优先重试
                this.scheduleTasks();
            } else {
                task.reject(error instanceof Error ? error : new Error(String(error)));
            }
        }
    }

    /**
     * 🎯 调度任务
     */
    private scheduleTasks(): void {
        if (this.isPaused || this.isCancelled || this.taskQueue.length === 0) {
            return;
        }

        while (this.taskQueue.length > 0) {
            const idleWorker = this.findIdleWorker();
            if (!idleWorker) {
                break;
            }

            const task = this.taskQueue.shift()!;
            this.executeTask(idleWorker, task);
        }
    }

    /**
     * 🎯 启动健康检查
     */
    private startHealthCheck(): void {
        const interval = this.options?.healthCheckInterval || 10000; // 默认10秒

        this.workerHealthCheckInterval = setInterval(async () => {
            await this.checkWorkerHealth();
        }, interval);

        this.logger.debug('Health check started', { interval });
    }

    /**
     * 🎯 检查Worker健康状态
     */
    private async checkWorkerHealth(): Promise<void> {
        this.logger.debug('Running worker health check');

        for (const worker of this.workers) {
            try {
                const isAlive = await worker.ping();
                if (!isAlive) {
                    this.logger.warn('Worker appears to be dead, attempting to restart', {
                        workerId: worker.getStatus().workerId,
                    });

                    // 重启Worker
                    await this.restartWorker(worker);
                }
            } catch (error) {
                this.logger.error('Health check failed for worker', {
                    workerId: worker.getStatus().workerId,
                    error,
                });
            }
        }
    }

    /**
     * 🎯 重启Worker
     */
    private async restartWorker(worker: AlgorithmWorker): Promise<void> {
        const workerId = worker.getStatus().workerId;

        try {
            this.logger.info(`Restarting worker ${workerId}`);

            // 销毁旧Worker
            worker.destroy();

            // 创建新Worker
            const newWorker = new AlgorithmWorker(this.algorithm, workerId, {
                timeoutMs: this.options?.workerTimeoutMs,
            });

            await newWorker.initialize();

            // 替换Worker
            this.workers[workerId] = newWorker;

            this.logger.info(`Worker ${workerId} restarted successfully`);

            // 重新调度任务
            this.scheduleTasks();
        } catch (error) {
            this.logger.error(`Failed to restart worker ${workerId}`, { error });
        }
    }

    /**
     * 🎯 暂停任务处理
     */
    public pause(): void {
        if (!this.isPaused) {
            this.isPaused = true;
            this.logger.info('Worker pool paused');
        }
    }

    /**
     * 🎯 恢复任务处理
     */
    public resume(): void {
        if (this.isPaused) {
            this.isPaused = false;
            this.logger.info('Worker pool resumed');
            this.scheduleTasks();
        }
    }

    /**
     * 🎯 取消所有任务
     */
    public cancel(): void {
        this.isCancelled = true;
        this.isPaused = true;

        // 清理任务队列
        while (this.taskQueue.length > 0) {
            const task = this.taskQueue.shift()!;
            task.reject(new Error('Worker pool cancelled'));
        }

        this.logger.info('Worker pool cancelled');
    }

    /**
     * 🎯 等待所有任务完成
     */
    public async waitForCompletion(): Promise<void> {
        while (this.taskQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 等待所有Worker完成当前任务
        const busyWorkers = this.workers.filter(w => w.getStatus().pendingTasks > 0);
        if (busyWorkers.length > 0) {
            this.logger.debug('Waiting for busy workers', {
                busyWorkers: busyWorkers.length,
            });
            await Promise.all(
                busyWorkers.map(() => new Promise(resolve => setTimeout(resolve, 100)))
            );
        }
    }

    /**
     * 🎯 获取池状态
     */
    public getStatus(): {
        isRunning: boolean;
        isPaused: boolean;
        isCancelled: boolean;
        workers: Array<{
            id: number;
            isAlive: boolean;
            pendingTasks: number;
        }>;
        queueSize: number;
        stats: typeof this.stats;
    } {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            isCancelled: this.isCancelled,
            workers: this.workers.map(w => w.getStatus()),
            queueSize: this.taskQueue.length,
            stats: { ...this.stats },
        };
    }

    /**
     * 🎯 获取性能统计
     */
    public getPerformanceStats(): {
        avgQueueWaitTime: number;
        avgComputeTime: number;
        throughput: number; // 任务/秒
        workerUtilization: number; // Worker利用率（0-1）
    } {
        const completedTasks = this.stats.completedTasks;

        return {
            avgQueueWaitTime: completedTasks > 0 ? this.stats.queueWaitTime / completedTasks : 0,
            avgComputeTime: completedTasks > 0 ? this.stats.totalComputeTime / completedTasks : 0,
            throughput:
                completedTasks > 0 ? completedTasks / (this.stats.totalComputeTime / 1000) : 0,
            workerUtilization:
                this.workers.length > 0
                    ? this.workers.filter(w => w.getStatus().pendingTasks > 0).length /
                      this.workers.length
                    : 0,
        };
    }

    /**
     * 🎯 清理资源
     */
    private async cleanup(): Promise<void> {
        this.logger.debug('Starting worker pool cleanup');

        // 停止健康检查
        if (this.workerHealthCheckInterval) {
            clearInterval(this.workerHealthCheckInterval);
            this.workerHealthCheckInterval = undefined;
        }

        // 取消所有任务
        this.cancel();

        // 销毁所有Worker
        await Promise.all(
            this.workers.map(worker => {
                try {
                    worker.destroy();
                } catch (error) {
                    this.logger.error('Error destroying worker', { error });
                }
            })
        );

        this.workers = [];
        this.isRunning = false;

        this.logger.info('Worker pool cleanup completed');
    }

    /**
     * 🎯 销毁Worker池
     */
    public async destroy(): Promise<void> {
        this.logger.info('Destroying worker pool');
        await this.cleanup();
        this.logger.info('Worker pool destroyed');
    }
}
