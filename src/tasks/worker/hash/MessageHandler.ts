import { ILogger } from '@orbitjs/logger';
import { WorkerResponse, HashWorkerConfig } from '../types';
import { TaskManager } from './TaskManager';
import { AlgorithmRegistry } from './AlgorithmRegistry';
import { FileHashProcessor } from './FileHashProcessor';
import { HashWorkerError, AlgorithmNotSupportedError } from '../errors';

export class MessageHandler {
  private logger: ILogger;

  constructor(
    private taskManager: TaskManager,
    private algorithmRegistry: AlgorithmRegistry,
    private chunkSize: number,
    private fileHashProcessor: FileHashProcessor,
    private postMessage: (data: any) => void,
    logger: ILogger
  ) {
    this.logger = logger;
  }

  /**
   * 处理Worker消息
   */
  public handleMessage(event: MessageEvent): void {
    const response: WorkerResponse = event.data;
    this.logger.debug(`Received message from worker: ${response.type}`);

    switch (response.type) {
      case 'READY':
        this.logger.info('Hash worker ready');
        break;

      case 'CHUNK_RESULT':
        this.handleChunkResult(response as Extract<WorkerResponse, { type: 'CHUNK_RESULT' }>);
        break;

      case 'FULL_RESULT':
        this.handleFullResult(response as Extract<WorkerResponse, { type: 'FULL_RESULT' }>);
        break;

      case 'PROGRESS':
        this.handleProgress(response as Extract<WorkerResponse, { type: 'PROGRESS' }>);
        break;

      case 'ERROR':
        this.handleWorkerError(response as Extract<WorkerResponse, { type: 'ERROR' }>);
        break;
    }
  }

  /**
   * 处理分片结果
   */
  private handleChunkResult(response: Extract<WorkerResponse, { type: 'CHUNK_RESULT' }>): void {
    const { taskId, hash, index } = response;
    const [mainTaskId, chunkIndex] = taskId.split('_');
    this.logger.debug(`Received chunk result for task: ${mainTaskId}, chunk: ${chunkIndex}`);

    // 更新分片处理状态
    this.taskManager.updateChunkState(mainTaskId, parseInt(chunkIndex), hash, this.chunkSize);

    // 获取更新后的状态
    const state = this.taskManager.getChunkState(mainTaskId);
    if (!state) return;

    // 发出分片完成事件
    this.taskManager.emit({
      type: 'chunk-complete',
      data: {
        processedBytes: state.processedBytes,
        totalBytes: state.totalBytes,
        percentage: Math.round((state.processedBytes / state.totalBytes) * 100),
        currentChunk: parseInt(chunkIndex) + 1,
        totalChunks: Math.ceil(state.totalBytes / this.chunkSize),
      },
    });

    // 检查是否所有分片都已完成
    if (this.taskManager.isChunkProcessingComplete(mainTaskId, Math.ceil(state.totalBytes / this.chunkSize))) {
      this.logger.info(`All chunks completed for task: ${mainTaskId}`);
      // 获取原始任务的开始时间
      const task = this.taskManager.getTask(mainTaskId);
      if (task && task.file) {
        this.fileHashProcessor.finalizeChunkedHash(mainTaskId, task.startTime, task.file.size);
      }
    }
  }

  /**
   * 处理完整结果
   */
  private handleFullResult(response: Extract<WorkerResponse, { type: 'FULL_RESULT' }>): void {
    const { hash, algorithm } = response;
    this.logger.info(`Received full result for algorithm: ${algorithm}`);

    // 首先检查是否为数据任务（即hashData调用产生的任务）
    for (const taskId of this.taskManager.getDataTaskIds()) {
      const task = this.taskManager.getDataTask(taskId);
      if (task) {
        this.logger.debug(`Resolving data task: ${taskId}`);
        task.resolve(hash);
        this.taskManager.removeTask(taskId);
        return; // 找到并处理了数据任务，直接返回
      }
    }

    // 如果不是数据任务，则是文件任务（hashFile调用产生的最终合并哈希任务）
    for (const taskId of this.taskManager.getTaskIds()) {
      const task = this.taskManager.getTask(taskId);
      if (task && !task.file) { // 通过检查task.file来区分是中间任务还是最终任务
        this.logger.debug(`Resolving file task: ${taskId}`);
        task.resolve(hash);
        this.taskManager.removeTask(taskId);
        return; // 找到并处理了文件任务，直接返回
      }
    }
  }

  /**
   * 处理进度更新
   */
  private handleProgress(response: Extract<WorkerResponse, { type: 'PROGRESS' }>): void {
    const { processed, total } = response;
    this.logger.debug(`Progress update: ${processed}/${total} (${Math.round((processed/total)*100)}%)`);

    this.taskManager.emit({
      type: 'progress',
      data: {
        processedBytes: processed,
        totalBytes: total,
        percentage: Math.round((processed / total) * 100),
        currentChunk: 0,
        totalChunks: 0,
      },
    });
  }

  /**
   * 处理Worker错误
   */
  private handleWorkerError(response: Extract<WorkerResponse, { type: 'ERROR' }>): void {
    const { error, taskId } = response;
    this.logger.error(`Worker error: ${error}`, { taskId });

    if (taskId) {
      const mainTaskId = taskId.split('_')[0];
      const task = this.taskManager.getTask(mainTaskId);
      if (!task) {
        // 检查是否是数据任务
        const dataTask = this.taskManager.getDataTask(mainTaskId);
        if (dataTask) {
          const hashError = new HashWorkerError(error, { taskId: mainTaskId });
          dataTask.reject(hashError);
          this.taskManager.removeTask(mainTaskId);
        }
      } else {
        const hashError = new HashWorkerError(error, { taskId: mainTaskId });
        task.reject(hashError);
        this.taskManager.removeTask(mainTaskId);
      }
    }

    const hashError = new HashWorkerError(error, { taskId });
    this.taskManager.emit({ type: 'error', data: hashError });
  }
}