
import { ILogger, Logger } from "@orbitjs/logger";
import { HashTaskScheduler } from "./HashTaskScheduler";
import { ResultAggregator } from "./ResultAggregator";
import {
  HashAlgorithm,
  HashCalculatorConfig,
  HashResult,
  HashProgress,
  CalculatorState
} from "./types";
import {
  UserOperationErrorCodes,
  HashErrorGuards
} from "./errors";

/**
 * 🎯 文件哈希计算器（主控制器）
 * 提供完整的文件哈希计算API，支持暂停、恢复、取消和进度跟踪
 */
export class FileHashCalculator {
  private logger: ILogger;
  private algorithm: HashAlgorithm;
  private config: Required<HashCalculatorConfig>;
  private currentState: CalculatorState = 'idle';
  private currentTask: HashTaskScheduler | null = null;
  private resultAggregator: ResultAggregator | null = null;
  
  private progressCallbacks: ((progress: HashProgress) => void)[] = [];
  private stateChangeCallbacks: ((state: CalculatorState) => void)[] = [];

  constructor(
    algorithm: HashAlgorithm,
    config: HashCalculatorConfig = {}
  ) {
    this.logger = Logger.for(this.constructor.name);
    this.algorithm = algorithm;
    
    // 设置默认配置
    this.config = {
      chunkSize: 1024 * 1024, // 默认1MB
      maxWorkers: Math.min(navigator.hardwareConcurrency || 4, 8),
      algorithmOptions: {},
      ...config
    };
    
    this.logger.info('FileHashCalculator initialized', {
      algorithmName: algorithm.name || 'anonymous',
      config: this.config
    });
  }

  /**
   * 🎯 计算文件哈希（主API）
   */
  public async compute(
    file: File,
    onProgress?: (progress: HashProgress) => void
  ): Promise<HashResult> {
    this.validateState('idle');
    this.setState('reading');
    
    this.logger.info('Starting file hash computation', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      chunkSize: this.config.chunkSize,
      maxWorkers: this.config.maxWorkers
    });

    // 注册进度回调
    if (onProgress) {
      this.progressCallbacks.push(onProgress);
    }

    try {
      // 1. 创建结果聚合器
      this.resultAggregator = new ResultAggregator(
        this.algorithm,
        this.getAlgorithmName(),
        this.config.algorithmOptions
      );
      
      // 2. 创建任务调度器
      this.currentTask = new HashTaskScheduler(
        file,
        this.algorithm,
        this.config
      );
      
      // 3. 启动计算（带进度回调）
      this.setState('computing');
      
      const chunkResults = await this.currentTask.start(
        this.createProgressHandler()
      );
      
      // 4. 将分片结果添加到聚合器
      for (const [index, hash] of chunkResults) {
        // 注意：这里需要获取分片的实际大小和计算时间
        // 为了简化，我们假设每个分片都有相同的配置
        // 实际实现中可以从调度器获取更详细的信息
        const chunkSize = Math.min(
          this.config.chunkSize,
          file.size - (index * this.config.chunkSize)
        );
        
        this.resultAggregator.addChunkResult(
          index,
          hash,
          index * this.config.chunkSize,
          chunkSize,
          0 // 计算时间可以从调度器获取
        );
      }
      
      // 5. 计算最终哈希
      const result = await this.resultAggregator.finalize(
        file.size,
        this.config.chunkSize
      );
      
      // 6. 完成
      this.logger.info('File hash computation completed successfully');
      this.setState('idle');
      
      return result;
      
    } catch (error) {
      this.handleError(error);
      throw error;
      
    } finally {
      this.cleanup();
    }
  }

  /**
   * 🎯 暂停计算
   */
  public pause(): void {
    this.validateState('reading', 'computing');
    
    if (this.currentTask) {
      this.currentTask.pause();
      this.setState('paused');
      
      this.logger.info('Computation paused');
    }
  }

  /**
   * 🎯 恢复计算
   */
  public resume(): void {
    this.validateState('paused');
    
    if (this.currentTask) {
      this.currentTask.resume();
      this.setState('computing');
      
      this.logger.info('Computation resumed');
    }
  }

  /**
   * 🎯 取消计算
   */
  public cancel(): void {
    this.validateState('reading', 'computing', 'paused');
    
    if (this.currentTask) {
      this.currentTask.cancel();
      this.setState('cancelled');
      
      this.logger.info('Computation cancelled');
    }
  }

  /**
   * 🎯 获取当前状态
   */
  public getState(): CalculatorState {
    return this.currentState;
  }

  /**
   * 🎯 获取配置
   */
  public getConfig(): Required<HashCalculatorConfig> {
    return { ...this.config };
  }

  /**
   * 🎯 更新配置（仅当空闲时）
   */
  public updateConfig(newConfig: Partial<HashCalculatorConfig>): void {
    if (this.currentState !== 'idle') {
      throw new Error('Cannot update config while computing');
    }
    
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    this.logger.info('Configuration updated', {
      oldConfig,
      newConfig: this.config,
      changes: this.getConfigChanges(oldConfig, this.config)
    });
  }

  /**
   * 🎯 获取算法名称
   */
  private getAlgorithmName(): string {
    return this.algorithm.name || 'CUSTOM';
  }

  /**
   * 🎯 创建进度处理器
   */
  private createProgressHandler(): (progress: HashProgress) => void {
    return (progress: HashProgress) => {
      // 记录进度
      this.logger.debug('Progress update', {
        percentage: progress.percentage.toFixed(1),
        processedMB: (progress.processedBytes / 1024 / 1024).toFixed(2),
        totalMB: (progress.totalBytes / 1024 / 1024).toFixed(2)
      });
      
      // 通知所有进度回调
      this.progressCallbacks.forEach(callback => {
        try {
          callback(progress);
        } catch (error) {
          this.logger.warn('Progress callback error', { error });
        }
      });
    };
  }

  /**
   * 🎯 验证状态
   */
  private validateState(...allowedStates: CalculatorState[]): void {
    if (!allowedStates.includes(this.currentState)) {
      throw new Error(
        `Invalid state: ${this.currentState}. Allowed: ${allowedStates.join(', ')}`
      );
    }
  }

  /**
   * 🎯 设置状态
   */
  private setState(newState: CalculatorState): void {
    const oldState = this.currentState;
    this.currentState = newState;
    
    this.logger.debug('State changed', {
      oldState,
      newState
    });
    
    // 通知状态变化回调
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        this.logger.warn('State change callback error', { error });
      }
    });
  }

  /**
   * 🎯 处理错误
   */
  private handleError(error: any): void {
    this.logger.error('Computation error', { error });
    
    // 根据错误类型设置状态
    if (HashErrorGuards.isUserOperationHashError(error)) {
      if (error.code === UserOperationErrorCodes.OPERATION_CANCELLED) {
        this.setState('cancelled');
        return;
      } else if (error.code === UserOperationErrorCodes.OPERATION_PAUSED) {
        this.setState('paused');
        return;
      }
    }
    
    this.setState('error');
  }

  /**
   * 🎯 清理资源
   */
  private cleanup(): void {
    this.logger.debug('Cleaning up calculator resources');
    
    // 清理任务
    if (this.currentTask) {
      // 注意：HashTaskScheduler已经有自己的清理逻辑
      this.currentTask = null;
    }
    
    // 清理聚合器
    if (this.resultAggregator) {
      this.resultAggregator = null;
    }
    
    // 清理回调
    this.progressCallbacks = [];
    
    this.logger.info('Calculator cleanup completed');
  }

  /**
   * 🎯 获取配置变化
   */
  private getConfigChanges(
    oldConfig: Required<HashCalculatorConfig>,
    newConfig: Required<HashCalculatorConfig>
  ): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};
    
    (Object.keys(newConfig) as Array<keyof HashCalculatorConfig>).forEach(key => {
      if (oldConfig[key] !== newConfig[key]) {
        changes[key] = {
          old: oldConfig[key],
          new: newConfig[key]
        };
      }
    });
    
    return changes;
  }

  /**
   * 🎯 注册状态变化监听器
   */
  public onStateChange(callback: (state: CalculatorState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * 🎯 移除状态变化监听器
   */
  public offStateChange(callback: (state: CalculatorState) => void): void {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * 🎯 获取计算器信息
   */
  public getInfo(): {
    algorithmName: string;
    config: Required<HashCalculatorConfig>;
    state: CalculatorState;
    supportsWorkers: boolean;
  } {
    return {
      algorithmName: this.getAlgorithmName(),
      config: this.getConfig(),
      state: this.currentState,
      supportsWorkers: typeof Worker !== 'undefined'
    };
  }

  /**
   * 🎯 静态方法：快速计算（简化API）
   */
  public static async computeHash(
    file: File,
    algorithm: HashAlgorithm,
    options?: {
      chunkSize?: number;
      maxWorkers?: number;
      onProgress?: (progress: HashProgress) => void;
    }
  ): Promise<string> {
    const calculator = new FileHashCalculator(algorithm, {
      chunkSize: options?.chunkSize,
      maxWorkers: options?.maxWorkers
    });
    
    const result = await calculator.compute(file, options?.onProgress);
    return result.totalHash;
  }

  /**
   * 🎯 静态方法：计算文件分片哈希（用于断点续传）
   */
  public static async computeChunkHashes(
    file: File,
    algorithm: HashAlgorithm,
    options?: {
      chunkSize?: number;
      maxWorkers?: number;
    }
  ): Promise<Map<number, string>> {
    const calculator = new FileHashCalculator(algorithm, {
      chunkSize: options?.chunkSize,
      maxWorkers: options?.maxWorkers
    });
    
    // 创建一个临时调度器来获取分片哈希
    const scheduler = new HashTaskScheduler(
      file,
      algorithm,
      {
        chunkSize: options?.chunkSize || 1024 * 1024,
        maxWorkers: options?.maxWorkers
      }
    );
    
    // 启动调度器但不聚合结果
    return scheduler.start();
  }
}