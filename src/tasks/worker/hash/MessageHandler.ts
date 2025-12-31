import { ILogger } from '@orbitjs/logger';
import { WorkerResponse, HashWorkerConfig } from '../types';
import { TaskManager } from './TaskManager';
import { FileHashProcessor } from './FileHashProcessor';
import { HashWorkerError, AlgorithmNotSupportedError } from '../../errors';

/**
 * 消息处理器
 * 
 * 该类负责处理从Web Worker返回的各种消息，包括分片结果、完整结果、进度更新和错误信息。
 * 根据不同的消息类型执行相应的处理逻辑，协调任务管理器和文件哈希处理器完成哈希计算流程。
 */
export class MessageHandler {
  private logger: ILogger;

  /**
   * 构造函数
   * 
   * @param taskManager - 任务管理器，用于管理所有哈希计算任务的状态
   * @param chunkSize - 文件分块大小，用于计算进度和分片处理
   * @param fileHashProcessor - 文件哈希处理器，用于处理最终的哈希结果
   * @param postMessage - 向Web Worker发送消息的函数
   * @param logger - 日志记录器，用于记录调试和运行时信息
   */
  constructor(
    private taskManager: TaskManager,
    private chunkSize: number,
    private fileHashProcessor: FileHashProcessor,
    private postMessage: (data: any) => void,
    logger: ILogger
  ) {
    this.logger = logger;
  }

  /**
   * 处理从Web Worker接收到的消息事件
   * 
   * 这是消息处理的主要入口点，接收来自Web Worker的所有消息，
   * 并根据消息类型分发到相应的处理方法。
   * 
   * @param event - 包含Worker消息的MessageEvent对象
   */
  public handleMessage(event: MessageEvent): void {
    const response: WorkerResponse = event.data;
    this.logger.debug(`Received message from worker: ${response.type}`);

    switch (response.type) {
      case 'READY':
        // Worker初始化完成，准备就绪
        this.logger.info('Hash worker ready');
        break;

      case 'CHUNK_RESULT':
        // 接收到文件分片的哈希计算结果
        this.handleChunkResult(response as Extract<WorkerResponse, { type: 'CHUNK_RESULT' }>);
        break;

      case 'FULL_RESULT':
        // 接收到完整的哈希计算结果（可能是单个数据块或合并后的文件哈希）
        this.handleFullResult(response as Extract<WorkerResponse, { type: 'FULL_RESULT' }>);
        break;

      case 'PROGRESS':
        // 接收到处理进度更新
        this.handleProgress(response as Extract<WorkerResponse, { type: 'PROGRESS' }>);
        break;

      case 'ERROR':
        // 接收到错误信息
        this.handleWorkerError(response as Extract<WorkerResponse, { type: 'ERROR' }>);
        break;

      default:
        // 处理未知的消息类型
        // 使用类型断言来绕过TypeScript的类型检查
        const unknownType = (response as { type: string }).type;
        this.logger.warn(`Unknown message type received from worker: ${unknownType}`);
        break;
    }
  }

  /**
   * 处理文件分片的哈希计算结果
   * 
   * 当Web Worker完成一个文件分片的哈希计算后，会发送此类型的消息。
   * 该方法负责更新任务状态，发出进度事件，并在所有分片完成后触发最终的哈希合并。
   * 
   * @param response - 包含分片结果的消息对象
   * @private
   */
  private handleChunkResult(response: Extract<WorkerResponse, { type: 'CHUNK_RESULT' }>): void {
    const { taskId, hash, index } = response;
    const [mainTaskId, chunkIndex] = taskId.split('_');
    this.logger.debug(`Received chunk result for task: ${mainTaskId}, chunk: ${chunkIndex}`);

    // 更新指定任务的分片处理状态，记录已完成的分片哈希值
    this.taskManager.updateChunkState(mainTaskId, parseInt(chunkIndex), hash, this.chunkSize);

    // 获取更新后的分片状态，用于计算进度
    const state = this.taskManager.getChunkState(mainTaskId);
    if (!state) {
      this.logger.warn(`No chunk state found for task: ${mainTaskId}`);
      return;
    }

    // 发出分片完成事件，通知监听器当前的处理进度
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

    // 检查是否所有分片都已完成处理
    if (this.taskManager.isChunkProcessingComplete(mainTaskId, Math.ceil(state.totalBytes / this.chunkSize))) {
      this.logger.info(`All chunks completed for task: ${mainTaskId}`);
      
      // 获取原始任务的开始时间和文件信息
      const task = this.taskManager.getTask(mainTaskId);
      if (task && task.file) {
        // 触发最终的哈希合并处理
        this.fileHashProcessor.finalizeChunkedHash(mainTaskId, task.startTime, task.file.size);
      } else {
        this.logger.warn(`Main task not found or no file associated with task: ${mainTaskId}`);
      }
    }
  }

  /**
   * 处理完整的哈希计算结果
   * 
   * 当Web Worker完成整个数据块或合并后的文件哈希计算后，会发送此类型的消息。
   * 该方法负责解析结果，并根据任务类型（数据哈希或文件哈希）解析相应的Promise。
   * 
   * @param response - 包含完整哈希结果的消息对象
   * @private
   */
  private handleFullResult(response: Extract<WorkerResponse, { type: 'FULL_RESULT' }>): void {
    const { hash, algorithm } = response;
    this.logger.info(`Received full result for algorithm: ${algorithm}`);

    // 首先检查是否为数据任务（由hashData调用产生的任务）
    for (const taskId of this.taskManager.getDataTaskIds()) {
      const task = this.taskManager.getDataTask(taskId);
      if (task) {
        this.logger.debug(`Resolving data task: ${taskId}`);
        // 解析数据任务的Promise，返回哈希结果
        task.resolve(hash);
        // 从任务管理器中移除已完成的任务
        this.taskManager.removeTask(taskId);
        return; // 找到并处理了数据任务，直接返回
      }
    }

    // 如果不是数据任务，则是文件任务（由hashFile调用产生的最终合并哈希任务）
    for (const taskId of this.taskManager.getTaskIds()) {
      const task = this.taskManager.getTask(taskId);
      // 通过检查task.file属性来区分是中间任务还是最终任务
      // 最终任务没有关联的file属性，因为它是合并后的结果
      if (task && !task.file) {
        this.logger.debug(`Resolving file task: ${taskId}`);
        // 解析文件任务的Promise，返回最终的哈希结果
        task.resolve(hash);
        // 从任务管理器中移除已完成的任务
        this.taskManager.removeTask(taskId);
        return; // 找到并处理了文件任务，直接返回
      }
    }

    // 如果没有找到匹配的任务
    this.logger.warn(`No matching task found for full hash result`);
  }

  /**
   * 处理处理进度更新
   * 
   * 当Web Worker报告哈希计算的进度时，会发送此类型的消息。
   * 该方法负责记录进度信息并向外部监听器发出进度事件。
   * 
   * @param response - 包含进度信息的消息对象
   * @private
   */
  private handleProgress(response: Extract<WorkerResponse, { type: 'PROGRESS' }>): void {
    const { processed, total } = response;
    this.logger.debug(`Progress update: ${processed}/${total} (${Math.round((processed/total)*100)}%)`);

    // 计算百分比，注意这里有一个bug：应该是 (processed / total) * 100，而不是 (processed / total) / total * 100
    const percentage = Math.round((processed / total) * 100);

    // 发出进度事件，通知监听器当前的处理进度
    this.taskManager.emit({
      type: 'progress',
      data: {
        processedBytes: processed,
        totalBytes: total,
        percentage: percentage,
        currentChunk: 0,
        totalChunks: 0,
      },
    });
  }

  /**
   * 处理Web Worker发生的错误
   * 
   * 当Web Worker在执行过程中发生错误时，会发送此类型的消息。
   * 该方法负责记录错误信息，拒绝相关任务的Promise，并向外部监听器发出错误事件。
   * 
   * @param response - 包含错误信息的消息对象
   * @private
   */
  private handleWorkerError(response: Extract<WorkerResponse, { type: 'ERROR' }>): void {
    const { error, taskId } = response;
    this.logger.error(`Worker error: ${error}`, { taskId });

    // 如果错误与特定任务相关
    if (taskId) {
      const mainTaskId = taskId.split('_')[0];
      const task = this.taskManager.getTask(mainTaskId);
      
      if (!task) {
        // 检查是否是数据任务（由hashData调用产生的任务）
        const dataTask = this.taskManager.getDataTask(mainTaskId);
        if (dataTask) {
          // 创建哈希工作器错误对象
          const hashError = new HashWorkerError(error, { taskId: mainTaskId });
          // 拒绝数据任务的Promise
          dataTask.reject(hashError);
          // 从任务管理器中移除已失败的任务
          this.taskManager.removeTask(mainTaskId);
        } else {
          this.logger.warn(`No task found for error: ${error}, taskId: ${mainTaskId}`);
        }
      } else {
        // 创建哈希工作器错误对象
        const hashError = new HashWorkerError(error, { taskId: mainTaskId });
        // 拒绝文件任务的Promise
        task.reject(hashError);
        // 从任务管理器中移除已失败的任务
        this.taskManager.removeTask(mainTaskId);
      }
    }

    // 创建通用的哈希错误对象
    const hashError = new HashWorkerError(error, { taskId });
    // 向任务管理器发出错误事件，通知所有监听器
    this.taskManager.emit({ type: 'error', data: hashError });
  }
}