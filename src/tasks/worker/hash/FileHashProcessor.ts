import { ILogger } from '@orbitjs/logger';
import { HashAlgorithm, HashFormat, HashResult } from '../types';
import { TaskManager } from './TaskManager';
import { HashWorkerError } from '../../errors';

export class FileHashProcessor {
  private logger: ILogger;

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
   * 分片计算文件哈希
   */
  public hashFileByChunks(file: File, taskId: string): void {
    this.logger.info(`Starting chunked hash calculation for file: ${file.name}, size: ${file.size} bytes`);
    
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    this.logger.debug(`File will be split into ${totalChunks} chunks`);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      const chunk = file.slice(start, end);
      const chunkTaskId = `${taskId}_${i}`;

      this.logger.debug(`Processing chunk ${i + 1}/${totalChunks}, size: ${end - start} bytes`);

      // 发送分片计算任务给Worker
      this.postMessage({
        type: 'HASH_CHUNK',
        taskId: chunkTaskId,
        data: chunk,
        algorithm: this.algorithm,
        options: {
          format: this.format,
          seed: this.seed,
          normalizeLineEndings: this.normalizeLineEndings,
        },
      });
    }
  }

  /**
   * 完整文件计算
   */
  public async hashFullFile(file: File, taskId: string): Promise<void> {
    this.logger.info(`Starting full file hash calculation for: ${file.name}`);

    try {
      // 将文件读取为ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      this.logger.debug(`Read file as ArrayBuffer, size: ${arrayBuffer.byteLength} bytes`);

      // 发送完整文件计算任务给Worker
      this.postMessage({
        type: 'HASH_FULL',
        data: arrayBuffer,
        algorithm: this.algorithm,
        options: {
          format: this.format,
          seed: this.seed,
          normalizeLineEndings: this.normalizeLineEndings,
        },
      });

      this.logger.debug(`Sent HASH_FULL message for file: ${file.name}`);
    } catch (error) {
      this.logger.error(`Error reading file: ${file.name}`, error);
      throw new HashWorkerError(`Error reading file: ${error}`, { taskId });
    }
  }

  /**
   * 最终化分片哈希计算
   */
  public finalizeChunkedHash(taskId: string, startTime: number, fileSize: number): void {
    this.logger.info(`Finalizing chunked hash for task: ${taskId}`);

    // 获取排序后的分片哈希值
    const sortedHashes = this.taskManager.getSortedChunkHashes(taskId);
    this.logger.debug(`Found ${sortedHashes.length} chunk hashes to combine`);

    if (sortedHashes.length === 0) {
      this.logger.error(`No chunk hashes found for task: ${taskId}`);
      throw new HashWorkerError('No chunk hashes found for finalization', { taskId });
    }

    // 将所有分片哈希连接成一个字符串进行最终哈希计算
    const combinedData = sortedHashes.join('');
    
    // 发送合并计算任务给Worker
    this.postMessage({
      type: 'COMBINE_HASHES',
      data: combinedData,
      algorithm: this.algorithm,
      taskId,
      options: {
        format: this.format,
        seed: this.seed,
        normalizeLineEndings: this.normalizeLineEndings,
      },
    });

    this.logger.debug(`Sent COMBINE_HASHES message for task: ${taskId}`);
    
    // 移除分片处理状态
    this.taskManager.removeChunkState(taskId);
  }
}