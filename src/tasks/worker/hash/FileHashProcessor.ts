import { ILogger } from '@orbitjs/logger';
import { HashAlgorithm, HashFormat, HashOptions, HashResult, WorkerResponse } from '../types';
import { TaskManager } from './TaskManager';
import { HashWorkerError } from '../errors';

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
    const chunkCount = Math.ceil(file.size / this.chunkSize);
    this.logger.info(`Starting chunked hash calculation for file: ${file.name}, ${chunkCount} chunks`);

    // 创建并发送所有分片任务
    for (let i = 0; i < chunkCount; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      const chunk = file.slice(start, end);

      const chunkTask: any = {
        id: `${taskId}_${i}`,
        chunk,
        index: i,
        total: chunkCount,
        algorithm: this.algorithm,
        options: {
          format: this.format,
          seed: this.seed,
          normalizeLineEndings: this.normalizeLineEndings,
        },
      };

      this.postMessage({
        type: 'HASH_CHUNK',
        task: chunkTask,
      });
    }
    
    this.logger.debug(`Sent ${chunkCount} chunk tasks for file: ${file.name}`);
  }

  /**
   * 完整文件计算
   */
  public hashFullFile(file: File, taskId: string): Promise<void> {
    this.logger.info(`Starting full file hash calculation for: ${file.name}`);
    
    return file.arrayBuffer()
      .then(buffer => {
        this.logger.debug(`File buffer ready for: ${file.name}, size: ${buffer.byteLength}`);
        this.postMessage({
          type: 'HASH_FULL',
          data: buffer,
          algorithm: this.algorithm,
          options: {
            format: this.format,
            seed: this.seed,
            normalizeLineEndings: this.normalizeLineEndings,
          },
        });
      })
      .catch(error => {
        this.logger.error(`Error reading file for hash calculation: ${file.name}`, error);
        throw new HashWorkerError(`Error reading file: ${file.name}`, { fileName: file.name, error });
      });
  }

  /**
   * 最终化分片哈希计算
   */
  public finalizeChunkedHash(taskId: string, startTime: number, fileSize: number): void {
    this.logger.info(`Finalizing chunked hash for task: ${taskId}`);
    
    // 获取排序后的分片哈希
    const sortedHashes = this.taskManager.getSortedChunkHashes(taskId);

    // 将分片哈希组合成字符串，再计算最终哈希
    const combinedHashString = sortedHashes.join('');
    const encoder = new TextEncoder();
    const combinedData = encoder.encode(combinedHashString);

    // 计算最终哈希（在后端完成或发送到Worker）
    this.postMessage({
      type: 'HASH_FULL',
      data: combinedData.buffer,
      algorithm: this.algorithm,
      options: {
        format: this.format,
        seed: this.seed,
        normalizeLineEndings: this.normalizeLineEndings,
      },
    });

    // 等待最终结果（这里简化处理，实际应该用新的任务ID）
    const finalTaskId = `${taskId}_final`;

    this.taskManager.addTask(finalTaskId, {
      resolve: (finalHash: any) => {
        const result: HashResult = {
          algorithm: this.algorithm,
          hash: finalHash,
          format: this.format,
          fileSize: fileSize,
          timeCost: performance.now() - startTime,
          chunkCount: sortedHashes.length,
        };

        this.logger.info(`Final hash calculation complete for task: ${taskId}, time: ${result.timeCost}ms`);

        // 获取原始任务并解决它
        const originalTask = this.taskManager.getTask(taskId);
        if (originalTask) {
          originalTask.resolve(result);
          this.taskManager.emit({ type: 'complete', data: result });
        }

        // 清理
        this.taskManager.removeTask(taskId);
        this.taskManager.removeTask(finalTaskId);
        this.taskManager.removeChunkState(taskId);
      },
      reject: (originalTask: any) => {
        if (originalTask) {
          originalTask.reject(new Error('Final hash task failed'));
        }
      },
      startTime,
    });
  }
}