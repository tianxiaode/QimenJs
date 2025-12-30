import { 
  HashAlgorithm, 
  HashFormat, 
  HashOptions, 
  HashResult, 
  HashWorkerConfig,
  WorkerResponse,
  HashEvent,
  HashCallback,
  WorkerConfig
} from '../types';
import { WorkerManagerBase } from '../WorkerManagerBase';
import { AlgorithmRegistry } from './AlgorithmRegistry';
import { TaskManager } from './TaskManager';
import { FileHashProcessor } from './FileHashProcessor';
import { DataHashProcessor } from './DataHashProcessor';
import { MessageHandler } from './MessageHandler';
import { ILogger, Logger } from '@orbitjs/logger';
import { HashWorkerError, AlgorithmNotSupportedError, WorkerInitializationError } from '../errors';

export class HashWorkerManager extends WorkerManagerBase {
  private algorithm: HashAlgorithm = 'SHA-256';
  private chunkSize: number = 1024 * 1024; // 1MB
  private format: HashFormat = 'hex';
  private seed: number = 0;
  private normalizeLineEndings: boolean = true;
  
  private readonly taskManager: TaskManager;
  private readonly algorithmRegistry: AlgorithmRegistry;
  private readonly fileHashProcessor: FileHashProcessor;
  private readonly dataHashProcessor: DataHashProcessor;
  private readonly messageHandler: MessageHandler;
  protected logger: ILogger;

  constructor(workerUrl: string, options: HashOptions = {}) {
    super(workerUrl);
    this.logger = Logger.for(this.constructor.name);
    this.taskManager = new TaskManager(this.logger);
    this.algorithmRegistry = AlgorithmRegistry.getInstance();
    this.configure(options);
    
    // 初始化处理器
    this.fileHashProcessor = new FileHashProcessor(
      this.taskManager,
      this.algorithm,
      this.chunkSize,
      this.format,
      this.seed,
      this.normalizeLineEndings,
      this.post.bind(this),
      this.logger
    );
    
    this.dataHashProcessor = new DataHashProcessor(
      this.taskManager,
      this.algorithm,
      this.format,
      this.seed,
      this.normalizeLineEndings,
      this.post.bind(this),
      this.logger
    );
    
    this.messageHandler = new MessageHandler(
      this.taskManager,
      this.algorithmRegistry,
      this.chunkSize,
      this.fileHashProcessor,
      this.post.bind(this),
      this.logger
    );
  }

  /**
   * 配置哈希管理器
   */
  configure(options: HashOptions): this {
    if (options.algorithm) this.algorithm = options.algorithm;
    if (options.chunkSize) this.chunkSize = options.chunkSize;
    if (options.format) this.format = this.format;
    if (options.seed !== undefined) this.seed = options.seed;
    if (options.normalizeLineEndings !== undefined)
      this.normalizeLineEndings = options.normalizeLineEndings;

    // 更新处理器配置
    Object.assign(this.fileHashProcessor, {
      algorithm: this.algorithm,
      chunkSize: this.chunkSize,
      format: this.format,
      seed: this.seed,
      normalizeLineEndings: this.normalizeLineEndings
    });

    Object.assign(this.dataHashProcessor, {
      algorithm: this.algorithm,
      format: this.format,
      seed: this.seed,
      normalizeLineEndings: this.normalizeLineEndings
    });

    return this;
  }

  /**
   * 计算文件哈希（完整文件）
   */
  async hashFile(file: File): Promise<HashResult> {
    this.logger.info(`Starting hash calculation for file: ${file.name}, size: ${file.size} bytes`);
    
    this.ensureWorkerStarted();

    const taskId = this.generateTaskId();
    const startTime = performance.now();

    this.taskManager.addChunkState(taskId, file.size);

    return new Promise<HashResult>((resolve, reject) => {
      this.taskManager.addTask(taskId, { resolve, reject, startTime, file });

      // 发出开始事件
      this.taskManager.emit({ type: 'start' });

      // 根据文件大小决定计算策略
      if (file.size <= this.chunkSize * 4) {
        this.logger.debug(`Using full file calculation for small file: ${file.name}`);
        // 小文件：直接计算
        this.fileHashProcessor.hashFullFile(file, taskId)
          .catch(error => this.handleError(taskId, error));
      } else {
        this.logger.debug(`Using chunked calculation for large file: ${file.name}`);
        // 大文件：分片计算
        this.fileHashProcessor.hashFileByChunks(file, taskId);
      }
    });
  }

  /**
   * 计算数据哈希（字符串、ArrayBuffer等）
   */
  async hashData(data: string | ArrayBuffer | Blob): Promise<string> {
    this.logger.info(`Starting hash calculation for data of type: ${typeof data}`);
    
    this.ensureWorkerStarted();

    const taskId = this.generateTaskId();
    const startTime = performance.now();

    return new Promise<string>((resolve, reject) => {
      // 对于数据哈希任务，我们只期望返回字符串类型
      this.taskManager.addDataTask(taskId, { resolve, reject, startTime });

      this.dataHashProcessor.hashData(data, taskId, startTime);
    });
  }

  /**
   * 确保Worker已启动
   */
  private ensureWorkerStarted(): Promise<void> {
    if (!this.worker) {
      this.logger.info('Initializing hash worker');
      this.start();

      // 等待Worker初始化完成
      return new Promise<void>((resolve, reject) => {
        const readyHandler = (event: MessageEvent) => {
          if (event.data.type === 'READY') {
            this.logger.info('Hash worker ready, sending algorithm configuration');
            
            // 发送初始化消息，包含算法配置
            this.post({
              type: 'INIT_CONFIG',
              config: this.algorithmRegistry.getWorkerConfig().supportedAlgorithms.reduce((acc, algo) => {
                acc[algo.name] = {
                  libraryPath: algo.libraryPath,
                  importFunction: algo.importFunction
                };
                return acc;
              }, {} as Record<string, { libraryPath?: string; importFunction?: () => Promise<any> }>),
            });
            
            this.worker?.removeEventListener('message', readyHandler);
            resolve();
          }
        };
        
        const errorHandler = (error: ErrorEvent) => {
          this.logger.error('Worker initialization error:', error);
          this.worker?.removeEventListener('error', errorHandler);
          reject(new WorkerInitializationError('Failed to initialize worker', error as any));
        };
        
        this.worker?.addEventListener('message', readyHandler);
        this.worker?.addEventListener('error', errorHandler);
      });
    } else {
      // 如果worker已经存在，返回一个已解决的Promise
      return Promise.resolve();
    }
  }

  /**
   * 消息处理
   */
  protected onMessage(event: MessageEvent): void {
    this.messageHandler.handleMessage(event);
  }

  /**
   * 处理错误
   */
  private handleError(taskId: string, error: Error): void {
    this.logger.error(`Error processing task ${taskId}:`, error);
    
    const task = this.taskManager.getTask(taskId);
    if (task) {
      task.reject(error);
      this.taskManager.removeTask(taskId);
      return;
    }

    const dataTask = this.taskManager.getDataTask(taskId);
    if (dataTask) {
      dataTask.reject(error);
      this.taskManager.removeTask(taskId);
      return;
    }

    this.taskManager.emit({ type: 'error', data: error });
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 注册事件回调
   */
  on(callback: HashCallback): void {
    this.taskManager.on(callback);
  }

  /**
   * 取消事件回调
   */
  off(callback: HashCallback): void {
    this.taskManager.off(callback);
  }

  /**
   * 覆盖停止方法，清理资源
   */
  override stop(): void {
    this.logger.info('Stopping hash worker manager');
    this.taskManager.clearAllTasks();

    // 调用父类停止方法
    super.stop();
  }

  /**
   * 获取当前配置
   */
  getConfig(): Required<HashOptions> {
    return {
      algorithm: this.algorithm,
      chunkSize: this.chunkSize,
      format: this.format,
      seed: this.seed,
      normalizeLineEndings: this.normalizeLineEndings,
    };
  }
}