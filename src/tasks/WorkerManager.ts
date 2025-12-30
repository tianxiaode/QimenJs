import { Logger, ILogger } from '@/logger';

/**
 * Worker管理器 - 用于管理Web Worker的创建、通信和生命周期
 * 
 * 该类封装了Web Worker的基本操作，包括启动、停止、消息处理和错误处理。
 * 
 * @example
 * ```ts
 * const workerManager = new WorkerManager();
 * 
 * workerManager.onMessage = (data) => {
 *   console.log('Received message from worker:', data);
 * };
 * 
 * workerManager.onError = (error) => {
 *   console.error('Worker error:', error);
 * };
 * 
 * workerManager.start('path/to/worker.js');
 * 
 * workerManager.postMessage({ type: 'ACTION', payload: {} });
 * 
 * workerManager.stop();
 * ```
 */
export class WorkerManager {
  worker: Worker | null = null;
  _logger: ILogger | null = null;
  
  /**
   * 获取logger实例，延迟初始化直到使用时
   */
  private get logger() {
    if(!this._logger){
        this._logger = Logger.for('WorkerManager');
    }
    return this._logger;
  }

  /**
   * 启动Worker
   * 
   * @param url Worker脚本的URL
   */
  start(url: string): void {
    try {
      this.worker = new Worker(url);
      this.worker.onmessage = this.onMessage.bind(this);
      this.worker.onerror = this.onError.bind(this);
      this.worker.onmessageerror = this.onMessageError.bind(this);
      this.logger.info(`Worker started: ${url}`);
    } catch (error) {
      this.logger.error(`Failed to start worker: ${url}`, error);
      throw error;
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
   * 接收来自Worker的消息
   * 
   * @param event 消息事件
   */
  onMessage(event: MessageEvent): void {
    const { data } = event;
    this.logger.debug(`Message received from worker:`, data);
    // 这个方法应该由使用者重写
  }

  /**
   * 处理Worker错误
   * 
   * @param error 错误事件
   */
  onError(error: ErrorEvent): void {
    this.logger.error('Error from worker:', error);
    // 这个方法应该由使用者重写
  }

  /**
   * 处理Worker消息错误
   * 
   * @param error 消息错误事件
   */
  onMessageError(error: MessageEvent): void {
    this.logger.error('Message error from worker:', error);
    // 这个方法应该由使用者重写
  }
}