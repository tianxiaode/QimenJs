import { ILogger } from '@orbitjs/logger';
import { 
  HashResult, 
  HashProgress, 
  HashCallback, 
  HashEvent,
  ChunkTask,
  WorkerResponse
} from '../types';

export interface TaskContext {
  resolve: (value: string | HashResult) => void;
  reject: (reason?: any) => void;
  startTime: number;
  file?: File;
}

export interface DataTaskContext {
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
  startTime: number;
}

export interface ChunkProcessingState {
  hashes: Map<number, string>;
  processedBytes: number;
  totalBytes: number;
}

export class TaskManager {
  private activeTasks: Map<string, TaskContext> = new Map();
  private dataTasks: Map<string, DataTaskContext> = new Map();
  private chunkStates: Map<string, ChunkProcessingState> = new Map();
  private callbacks: HashCallback[] = [];
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * 添加任务（文件任务）
   */
  public addTask(taskId: string, context: TaskContext): void {
    this.activeTasks.set(taskId, context);
    this.logger.debug(`Added task: ${taskId}`);
  }

  /**
   * 添加任务（数据任务）
   */
  public addDataTask(taskId: string, context: DataTaskContext): void {
    this.dataTasks.set(taskId, context);
    this.logger.debug(`Added data task: ${taskId}`);
  }

  /**
   * 获取任务（文件任务）
   */
  public getTask(taskId: string): TaskContext | undefined {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      this.logger.debug(`Task not found: ${taskId}`);
    }
    return task;
  }

  /**
   * 获取任务（数据任务）
   */
  public getDataTask(taskId: string): DataTaskContext | undefined {
    const task = this.dataTasks.get(taskId);
    if (!task) {
      this.logger.debug(`Data task not found: ${taskId}`);
    }
    return task;
  }

  /**
   * 移除任务
   */
  public removeTask(taskId: string): void {
    const removedFileTask = this.activeTasks.delete(taskId);
    const removedDataTask = this.dataTasks.delete(taskId);
    
    if (removedFileTask || removedDataTask) {
      this.logger.debug(`Removed task: ${taskId}`);
    } else {
      this.logger.warn(`Attempted to remove non-existent task: ${taskId}`);
    }
  }

  /**
   * 获取所有任务ID
   */
  public getTaskIds(): string[] {
    return Array.from(this.activeTasks.keys());
  }

  /**
   * 获取所有数据任务ID
   */
  public getDataTaskIds(): string[] {
    return Array.from(this.dataTasks.keys());
  }

  /**
   * 清理所有任务
   */
  public clearAllTasks(): void {
    // 拒绝所有待处理的任务
    for (const [taskId, task] of this.activeTasks.entries()) {
      task.reject(new Error('Hash worker stopped'));
      this.logger.debug(`Rejected task during cleanup: ${taskId}`);
    }
    
    for (const [taskId, task] of this.dataTasks.entries()) {
      task.reject(new Error('Hash worker stopped'));
      this.logger.debug(`Rejected data task during cleanup: ${taskId}`);
    }
    
    this.activeTasks.clear();
    this.dataTasks.clear();
    this.chunkStates.clear();
    
    this.logger.info('Cleared all tasks');
  }

  /**
   * 添加分片处理状态
   */
  public addChunkState(taskId: string, totalBytes: number): void {
    this.chunkStates.set(taskId, {
      hashes: new Map(),
      processedBytes: 0,
      totalBytes
    });
    this.logger.debug(`Added chunk state for task: ${taskId}, total bytes: ${totalBytes}`);
  }

  /**
   * 更新分片处理状态
   */
  public updateChunkState(taskId: string, chunkIndex: number, hash: string, chunkSize: number): void {
    const state = this.chunkStates.get(taskId);
    if (!state) {
      this.logger.warn(`Chunk state not found for task: ${taskId}`);
      return;
    }

    state.hashes.set(chunkIndex, hash);
    state.processedBytes = Math.min(state.processedBytes + chunkSize, state.totalBytes);
    this.logger.debug(`Updated chunk state for task: ${taskId}, chunk: ${chunkIndex}`);
  }

  /**
   * 获取分片处理状态
   */
  public getChunkState(taskId: string): ChunkProcessingState | undefined {
    return this.chunkStates.get(taskId);
  }

  /**
   * 检查分片是否全部完成
   */
  public isChunkProcessingComplete(taskId: string, totalChunks: number): boolean {
    const state = this.chunkStates.get(taskId);
    if (!state) return false;
    
    const isComplete = state.hashes.size === totalChunks;
    if (isComplete) {
      this.logger.debug(`All chunks processed for task: ${taskId}`);
    }
    return isComplete;
  }

  /**
   * 获取排序后的分片哈希值
   */
  public getSortedChunkHashes(taskId: string): string[] {
    const state = this.chunkStates.get(taskId);
    if (!state) return [];
    
    const hashes = Array.from(state.hashes.entries())
      .sort((a, b) => a[0] - b[0])
      .map(entry => entry[1]);
    
    this.logger.debug(`Retrieved sorted chunk hashes for task: ${taskId}, count: ${hashes.length}`);
    return hashes;
  }

  /**
   * 移除分片处理状态
   */
  public removeChunkState(taskId: string): void {
    const removed = this.chunkStates.delete(taskId);
    if (removed) {
      this.logger.debug(`Removed chunk state for task: ${taskId}`);
    }
  }

  /**
   * 注册事件回调
   */
  public on(callback: HashCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * 移除事件回调
   */
  public off(callback: HashCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * 触发事件
   */
  public emit(event: HashEvent): void {
    this.logger.debug(`Emitting event: ${event.type}`, event.data);
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        this.logger.error('Error in hash event callback:', error);
      }
    });
  }

  /**
   * 获取进度信息
   */
  public getProgress(taskId: string): HashProgress | null {
    const state = this.chunkStates.get(taskId);
    if (!state) return null;

    return {
      processedBytes: state.processedBytes,
      totalBytes: state.totalBytes,
      percentage: Math.round((state.processedBytes / state.totalBytes) * 100),
      currentChunk: 0, // 这个值在具体的进度处理中会更新
      totalChunks: 0,  // 这个值在具体的进度处理中会更新
    };
  }
}