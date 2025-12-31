// workers/AlgorithmWorkerPool.ts

import { ILogger, Logger } from "@orbitjs/logger";
import { AlgorithmWorker } from "./AlgorithmWorker";
import { HashAlgorithm, AlgorithmOptions } from "./types";

interface WorkerTask {
  chunk: ArrayBuffer;
  options?: AlgorithmOptions;
  resolve: (hash: string) => void;
  reject: (error: Error) => void;
  startTime: number;
  bufferFromPool?: boolean;
  retryCount?: number;
  workerId?: number;
}

interface WorkerHealthStats {
  workerId: number;
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  totalComputeTime: number;
  recentFailures: number[]; // 时间戳数组
  lastFailureTime: number;
  isHealthy: boolean;
  markedUnhealthyAt?: number;
  consecutiveFailures: number;
}

interface MemoryPoolBlock {
  buffer: ArrayBuffer;
  size: number;
  lastUsed: number;
  isInUse: boolean;
}

/**
 * 🎯 算法Worker池（增强版）
 * 包含内存池、Transferable Objects支持和智能容错
 */
export class AlgorithmWorkerPool {
  private logger: ILogger;
  private workers: AlgorithmWorker[] = [];
  private taskQueue: WorkerTask[] = [];
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private isCancelled: boolean = false;
  private workerHealthCheckInterval?: NodeJS.Timeout;
  
  // 内存池
  private memoryPool: MemoryPoolBlock[] = [];
  private memoryPoolEnabled: boolean = false;
  private memoryPoolMaxSize: number = 20;
  private memoryRecycleThreshold: number = 5000; // 5秒后回收
  
  // 健康监控
  private workerHealthStats: Map<number, WorkerHealthStats> = new Map();
  private healthCheckInterval: number = 15000; // 15秒
  
  // 性能统计
  private stats = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    retriedTasks: 0,
    queueWaitTime: 0,
    totalComputeTime: 0,
    memoryPoolHits: 0,
    memoryPoolMisses: 0,
    transferableBytes: 0
  };

  // 容错配置
  private readonly retryStrategy = {
    maxRetries: 3,
    backoffFactor: 1.5,
    initialBackoff: 100, // 毫秒
    maxBackoff: 5000,
    unhealthyThreshold: 3, // 连续失败次数
    cooldownPeriod: 30000, // 30秒冷却
    isolationPeriod: 60000 // 60秒隔离
  };

  // 非重试的错误类型
  private readonly nonRetryableErrors = [
    'Memory limit exceeded',
    'Invalid algorithm',
    'Invalid data format',
    'Array buffer allocation failed',
    'Worker terminated'
  ];

  constructor(
    private algorithm: HashAlgorithm,
    private poolSize: number = Math.min(navigator.hardwareConcurrency || 4, 8),
    private options?: {
      // 内存池配置
      enableMemoryPool?: boolean;
      memoryPoolSize?: number;
      memoryBlockSize?: number;
      
      // 传输优化
      useTransferable?: boolean;
      maxTransferableSize?: number;
      
      // 容错配置
      healthCheckInterval?: number;
      maxQueueSize?: number;
      workerTimeoutMs?: number;
      
      // 性能监控
      enableStats?: boolean;
    }
  ) {
    this.logger = Logger.for(this.constructor.name);
    
    // 配置内存池
    this.memoryPoolEnabled = options?.enableMemoryPool ?? true;
    this.memoryPoolMaxSize = options?.memoryPoolSize || 20;
    
    this.logger.info('AlgorithmWorkerPool initializing', {
      poolSize,
      algorithmName: algorithm.name || 'anonymous',
      memoryPoolEnabled: this.memoryPoolEnabled,
      useTransferable: options?.useTransferable ?? true,
      healthCheckInterval: options?.healthCheckInterval || 15000
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

      // 初始化内存池
      if (this.memoryPoolEnabled) {
        this.initMemoryPool();
      }

      // 创建Worker实例
      for (let i = 0; i < this.poolSize; i++) {
        const worker = new AlgorithmWorker(
          this.algorithm,
          i,
          { 
            timeoutMs: this.options?.workerTimeoutMs || 30000 
          }
        );
        
        this.workers.push(worker);
        
        // 初始化健康统计
        this.workerHealthStats.set(i, {
          workerId: i,
          totalTasks: 0,
          successfulTasks: 0,
          failedTasks: 0,
          totalComputeTime: 0,
          recentFailures: [],
          lastFailureTime: 0,
          isHealthy: true,
          consecutiveFailures: 0
        });

        // 异步初始化Worker
        try {
          await worker.initialize();
          this.logger.debug(`Worker ${i} initialized successfully`);
        } catch (error) {
          this.logger.error(`Failed to initialize worker ${i}`, { error });
          // 标记为不健康
          const stats = this.workerHealthStats.get(i)!;
          stats.isHealthy = false;
          stats.markedUnhealthyAt = Date.now();
        }
      }

      // 启动健康检查
      this.startHealthCheck();
      
      this.isRunning = true;
      const initTime = performance.now() - startTime;
      
      this.logger.info('Worker pool initialized successfully', {
        poolSize: this.workers.length,
        healthyWorkers: this.getHealthyWorkers().length,
        initTime: initTime.toFixed(2),
        memoryPoolSize: this.memoryPool.length
      });

    } catch (error) {
      this.logger.error('Failed to initialize worker pool', { error });
      await this.cleanup();
      throw error;
    }
  }

  /**
   * 🎯 初始化内存池
   */
  private initMemoryPool(): void {
    const blockSize = this.options?.memoryBlockSize || 1024 * 1024; // 1MB
    
    for (let i = 0; i < this.memoryPoolMaxSize; i++) {
      try {
        const buffer = new ArrayBuffer(blockSize);
        this.memoryPool.push({
          buffer,
          size: blockSize,
          lastUsed: 0,
          isInUse: false
        });
      } catch (error) {
        this.logger.warn('Failed to allocate memory pool block', { 
          blockSize,
          error: error instanceof Error ? error.message : String(error)
        });
        break;
      }
    }
    
    this.logger.debug('Memory pool initialized', { 
      size: this.memoryPool.length,
      blockSize 
    });
  }

  /**
   * 🎯 提交计算任务（增强版）
   */
  public async computeChunk(
    chunk: ArrayBuffer,
    options?: AlgorithmOptions
  ): Promise<string> {
    if (!this.isRunning) {
      throw new Error('Worker pool not initialized');
    }

    if (this.isCancelled) {
      throw new Error('Worker pool cancelled');
    }

    // 检查队列长度限制
    if (this.options?.maxQueueSize && this.taskQueue.length >= this.options.maxQueueSize) {
      this.logger.warn('Task queue is full', {
        queueSize: this.taskQueue.length,
        maxQueueSize: this.options.maxQueueSize
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
          this.stats.totalComputeTime += (endTime - startTime);
          resolve(hash);
        },
        reject: (error: Error) => {
          this.stats.failedTasks++;
          reject(error);
        },
        startTime,
        retryCount: 0,
        bufferFromPool: false
      };

      // 如果有空闲的健康Worker，立即执行
      const idleWorker = this.findIdleWorker();
      if (idleWorker && !this.isPaused) {
        this.executeTask(idleWorker, task);
      } else {
        // 否则加入队列等待
        const queueTime = performance.now();
        task.resolve = (hash: string) => {
          const endTime = performance.now();
          this.stats.queueWaitTime += (endTime - queueTime);
          this.stats.completedTasks++;
          this.stats.totalComputeTime += (endTime - startTime);
          resolve(hash);
        };
        
        this.taskQueue.push(task);
        this.logger.debug('Task queued', {
          queueSize: this.taskQueue.length,
          chunkSize: chunk.byteLength
        });
        
        // 尝试调度任务
        this.scheduleTasks();
      }
    });
  }

  /**
   * 🎯 查找空闲的健康Worker
   */
  private findIdleWorker(): AlgorithmWorker | null {
    // 优先选择健康且空闲的Worker
    const healthyWorkers = this.getHealthyWorkers();
    
    for (const worker of healthyWorkers) {
      const status = worker.getStatus();
      if (status.isInitialized && status.pendingTasks === 0) {
        return worker;
      }
    }
    
    // 如果没有完全空闲的，选择任务最少的
    let minTasks = Infinity;
    let selectedWorker: AlgorithmWorker | null = null;
    
    for (const worker of healthyWorkers) {
      const status = worker.getStatus();
      if (status.isInitialized && status.pendingTasks < minTasks) {
        minTasks = status.pendingTasks;
        selectedWorker = worker;
      }
    }
    
    return selectedWorker;
  }

  /**
   * 🎯 获取健康的Worker列表
   */
  private getHealthyWorkers(): AlgorithmWorker[] {
    return this.workers.filter((_, index) => {
      const stats = this.workerHealthStats.get(index);
      return stats?.isHealthy !== false;
    });
  }

  /**
   * 🎯 执行任务（带智能重试和容错）
   */
  private async executeTask(worker: AlgorithmWorker, task: WorkerTask): Promise<void> {
    const workerId = worker.getStatus().workerId;
    const stats = this.workerHealthStats.get(workerId)!;
    
    task.workerId = workerId;
    stats.totalTasks++;
    
    const attempt = async (): Promise<void> => {
      try {
        this.logger.debug('Executing task attempt', {
          workerId,
          retryCount: task.retryCount || 0,
          chunkSize: task.chunk.byteLength
        });

        // 使用内存池或传输优化
        const { buffer, fromPool } = this.allocateBuffer(task.chunk);
        task.bufferFromPool = fromPool;
        
        // 复制数据
        if (buffer !== task.chunk) {
          const dataView = new Uint8Array(buffer);
          dataView.set(new Uint8Array(task.chunk));
        }

        const hash = await worker.computeChunk(buffer, task.options);
        
        // 成功：更新统计并解析
        stats.successfulTasks++;
        stats.consecutiveFailures = 0;
        task.resolve(hash);
        
        // 释放缓冲区
        this.releaseBuffer(buffer, fromPool);
        
        // 更新计算时间统计
        const computeTime = performance.now() - task.startTime;
        stats.totalComputeTime += computeTime;

      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        // 释放缓冲区（如果使用了内存池）
        if (task.bufferFromPool && task.chunk) {
          this.releaseBuffer(task.chunk, true);
        }
        
        // 更新失败统计
        stats.failedTasks++;
        stats.recentFailures.push(Date.now());
        stats.lastFailureTime = Date.now();
        stats.consecutiveFailures++;
        
        // 清理过期的失败记录（最近1分钟）
        const oneMinuteAgo = Date.now() - 60000;
        stats.recentFailures = stats.recentFailures.filter(time => time > oneMinuteAgo);
        
        // 检查是否应该重试
        task.retryCount = (task.retryCount || 0) + 1;
        
        if (this.shouldRetry(task, errorObj, workerId)) {
          this.stats.retriedTasks++;
          const delay = this.calculateBackoff(task.retryCount);
          
          this.logger.warn('Retrying task after error', {
            workerId,
            retryCount: task.retryCount,
            delay,
            error: errorObj.message
          });
          
          // 延迟后重试
          await this.delay(delay);
          return attempt();
        }
        
        // 检查Worker是否需要隔离
        if (this.shouldIsolateWorker(workerId)) {
          this.logger.error('Worker marked as unhealthy, restarting', { 
            workerId,
            consecutiveFailures: stats.consecutiveFailures,
            recentFailures: stats.recentFailures.length
          });
          
          await this.isolateAndRestartWorker(worker);
          
          // 尝试用其他Worker执行任务
          const otherWorker = this.findIdleWorker();
          if (otherWorker && otherWorker !== worker) {
            task.retryCount = 0; // 重置重试计数
            return this.executeTask(otherWorker, task);
          }
        }
        
        // 最终失败
        task.reject(errorObj);
      }
    };
    
    return attempt();
  }

  /**
   * 🎯 分配缓冲区（使用内存池）
   */
  private allocateBuffer(chunk: ArrayBuffer): { buffer: ArrayBuffer; fromPool: boolean } {
    if (!this.memoryPoolEnabled || chunk.byteLength > (this.options?.memoryBlockSize || 1024 * 1024)) {
      this.stats.memoryPoolMisses++;
      return { buffer: chunk, fromPool: false };
    }

    // 寻找合适的内存块
    const now = Date.now();
    for (let i = 0; i < this.memoryPool.length; i++) {
      const block = this.memoryPool[i];
      if (!block.isInUse && block.size >= chunk.byteLength) {
        block.isInUse = true;
        block.lastUsed = now;
        this.stats.memoryPoolHits++;
        
        // 记录传输的字节数
        if (this.options?.useTransferable) {
          this.stats.transferableBytes += chunk.byteLength;
        }
        
        return { buffer: block.buffer, fromPool: true };
      }
    }

    // 没有找到合适的内存块，回收最旧的未使用块
    this.recycleMemoryBlocks();
    
    // 再次尝试
    for (let i = 0; i < this.memoryPool.length; i++) {
      const block = this.memoryPool[i];
      if (!block.isInUse && block.size >= chunk.byteLength) {
        block.isInUse = true;
        block.lastUsed = now;
        this.stats.memoryPoolHits++;
        return { buffer: block.buffer, fromPool: true };
      }
    }

    // 仍然没有找到，分配新内存
    this.stats.memoryPoolMisses++;
    return { buffer: chunk, fromPool: false };
  }

  /**
   * 🎯 释放缓冲区
   */
  private releaseBuffer(buffer: ArrayBuffer, fromPool: boolean): void {
    if (fromPool && this.memoryPoolEnabled) {
      for (const block of this.memoryPool) {
        if (block.buffer === buffer) {
          block.isInUse = false;
          break;
        }
      }
    }
  }

  /**
   * 🎯 回收内存块
   */
  private recycleMemoryBlocks(): void {
    const now = Date.now();
    const threshold = this.memoryRecycleThreshold;
    
    for (const block of this.memoryPool) {
      if (!block.isInUse && (now - block.lastUsed) > threshold) {
        // 可以在这里重置或清理内存块
        // 例如：new Uint8Array(block.buffer).fill(0);
      }
    }
  }

  /**
   * 🎯 判断是否应该重试
   */
  private shouldRetry(task: WorkerTask, error: Error, workerId: number): boolean {
    // 检查重试次数
    if ((task.retryCount || 0) >= this.retryStrategy.maxRetries) {
      return false;
    }
    
    // 检查错误类型（某些错误不应该重试）
    if (this.nonRetryableErrors.some(msg => error.message.includes(msg))) {
      return false;
    }
    
    // 检查Worker健康状态
    const stats = this.workerHealthStats.get(workerId);
    if (!stats?.isHealthy) {
      return false;
    }
    
    // 检查连续失败次数
    if (stats.consecutiveFailures >= this.retryStrategy.unhealthyThreshold) {
      return false;
    }
    
    return true;
  }

  /**
   * 🎯 计算退避时间
   */
  private calculateBackoff(retryCount: number): number {
    const backoff = Math.min(
      this.retryStrategy.maxBackoff,
      this.retryStrategy.initialBackoff * Math.pow(this.retryStrategy.backoffFactor, retryCount - 1)
    );
    return backoff;
  }

  /**
   * 🎯 判断是否应该隔离Worker
   */
  private shouldIsolateWorker(workerId: number): boolean {
    const stats = this.workerHealthStats.get(workerId);
    if (!stats) return false;
    
    // 检查连续失败次数
    if (stats.consecutiveFailures >= this.retryStrategy.unhealthyThreshold) {
      return true;
    }
    
    // 检查最近1分钟的失败频率
    const oneMinuteAgo = Date.now() - 60000;
    const recentFailures = stats.recentFailures.filter(time => time > oneMinuteAgo);
    if (recentFailures.length >= this.retryStrategy.unhealthyThreshold) {
      return true;
    }
    
    // 检查是否已经在冷却期
    if (stats.markedUnhealthyAt) {
      const timeSinceMarked = Date.now() - stats.markedUnhealthyAt;
      if (timeSinceMarked < this.retryStrategy.cooldownPeriod) {
        return false; // 仍在冷却期
      }
    }
    
    return false;
  }

  /**
   * 🎯 隔离并重启Worker
   */
  private async isolateAndRestartWorker(worker: AlgorithmWorker): Promise<void> {
    const workerId = worker.getStatus().workerId;
    const stats = this.workerHealthStats.get(workerId)!;
    
    this.logger.info(`Isolating worker ${workerId}`, {
      consecutiveFailures: stats.consecutiveFailures,
      recentFailures: stats.recentFailures.length
    });
    
    // 标记为不健康
    stats.isHealthy = false;
    stats.markedUnhealthyAt = Date.now();
    
    try {
      // 销毁旧Worker
      worker.destroy();
      
      // 等待一段时间后重启
      await this.delay(this.retryStrategy.isolationPeriod);
      
      // 创建新Worker
      const newWorker = new AlgorithmWorker(
        this.algorithm,
        workerId,
        { timeoutMs: this.options?.workerTimeoutMs }
      );
      
      await newWorker.initialize();
      
      // 替换Worker
      this.workers[workerId] = newWorker;
      
      // 重置健康统计
      stats.isHealthy = true;
      stats.consecutiveFailures = 0;
      stats.recentFailures = [];
      stats.markedUnhealthyAt = undefined;
      
      this.logger.info(`Worker ${workerId} restarted successfully after isolation`);
      
    } catch (error) {
      this.logger.error(`Failed to restart worker ${workerId}`, { error });
      // 保持不健康状态，等待下次健康检查
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
    const interval = this.options?.healthCheckInterval || this.healthCheckInterval;
    
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
      const workerId = worker.getStatus().workerId;
      const stats = this.workerHealthStats.get(workerId);
      
      if (!stats?.isHealthy) {
        // 检查冷却期是否已过
        if (stats?.markedUnhealthyAt) {
          const timeSinceMarked = Date.now() - stats.markedUnhealthyAt;
          if (timeSinceMarked >= this.retryStrategy.cooldownPeriod) {
            this.logger.info(`Attempting to recover worker ${workerId} after cooldown`);
            await this.isolateAndRestartWorker(worker);
          }
        }
        continue;
      }
      
      try {
        const isAlive = await worker.ping();
        if (!isAlive) {
          this.logger.warn('Worker appears to be dead, marking as unhealthy', {
            workerId
          });
          
          stats.isHealthy = false;
          stats.markedUnhealthyAt = Date.now();
        }
      } catch (error) {
        this.logger.error('Health check failed for worker', {
          workerId,
          error
        });
        
        stats.isHealthy = false;
        stats.markedUnhealthyAt = Date.now();
      }
    }
  }

  /**
   * 🎯 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        busyWorkers: busyWorkers.length
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
      isHealthy: boolean;
      consecutiveFailures: number;
    }>;
    queueSize: number;
    healthyWorkers: number;
    stats: typeof this.stats;
  } {
    const healthyWorkers = this.getHealthyWorkers();
    
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      isCancelled: this.isCancelled,
      workers: this.workers.map(w => {
        const workerStatus = w.getStatus();
        const healthStats = this.workerHealthStats.get(workerStatus.workerId);
        return {
          id: workerStatus.workerId,
          isAlive: workerStatus.isAlive,
          pendingTasks: workerStatus.pendingTasks,
          isHealthy: healthStats?.isHealthy ?? true,
          consecutiveFailures: healthStats?.consecutiveFailures ?? 0
        };
      }),
      queueSize: this.taskQueue.length,
      healthyWorkers: healthyWorkers.length,
      stats: { ...this.stats }
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
    memoryPoolHitRate: number; // 内存池命中率
    errorRate: number; // 错误率
    transferEfficiency: number; // 传输效率（使用Transferable的比例）
  } {
    const completedTasks = this.stats.completedTasks;
    const totalTasks = this.stats.totalTasks;
    
    return {
      avgQueueWaitTime: completedTasks > 0 ? this.stats.queueWaitTime / completedTasks : 0,
      avgComputeTime: completedTasks > 0 ? this.stats.totalComputeTime / completedTasks : 0,
      throughput: completedTasks > 0 ? (completedTasks / (this.stats.totalComputeTime / 1000)) : 0,
      workerUtilization: this.workers.length > 0 ? 
        this.workers.filter(w => w.getStatus().pendingTasks > 0).length / this.workers.length : 0,
      memoryPoolHitRate: (this.stats.memoryPoolHits + this.stats.memoryPoolMisses) > 0 ? 
        this.stats.memoryPoolHits / (this.stats.memoryPoolHits + this.stats.memoryPoolMisses) : 0,
      errorRate: totalTasks > 0 ? this.stats.failedTasks / totalTasks : 0,
      transferEfficiency: this.options?.useTransferable ? 
        (this.stats.transferableBytes / (1024 * 1024)) : 0 // MB
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
    
    // 清理内存池
    this.memoryPool = [];
    
    // 清理统计
    this.workerHealthStats.clear();
    
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