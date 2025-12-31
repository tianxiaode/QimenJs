import { ILogger } from '@orbitjs/logger';
import { HashAlgorithm, HashFormat, HashOptions, HashResult } from '../types';
import { TaskManager } from './TaskManager';

/**
 * 文件哈希处理器
 * 
 * 该类负责处理文件的哈希计算任务，通过将文件分块并发送给Web Worker进行计算
 * 支持大文件的分块处理，避免内存占用过高
 */
export class FileHashProcessor {
  private logger: ILogger;

  /**
   * 构造函数
   * 
   * @param taskManager - 任务管理器，用于跟踪和管理哈希计算任务
   * @param algorithm - 要使用的哈希算法
   * @param chunkSize - 文件分块大小，默认为1MB
   * @param format - 哈希结果的输出格式
   * @param seed - 哈希计算的种子值
   * @param normalizeLineEndings - 是否标准化行结束符
   * @param postMessage - 用于向Web Worker发送消息的函数
   * @param logger - 日志记录器
   */
  constructor(
    private taskManager: TaskManager,
    private algorithm: HashAlgorithm,
    private chunkSize: number,
    private format: HashFormat,
    private seed: number,
    private normalizeLineEndings: boolean,
    private postMessage: (data: any) => void,
    logger: ILogger
  ) {
    this.logger = logger;
  }

  /**
   * 处理文件哈希计算
   * 
   * 将文件分块并发送给Web Worker进行计算，支持进度跟踪
   * 
   * @param file - 要计算哈希的File对象
   * @param callback - 计算完成后的回调函数
   */
  public process(file: File, callback: (result: any) => void): void {
    const taskId = this.taskManager.createTask(file.name, callback);
    const startTime = Date.now();

    this.logger.info(`Starting hash calculation for file: ${file.name}, size: ${file.size} bytes`);

    // 发送初始化消息给Worker
    this.postMessage({
      type: 'INIT_FILE_HASH',
      taskId,
      fileName: file.name,
      fileSize: file.size,
      algorithm: this.algorithm,
      options: {
        chunkSize: this.chunkSize,
        format: this.format,
        seed: this.seed,
        normalizeLineEndings: this.normalizeLineEndings,
      },
    });

    this.processChunk(file, 0, taskId, startTime);
  }

  /**
   * 处理文件分块
   * 
   * 递归处理文件的每个分块，直到整个文件处理完成
   * 
   * @param file - 要处理的文件
   * @param start - 当前分块的起始位置
   * @param taskId - 任务ID
   * @param startTime - 任务开始时间戳
   * @private
   */
  private processChunk(
    file: File,
    start: number,
    taskId: string,
    startTime: number
  ): void {
    if (start >= file.size) {
      // 文件处理完成，发送结束消息
      this.postMessage({
        type: 'END_FILE_HASH',
        taskId,
      });
      return;
    }

    const end = Math.min(start + this.chunkSize, file.size);
    const chunk = file.slice(start, end);

    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.logger.debug(`Processing chunk ${start}-${end} of file: ${file.name}`);

      // 发送分块数据给Worker
      this.postMessage({
        type: 'FILE_CHUNK',
        taskId,
        chunk: event.target.result,
        start,
        end,
        totalSize: file.size,
      });

      // 递归处理下一个分块
      setTimeout(() => {
        this.processChunk(file, end, taskId, startTime);
      }, 0);
    };

    reader.onerror = () => {
      this.logger.error(`Error reading chunk ${start}-${end} of file: ${file.name}`);
      throw new Error(`Error reading file chunk`);
    };

    reader.readAsArrayBuffer(chunk);
  }

  /**
   * 完成分块哈希计算并生成最终结果
   * 
   * 当所有分块的哈希计算完成后，此方法将合并结果并生成最终的哈希值
   * 
   * @param taskId - 主任务ID
   * @param startTime - 任务开始时间
   * @param fileSize - 文件大小
   */
  public finalizeChunkedHash(taskId: string, startTime: number, fileSize: number): void {
    // 获取任务的分片状态
    const chunkState = this.taskManager.getChunkState(taskId);
    if (!chunkState) {
      this.logger.warn(`No chunk state found for task: ${taskId}`);
      return;
    }

    // 获取所有分片哈希并按索引排序
    const sortedHashes = this.taskManager.getSortedChunkHashes(taskId);
    if (sortedHashes.length === 0) {
      this.logger.warn(`No chunk hashes found for task: ${taskId}`);
      return;
    }

    // 计算总时间
    const timeCost = Date.now() - startTime;

    // 创建哈希结果对象
    const hashResult: HashResult = {
      algorithm: this.algorithm,
      hash: this.mergeHashes(sortedHashes),
      format: this.format,
      fileSize,
      timeCost,
      chunkCount: sortedHashes.length,
    };

    // 获取任务上下文并解析
    const task = this.taskManager.getTask(taskId);
    if (task) {
      task.resolve(hashResult);
      this.taskManager.removeTask(taskId);
      this.taskManager.removeChunkState(taskId);
      this.logger.info(`Finalized chunked hash for task: ${taskId}, final hash: ${hashResult.hash}`);
    } else {
      this.logger.warn(`Task context not found for task: ${taskId}`);
    }
  }

  /**
   * 合并多个分片哈希值
   * 
   * 将所有分片的哈希值合并为一个最终的哈希值
   * 
   * @param hashes - 分片哈希值数组
   * @returns 合并后的哈希值
   * @private
   */
  private mergeHashes(hashes: string[]): string {
    // 简单的合并策略：将所有哈希连接后再次计算哈希
    // 注意：在实际应用中，这可能需要更复杂的算法来确保哈希的完整性
    const combined = hashes.join('');
    
    // 使用一个简单的哈希算法来合并（这里只是示例）
    // 在实际实现中，可能需要使用特定的哈希树或 Merkle 树结构
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // 转换为32位整数
    }
    
    return Math.abs(hash).toString(16);
  }
}