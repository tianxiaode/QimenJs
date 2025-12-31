// scheduler/HashTaskScheduler.ts

import { ILogger, Logger } from "@orbitjs/logger";
import { FileChunkReader } from "./FileChunkReader";
import { AlgorithmWorkerPool } from "./AlgorithmWorkerPool";
import { 
  HashAlgorithm, 
  HashProgress, 
  FileChunk,
  HashCalculatorConfig 
} from "./types1";

interface ScheduledTask {
  chunk: FileChunk;
  promise: Promise<string>;
  startTime: number;
}

/**
 * 🎯 哈希任务调度器（带背压控制）
 * 协调文件读取、Worker计算和进度跟踪
 */
export class HashTaskScheduler {
  private logger: ILogger;
  private chunkReader: FileChunkReader;
  private workerPool: AlgorithmWorkerPool;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private isCancelled: boolean = false;
  private currentProgress: HashProgress;
  
  private scheduledTasks: ScheduledTask[] = [];
  private completedChunks: Map<number, string> = new Map();
  private startTime: number = 0;
  
  private progressCallbacks: ((progress: HashProgress) => void)[] = [];

  // 背压控制配置
  private readonly maxQueueSize: number = 100; // 最大队列长度
  private readonly highWaterMark: number = 80; // 高水位标记
  private readonly lowWaterMark: number = 20;  // 低水位标记
  private isBackpressured: boolean = false;

  // 信号量控制并发
  private semaphore: {
    available: number;
    waiting: Array<() => void>;
    acquire: () => Promise<void>;
    release: () => void;
  };

  constructor(
    private file: File,
    private algorithm: HashAlgorithm,
    private config: HashCalculatorConfig
  ) {
    this.logger = Logger.for(this.constructor.name);
    
    // 初始化分片读取器
    this.chunkReader = new FileChunkReader({
      chunkSize: config.chunkSize || 1024 * 1024, // 默认1MB
      bufferSize: 2
    });
    
    // 初始化信号量
    const maxWorkers = config.maxWorkers || Math.min(navigator.hardwareConcurrency || 4, 8);
    this.semaphore = {
      available: maxWorkers,
      waiting: [],
      acquire: async (): Promise<void> => {
        if (this.semaphore.available > 0) {
          this.semaphore.available--;
          return Promise.resolve();
        }
        
        return new Promise(resolve => {
          this.semaphore.waiting.push(resolve);
        });
      },
      release: (): void => {
        if (this.semaphore.waiting.length > 0) {
          const resolve = this.semaphore.waiting.shift()!;
          resolve();
        } else {
          this.semaphore.available++;
        }
      }
    };
    
    // 初始化进度信息
    const totalChunks = Math.ceil(file.size / (config.chunkSize || 1024 * 1024));
    this.currentProgress = {
      processedChunks: 0,
      totalChunks,
      processedBytes: 0,
      totalBytes: file.size,
      percentage: 0
    };
    
    this.logger.info('HashTaskScheduler initialized', {
      fileName: file.name,
      fileSize: file.size,
      chunkSize: config.chunkSize,
      totalChunks,
      maxWorkers,
      maxQueueSize: this.maxQueueSize
    });
  }

  /**
   * 🎯 开始计算
   */
  public async start(
    onProgress?: (progress: HashProgress) => void
  ): Promise<Map<number, string>> {
    if (this.isRunning) {
      throw new Error('Scheduler already running');
    }

    this.logger.info('Starting hash computation');
    this.startTime = performance.now();
    this.isRunning = true;
    
    // 注册进度回调
    if (onProgress) {
      this.progressCallbacks.push(onProgress);
    }

    try {
      // 初始化Worker池
      this.logger.debug('Initializing worker pool');
      this.workerPool = new AlgorithmWorkerPool(
        this.algorithm,
        this.config.maxWorkers || Math.min(navigator.hardwareConcurrency || 4, 8),
        {
          enableMemoryPool: true,
          useTransferable: true,
          memoryPoolSize: 10
        }
      );
      
      await this.workerPool.initialize();
      
      // 开始调度任务
      await this.scheduleTasks();
      
      // 等待所有任务完成
      await this.waitForCompletion();
      
      // 验证结果
      this.validateResults();
      
      const totalTime = performance.now() - this.startTime;
      this.logger.info('Hash computation completed', {
        totalTime: totalTime.toFixed(2),
        chunksProcessed: this.completedChunks.size,
        avgQueueLength: this.scheduledTasks.length > 0 ? 
          this.scheduledTasks.reduce((sum, t) => sum + (performance.now() - t.startTime), 0) / this.scheduledTasks.length : 0
      });
      
      return this.completedChunks;
      
    } catch (error) {
      this.logger.error('Hash computation failed', { error });
      throw error;
      
    } finally {
      // 清理资源
      await this.cleanup();
    }
  }

  /**
   * 🎯 调度任务（带背压控制）
   */
  private async scheduleTasks(): Promise<void> {
    this.logger.debug('Starting task scheduling with backpressure control');
    
    try {
      // 遍历文件分片
      for await (const chunk of this.chunkReader.readFile(this.file)) {
        // 检查是否取消
        if (this.isCancelled) {
          this.logger.info('Scheduling cancelled');
          throw new Error('Computation cancelled');
        }
        
        // 检查是否暂停
        await this.waitIfPaused();
        
        // 检查背压
        if (this.scheduledTasks.length >= this.maxQueueSize) {
          this.isBackpressured = true;
          this.logger.warn('Backpressure triggered', {
            queueSize: this.scheduledTasks.length,
            maxQueueSize: this.maxQueueSize
          });
          
          // 等待队列缓解
          await this.waitForQueueDrain();
        }
        
        // 调度分片计算
        await this.scheduleChunk(chunk);
      }
      
      this.logger.debug('All chunks scheduled');
      
    } catch (error) {
      if (error instanceof Error && error.message !== 'Computation cancelled') {
        this.logger.error('Error during task scheduling', { error });
      }
      throw error;
    }
  }

  /**
   * 🎯 调度单个分片（带信号量控制）
   */
  private async scheduleChunk(chunk: FileChunk): Promise<void> {
    const startTime = performance.now();
    
    this.logger.debug('Scheduling chunk', {
      chunkIndex: chunk.index,
      chunkSize: chunk.size,
      offset: chunk.offset,
      queueSize: this.scheduledTasks.length,
      availableWorkers: this.semaphore.available
    });
    
    // 获取信号量（控制并发）
    await this.semaphore.acquire();
    
    try {
      // 创建计算任务
      const computePromise = this.workerPool.computeChunk(
        chunk.data,
        this.config.algorithmOptions
      ).then(hash => {
        const computeTime = performance.now() - startTime;
        
        // 存储结果
        this.completedChunks.set(chunk.index, hash);
        
        // 更新进度
        this.updateProgress(chunk);
        
        // 释放信号量
        this.semaphore.release();
        
        // 检查是否需要恢复生产
        if (this.isBackpressured && this.scheduledTasks.length <= this.lowWaterMark) {
          this.isBackpressured = false;
          this.logger.debug('Backpressure released');
        }
        
        this.logger.debug('Chunk computation completed', {
          chunkIndex: chunk.index,
          computeTime: computeTime.toFixed(2),
          queueTime: (performance.now() - startTime).toFixed(2),
          hash: hash.substring(0, 16) + '...'
        });
        
        return hash;
      }).catch(error => {
        // 即使失败也要释放信号量
        this.semaphore.release();
        this.logger.error('Chunk computation failed', {
          chunkIndex: chunk.index,
          error: error.message
        });
        throw error;
      });
      
      // 记录调度任务
      this.scheduledTasks.push({
        chunk,
        promise: computePromise,
        startTime
      });
      
    } catch (error) {
      // 发生异常时释放信号量
      this.semaphore.release();
      throw error;
    }
  }

  /**
   * 🎯 等待队列缓解
   */
  private async waitForQueueDrain(): Promise<void> {
    return new Promise(resolve => {
      this.logger.debug('Waiting for queue to drain', {
        currentSize: this.scheduledTasks.length,
        targetSize: this.lowWaterMark
      });
      
      const checkInterval = setInterval(() => {
        if (this.scheduledTasks.length <= this.lowWaterMark || this.isCancelled) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * 🎯 更新进度
   */
  private updateProgress(chunk: FileChunk): void {
    this.currentProgress.processedChunks++;
    this.currentProgress.processedBytes += chunk.size;
    this.currentProgress.percentage = 
      (this.currentProgress.processedBytes / this.currentProgress.totalBytes) * 100;
    
    // 计算速度
    const elapsedTime = (performance.now() - this.startTime) / 1000; // 秒
    if (elapsedTime > 0) {
      this.currentProgress.currentSpeed = this.currentProgress.processedBytes / elapsedTime;
      
      // 计算预计剩余时间
      const remainingBytes = this.currentProgress.totalBytes - this.currentProgress.processedBytes;
      this.currentProgress.estimatedTime = remainingBytes / this.currentProgress.currentSpeed;
    }
    
    // 通知进度回调
    this.notifyProgress();
  }

  /**
   * 🎯 通知进度更新
   */
  private notifyProgress(): void {
    const progress = { ...this.currentProgress };
    
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        this.logger.warn('Progress callback error', { error });
      }
    });
    
    // 定期记录进度
    if (this.currentProgress.processedChunks % 10 === 0 || this.currentProgress.percentage >= 100) {
      this.logger.info('Progress update', {
        percentage: progress.percentage.toFixed(1),
        processedChunks: progress.processedChunks,
        totalChunks: progress.totalChunks,
        processedMB: (progress.processedBytes / 1024 / 1024).toFixed(2),
        totalMB: (progress.totalBytes / 1024 / 1024).toFixed(2),
        speedMBps: progress.currentSpeed ? (progress.currentSpeed / 1024 / 1024).toFixed(2) : undefined,
        queueSize: this.scheduledTasks.length,
        backpressured: this.isBackpressured
      });
    }
  }

  /**
   * 🎯 等待所有任务完成
   */
  private async waitForCompletion(): Promise<void> {
    this.logger.debug('Waiting for all tasks to complete', {
      pendingTasks: this.scheduledTasks.length
    });
    
    try {
      // 等待所有调度任务完成
      await Promise.all(this.scheduledTasks.map(task => task.promise));
      
      this.logger.debug('All tasks completed successfully');
      
    } catch (error) {
      this.logger.error('Some tasks failed', { error });
      throw error;
    }
  }

  /**
   * 🎯 验证结果
   */
  private validateResults(): void {
    const expectedChunks = this.currentProgress.totalChunks;
    const actualChunks = this.completedChunks.size;
    
    if (expectedChunks !== actualChunks) {
      const missingChunks = [];
      for (let i = 0; i < expectedChunks; i++) {
        if (!this.completedChunks.has(i)) {
          missingChunks.push(i);
        }
      }
      
      throw new Error(`Missing chunks: ${missingChunks.join(', ')}`);
    }
    
    this.logger.debug('All chunk results validated', {
      expectedChunks,
      actualChunks
    });
  }

  /**
   * 🎯 暂停计算
   */
  public pause(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      this.chunkReader.pause();
      this.workerPool?.pause();
      this.logger.info('Computation paused');
    }
  }

  /**
   * 🎯 恢复计算
   */
  public resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.chunkReader.resume();
      this.workerPool?.resume();
      this.logger.info('Computation resumed');
    }
  }

  /**
   * 🎯 取消计算
   */
  public cancel(): void {
    if (!this.isCancelled) {
      this.isCancelled = true;
      this.chunkReader.cancel();
      this.workerPool?.cancel();
      
      // 释放所有等待的信号量
      while (this.semaphore.waiting.length > 0) {
        const resolve = this.semaphore.waiting.shift()!;
        resolve();
      }
      
      this.logger.info('Computation cancelled');
    }
  }

  /**
   * 🎯 等待暂停状态
   */
  private async waitIfPaused(): Promise<void> {
    while (this.isPaused && !this.isCancelled) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * 🎯 获取当前状态
   */
  public getStatus(): {
    isRunning: boolean;
    isPaused: boolean;
    isCancelled: boolean;
    progress: HashProgress;
    completedChunks: number;
    scheduledTasks: number;
    queueStats: {
      currentSize: number;
      maxSize: number;
      backpressured: boolean;
      availableWorkers: number;
      waitingTasks: number;
    };
  } {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      isCancelled: this.isCancelled,
      progress: { ...this.currentProgress },
      completedChunks: this.completedChunks.size,
      scheduledTasks: this.scheduledTasks.length,
      queueStats: {
        currentSize: this.scheduledTasks.length,
        maxSize: this.maxQueueSize,
        backpressured: this.isBackpressured,
        availableWorkers: this.semaphore.available,
        waitingTasks: this.semaphore.waiting.length
      }
    };
  }

  /**
   * 🎯 清理资源
   */
  private async cleanup(): Promise<void> {
    this.logger.debug('Cleaning up scheduler resources');
    
    // 清理Worker池
    if (this.workerPool) {
      await this.workerPool.destroy();
    }
    
    // 清理回调
    this.progressCallbacks = [];
    
    // 重置信号量
    this.semaphore = {
      available: this.config.maxWorkers || Math.min(navigator.hardwareConcurrency || 4, 8),
      waiting: [],
      acquire: async (): Promise<void> => {
        if (this.semaphore.available > 0) {
          this.semaphore.available--;
          return Promise.resolve();
        }
        
        return new Promise(resolve => {
          this.semaphore.waiting.push(resolve);
        });
      },
      release: (): void => {
        if (this.semaphore.waiting.length > 0) {
          const resolve = this.semaphore.waiting.shift()!;
          resolve();
        } else {
          this.semaphore.available++;
        }
      }
    };
    
    this.isRunning = false;
    
    this.logger.info('Scheduler cleanup completed');
  }
}