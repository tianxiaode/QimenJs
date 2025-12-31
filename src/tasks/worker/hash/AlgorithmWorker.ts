// workers/AlgorithmWorker.ts

import { ILogger, Logger } from '@orbitjs/logger';
import { HashAlgorithm, AlgorithmOptions } from './types';
import { HashErrorFactory } from './errors';
import { WorkerScriptBuilder } from './WorkerScriptBuilder';

/**
 * 🎯 单个算法Worker封装
 * 负责创建和管理包含用户算法的Web Worker
 */
export class AlgorithmWorker {
    private logger: ILogger;
    private worker: Worker | null = null;
    private workerScriptBuilder: WorkerScriptBuilder;
    private blobUrl: string | null = null;
    private taskResolvers: Map<
        string,
        {
            resolve: (result: string) => void;
            reject: (error: Error) => void;
            startTime: number;
        }
    > = new Map();

    private isInitialized: boolean = false;
    private workerId: number;
    private timeoutMs: number = 30000; // 30秒超时

    constructor(
        private algorithm: HashAlgorithm,
        workerId: number,
        options?: {
            timeoutMs?: number;
        }
    ) {
        this.workerId = workerId;
        this.logger = Logger.for(`${this.constructor.name}#${workerId}`);
        this.timeoutMs = options?.timeoutMs || this.timeoutMs;
        this.workerScriptBuilder = new WorkerScriptBuilder();
        this.logger.debug('AlgorithmWorker created');
    }

    /**
     * 🎯 初始化Worker（懒加载）
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            this.logger.debug('Initializing worker');
            const startTime = performance.now();

            // 创建包含算法的Worker
            this.worker = this.createWorkerWithAlgorithm();

            // 等待Worker初始化完成
            await this.waitForWorkerReady();

            const initTime = performance.now() - startTime;
            this.isInitialized = true;

            this.logger.info('Worker initialized successfully', {
                initTime: initTime.toFixed(2),
            });
        } catch (error) {
            this.logger.error('Failed to initialize worker', { error });
            this.cleanup();
            throw HashErrorFactory.workerCrashed(
                this.workerId,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * 🎯 创建包含算法的Worker
     */
    private createWorkerWithAlgorithm(): Worker {
        // 构建Worker代码
        const algorithmString = this.algorithm.toString();

        const workerCode = `
      // 用户提供的算法函数
      const userAlgorithm = ${algorithmString};

      // 主消息处理
      self.onmessage = async function(e) {
        const { type, taskId, data, options } = e.data;
        
        switch (type) {
          case 'PING':
            self.postMessage({ type: 'PONG', taskId });
            break;
            
          case 'COMPUTE_CHUNK':
            try {
              const startTime = performance.now();
              const result = await userAlgorithm(data, options);
              const timeCost = performance.now() - startTime;
              
              self.postMessage({ 
                type: 'CHUNK_RESULT', 
                taskId, 
                hash: result,
                timeCost: Math.round(timeCost)
              });
            } catch (error) {
              self.postMessage({ 
                type: 'ERROR', 
                taskId, 
                error: error.message || 'Unknown algorithm error'
              });
            }
            break;
        }
      };

      // Worker初始化完成
      self.postMessage({ type: 'READY' });
    `;

        // 创建Blob URL
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.blobUrl = URL.createObjectURL(blob);

        // 创建Worker
        const worker = new Worker(this.blobUrl);

        // 设置消息处理器
        worker.onmessage = this.handleWorkerMessage.bind(this);
        worker.onerror = this.handleWorkerError.bind(this);
        worker.onmessageerror = this.handleMessageError.bind(this);

        this.logger.debug('Worker created with embedded algorithm');
        return worker;
    }

    /**
     * 🎯 初始化Worker（使用WorkerScriptBuilder）
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            this.logger.debug('Initializing worker using WorkerScriptBuilder');
            const startTime = performance.now();

            // 使用WorkerScriptBuilder创建Worker
            this.worker = await this.workerScriptBuilder.createAndInitializeWorker(this.algorithm);

            // 设置消息处理器
            this.worker.onmessage = this.handleWorkerMessage.bind(this);
            this.worker.onerror = this.handleWorkerError.bind(this);
            this.worker.onmessageerror = this.handleMessageError.bind(this);

            const initTime = performance.now() - startTime;
            this.isInitialized = true;

            this.logger.info('Worker initialized successfully', {
                initTime: initTime.toFixed(2),
                algorithmName: this.algorithm.name || 'anonymous',
            });
        } catch (error) {
            this.logger.error('Failed to initialize worker', { error });
            this.cleanup();
            throw HashErrorFactory.workerCrashed(
                this.workerId,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * 🎯 清理资源（更新版）
     */
    public cleanup(): void {
        this.logger.debug('Cleaning up worker resources');

        // 使用WorkerScriptBuilder清理Worker
        if (this.worker) {
            WorkerScriptBuilder.cleanupWorker(this.worker);
            this.worker.terminate();
            this.worker = null;
        }

        // 清理待处理任务
        this.rejectAllTasks(new Error('Worker terminated'));

        this.isInitialized = false;

        this.logger.info('Worker cleanup completed');
    }
    /**
     * 🎯 等待Worker就绪
     */
    private waitForWorkerReady(): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Worker initialization timeout'));
            }, 5000); // 5秒超时

            const readyHandler = (event: MessageEvent) => {
                if (event.data.type === 'READY') {
                    clearTimeout(timeoutId);
                    this.worker?.removeEventListener('message', readyHandler);
                    resolve();
                }
            };

            this.worker?.addEventListener('message', readyHandler);
        });
    }

    /**
     * 🎯 处理Worker消息
     */
    private handleWorkerMessage(event: MessageEvent): void {
        const { type, taskId, hash, error, timeCost } = event.data;

        switch (type) {
            case 'CHUNK_RESULT':
                const resolver = this.taskResolvers.get(taskId);
                if (resolver) {
                    const totalTime = performance.now() - resolver.startTime;

                    this.logger.debug('Chunk computation completed', {
                        taskId,
                        computeTime: timeCost,
                        totalTime: Math.round(totalTime),
                    });

                    resolver.resolve(hash);
                    this.taskResolvers.delete(taskId);
                }
                break;

            case 'ERROR':
                const errorResolver = this.taskResolvers.get(taskId);
                if (errorResolver) {
                    this.logger.error('Worker computation error', { taskId, error });
                    errorResolver.reject(new Error(error));
                    this.taskResolvers.delete(taskId);
                }
                break;

            case 'PONG':
                this.logger.debug('Worker heartbeat received', { taskId });
                break;
        }
    }

    /**
     * 🎯 处理Worker错误
     */
    private handleWorkerError(event: ErrorEvent): void {
        this.logger.error('Worker error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        });

        // 拒绝所有待处理任务
        this.rejectAllTasks(new Error(`Worker error: ${event.message}`));
    }

    /**
     * 🎯 处理消息错误
     */
    private handleMessageError(event: MessageEvent): void {
        this.logger.error('Worker message error', { event });
        this.rejectAllTasks(new Error('Worker message error'));
    }

    /**
     * 🎯 拒绝所有待处理任务
     */
    private rejectAllTasks(error: Error): void {
        for (const [taskId, resolver] of this.taskResolvers) {
            resolver.reject(error);
        }
        this.taskResolvers.clear();
        this.cleanup();
    }

    /**
     * 🎯 执行分片计算
     */
    public async computeChunk(chunk: ArrayBuffer, options?: AlgorithmOptions): Promise<string> {
        if (!this.isInitialized || !this.worker) {
            throw new Error('Worker not initialized');
        }

        const taskId = this.generateTaskId();
        const startTime = performance.now();

        this.logger.debug('Starting chunk computation', {
            taskId,
            chunkSize: chunk.byteLength,
        });

        return new Promise<string>((resolve, reject) => {
            // 设置超时
            const timeoutId = setTimeout(() => {
                this.logger.warn('Chunk computation timeout', {
                    taskId,
                    timeout: this.timeoutMs,
                });

                if (this.taskResolvers.has(taskId)) {
                    this.taskResolvers.delete(taskId);
                    reject(new Error(`Computation timeout after ${this.timeoutMs}ms`));
                }
            }, this.timeoutMs);

            // 存储解析器
            this.taskResolvers.set(taskId, {
                resolve: (result: string) => {
                    clearTimeout(timeoutId);
                    resolve(result);
                },
                reject: (error: Error) => {
                    clearTimeout(timeoutId);
                    reject(error);
                },
                startTime,
            });

            // 发送计算任务到Worker
            this.worker!.postMessage(
                {
                    type: 'COMPUTE_CHUNK',
                    taskId,
                    data: chunk,
                    options,
                },
                [chunk]
            ); // 传输所有权，避免复制
        });
    }

    /**
     * 🎯 生成任务ID
     */
    private generateTaskId(): string {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 🎯 发送心跳检测
     */
    public async ping(): Promise<boolean> {
        if (!this.isInitialized || !this.worker) {
            return false;
        }

        try {
            const taskId = `ping_${Date.now()}`;
            const timeoutMs = 2000; // 2秒心跳超时

            const isAlive = await Promise.race([
                new Promise<boolean>(resolve => {
                    const handler = (event: MessageEvent) => {
                        if (event.data.type === 'PONG' && event.data.taskId === taskId) {
                            this.worker?.removeEventListener('message', handler);
                            resolve(true);
                        }
                    };

                    this.worker?.addEventListener('message', handler);
                    this.worker?.postMessage({ type: 'PING', taskId });
                }),
                new Promise<boolean>(resolve => {
                    setTimeout(() => resolve(false), timeoutMs);
                }),
            ]);

            return isAlive;
        } catch (error) {
            this.logger.warn('Worker ping failed', { error });
            return false;
        }
    }

    /**
     * 🎯 清理资源
     */
    public cleanup(): void {
        this.logger.debug('Cleaning up worker resources');

        // 终止Worker
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }

        // 释放Blob URL
        if (this.blobUrl) {
            URL.revokeObjectURL(this.blobUrl);
            this.blobUrl = null;
        }

        // 清理待处理任务
        this.rejectAllTasks(new Error('Worker terminated'));

        this.isInitialized = false;

        this.logger.info('Worker cleanup completed');
    }

    /**
     * 🎯 获取Worker状态
     */
    public getStatus(): {
        workerId: number;
        isInitialized: boolean;
        pendingTasks: number;
        isAlive: boolean;
    } {
        return {
            workerId: this.workerId,
            isInitialized: this.isInitialized,
            pendingTasks: this.taskResolvers.size,
            isAlive: this.isInitialized && !!this.worker,
        };
    }

    /**
     * 🎯 销毁Worker
     */
    public destroy(): void {
        this.logger.info('Destroying worker');
        this.cleanup();
        this.logger.info('Worker destroyed');
    }
}
