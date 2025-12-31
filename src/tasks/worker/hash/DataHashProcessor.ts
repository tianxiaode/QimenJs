import { ILogger } from '@orbitjs/logger';
import { HashAlgorithm, HashFormat, HashOptions } from '../types';
import { TaskManager } from './TaskManager';

/**
 * 数据哈希处理器
 * 
 * 该类负责处理字符串、ArrayBuffer、Blob等类型数据的哈希计算任务
 * 它将数据转换为适当格式并发送给Web Worker进行计算
 */
export class DataHashProcessor {
  private logger: ILogger;

  /**
   * 构造函数
   * 
   * @param taskManager - 任务管理器，用于跟踪和管理哈希计算任务
   * @param algorithm - 要使用的哈希算法
   * @param format - 哈希结果的输出格式
   * @param seed - 哈希计算的种子值
   * @param normalizeLineEndings - 是否标准化行结束符
   * @param postMessage - 用于向Web Worker发送消息的函数
   * @param logger - 日志记录器
   */
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
   * 处理数据哈希计算
   * 
   * 此方法创建任务并调用hashData方法进行计算
   * 
   * @param data - 要计算哈希的数据，可以是字符串、ArrayBuffer或Blob
   * @param callback - 计算完成后的回调函数
   */
  public process(data: string | ArrayBuffer | Blob, callback: (result: any) => void): void {
    const taskId = this.taskManager.createDataTask(data, callback);
    const startTime = Date.now();
    
    this.hashData(data, taskId, startTime);
  }

  /**
   * 计算数据哈希（字符串、ArrayBuffer等）
   * 
   * 此方法将数据转换为适当格式并发送给Web Worker进行计算
   * 
   * @param data - 要计算哈希的数据，可以是字符串、ArrayBuffer或Blob
   * @param taskId - 任务ID，用于跟踪计算进度
   * @param startTime - 任务开始时间戳
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