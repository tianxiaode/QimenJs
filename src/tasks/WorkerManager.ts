import { Logger, ILogger } from '@/logger';
import { WorkerError } from './errors/WorkerError';

type MessageHandler = (event: MessageEvent) => void;
type ErrorHandler = (error: ErrorEvent) => void;
type MessageErrorHandler = (error: MessageEvent) => void;

/**
 * Worker管理器 - 用于管理Web Worker的创建、通信和生命周期
 * 
 * 该类封装了Web Worker的基本操作，包括启动、停止、消息处理和错误处理。
 * 支持传入回调函数处理消息和错误，无需继承
 * 
 * @example
 * ```ts
 * const workerManager = new WorkerManager({
 *   onMessage: (data) => {
 *     console.log('Received message from worker:', data);
 *   },
 *   onError: (error) => {
 *     console.error('Worker error:', error);
 *   },
 *   onMessageError: (error) => {
 *     console.error('Worker message error:', error);
 *   }
 * });
 * 
 * workerManager.start('path/to/worker.js');
 * workerManager.postMessage({ type: 'ACTION', payload: {} });
 * workerManager.stop();
 * ```
 */
export interface WorkerManagerOptions {
  onMessage?: MessageHandler;
  onError?: ErrorHandler;
  onMessageError?: MessageErrorHandler;
}

export class WorkerManager {
  worker: Worker | null = null;
  logger: ILogger;
  
  private options: WorkerManagerOptions;
  
  /**
   * 构造函数支持传入处理函数
   * @param options 包含处理函数的选项
   */
  constructor(options: WorkerManagerOptions = {}) {
    this.options = options;
    this.logger = Logger.for('WorkerManager');
  }


  /**
   * 启动Worker
   * 
   * @param url Worker脚本的URL
   */
  start(url: string): void {
    try {
      this.worker = new Worker(url);
      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = this.handleError.bind(this);
      this.worker.onmessageerror = this.handleMessageError.bind(this);
      this.logger.info(`Worker started: ${url}`);
    } catch (error) {
      this.logger.error(`Failed to start worker: ${url}`, error);
      throw new WorkerError(`Failed to start worker: ${url}`, {
        url,
        originalError: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * 停止Worker
   */
  stop(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.logger.info('Worker terminated');
    } else {
      this.logger.warn('Attempted to stop non-existent worker');
    }
  }

  /**
   * 向Worker发送消息
   * 
   * @param message 要发送的消息
   */
  postMessage(message: any): void {
    if (this.worker) {
      this.worker.postMessage(message);
      this.logger.debug(`Message posted to worker:`, message);
    } else {
      this.logger.warn('Attempted to post message to non-existent worker');
    }
  }

  /**
   * 处理来自Worker的消息
   * 
   * @param event 消息事件
   */
  private handleMessage(event: MessageEvent): void {
    const { data } = event;
    this.logger.debug(`Message received from worker:`, data);
    if (this.options.onMessage) {
      this.options.onMessage(event);
    }
  }

  /**
   * 处理Worker错误
   * 
   * @param error 错误事件
   */
  private handleError(error: ErrorEvent): void {
    this.logger.error('Error from worker:', error);
    if (this.options.onError) {
      this.options.onError(error);
    }
  }

  /**
   * 处理Worker消息错误
   * 
   * @param error 消息错误事件
   */
  private handleMessageError(error: MessageEvent): void {
    this.logger.error('Message error from worker:', error);
    if (this.options.onMessageError) {
      this.options.onMessageError(error);
    }
  }
}