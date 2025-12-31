import { ILogger } from '@orbitjs/logger';
import { HashAlgorithm, HashFormat, HashOptions } from '../types';
import { TaskManager } from './TaskManager';

export class DataHashProcessor {
  private logger: ILogger;

  constructor(
    private taskManager: TaskManager,
    private algorithm: HashAlgorithm,
    private format: HashFormat,
    private seed: number,
    private normalizeLineEndings: boolean,
    private postMessage: (data: any) => void,
    logger: ILogger
  ) {
    this.logger = logger;
  }

  /**
   * 计算数据哈希（字符串、ArrayBuffer等）
   */
  public hashData(data: string | ArrayBuffer | Blob, taskId: string, startTime: number): void {
    this.logger.info(`Starting hash calculation for data type: ${typeof data}`);
    
    let dataToHash: ArrayBuffer | Blob;

    if (typeof data === 'string') {
      // 字符串转为UTF-8 ArrayBuffer
      const encoder = new TextEncoder();
      dataToHash = encoder.encode(data).buffer;
      this.logger.debug(`Encoded string to ArrayBuffer, length: ${data.length}`);
    } else {
      dataToHash = data;
      this.logger.debug(`Processing data object of type: ${data.constructor.name}`);
    }

    // 发送计算任务给Worker
    this.postMessage({
      type: 'HASH_FULL',
      data: dataToHash,
      algorithm: this.algorithm,
      options: {
        format: this.format,
        seed: this.seed,
        normalizeLineEndings: this.normalizeLineEndings,
      },
    });
    
    this.logger.debug(`Sent HASH_FULL message for task: ${taskId}`);
  }
}