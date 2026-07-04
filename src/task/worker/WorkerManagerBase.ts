import { ILogger, Logger } from "@qimenjs/logger";

/**
 * Worker管理器基类
 * 
 * 提供了Web Worker管理的基础功能，包括启动、停止、消息处理等。
 * 使用抽象类设计，具体的onMessage处理需要子类实现。
 * 
 * @example
 * ```ts
 * class MyWorkerManager extends WorkerManagerBase {
 *   constructor(url: string) {
 *     super(url);
 *   }
 * 
 *   protected onMessage(event: MessageEvent) {
 *     console.log('Received message from worker:', event.data);
 *   }
 * }
 * ```
 */
export abstract class WorkerManagerBase {
  /** Worker实例，可能为空 */
  protected worker: Worker | null = null;
  /** 日志记录器 */
  protected logger: ILogger;

  /**
   * 构造函数
   * 
   * @param url Worker脚本的URL
   */
  constructor(protected url: string) {
    this.logger = Logger.for(this.constructor.name);
  }

  /**
   * 启动Worker
   * 
   * 创建Worker实例并绑定消息和错误处理函数。
   * 如果Worker已经启动，则不执行任何操作。
   */
  start() {
    if (this.worker) return;
    this.worker = new Worker(this.url);
    this.worker.onmessage = this.onMessage.bind(this);
    this.worker.onerror = this.onError.bind(this);
    this.worker.onmessageerror = this.onMessageError.bind(this);
  }

  /**
   * 停止Worker
   * 
   * 终止Worker实例并将其设置为null。
   */
  stop() {
    this.worker?.terminate();
    this.worker = null;
  }

  /**
   * 向Worker发送消息
   * 
   * @param data 要发送的数据
   */
  protected post(data: any) {
    this.worker?.postMessage(data);
  }

  /**
   * 处理从Worker接收到的消息
   * 
   * 这是一个抽象方法，必须由子类实现。
   * 
   * @param event MessageEvent对象，包含从Worker接收到的数据
   */
  protected abstract onMessage(event: MessageEvent): void;

  /**
   * 处理Worker错误
   * 
   * 记录错误信息到日志。
   * 
   * @param error ErrorEvent对象，包含错误信息
   */
  protected onError(error: ErrorEvent) {
    this.logger.error(error);
  }

  /**
   * 处理Worker消息传递错误
   * 
   * 记录消息传递错误信息到日志。
   * 
   * @param error MessageEvent对象，包含错误信息
   */
  protected onMessageError(error: MessageEvent) {
    this.logger.error(error);
  }
}