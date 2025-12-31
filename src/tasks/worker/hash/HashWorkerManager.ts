import {
    HashAlgorithm,
    HashFormat,
    HashOptions,
    HashResult,
    HashCallback,
} from '../types';
import { WorkerManagerBase } from '../WorkerManagerBase';
import { AlgorithmRegistry } from './AlgorithmRegistry';
import { TaskManager } from './TaskManager';
import { FileHashProcessor } from './FileHashProcessor';
import { DataHashProcessor } from './DataHashProcessor';
import { MessageHandler } from './MessageHandler';
import { ILogger, Logger } from '@orbitjs/logger';
import {
    WorkerInitializationError,
} from '../../errors';

/**
 * HashWorkerManager - 哈希计算工作管理器
 * 
 * 该类扩展了WorkerManagerBase，提供了对文件和数据进行哈希计算的功能。
 * 它使用Web Worker来执行计算密集型的哈希操作，避免阻塞主线程。
 * 支持多种哈希算法，如MD5、SHA-1、SHA-256等，并允许配置计算参数。
 * 
 * 主要功能：
 * - 支持对File对象进行哈希计算
 * - 支持对ArrayBuffer、字符串等数据进行哈希计算
 * - 支持配置哈希算法、块大小、输出格式等参数
 * - 提供计算进度回调
 * - 管理Worker的生命周期
 * 
 * @example
 * ```ts
 * const manager = new HashWorkerManager('/path/to/worker.js');
 * 
 * // 计算文件哈希
 * manager.hashFile(file, (result) => {
 *   console.log('File hash:', result.hash);
 * });
 * 
 * // 计算数据哈希
 * manager.hashData(data, (result) => {
 *   console.log('Data hash:', result.hash);
 * });
 * ```
 */
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

    /**
     * 构造函数 - 初始化HashWorkerManager实例
     * 
     * @param workerUrl - Web Worker脚本的URL路径
     * @param options - 哈希计算的可选配置参数
     * @throws WorkerInitializationError 当Worker初始化失败时抛出
     */
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
            this.chunkSize,
            this.fileHashProcessor,
            this.post.bind(this),
            this.logger
        );
    }

    /**
     * 配置哈希管理器参数
     * 
     * @param options - 要应用的配置选项
     * @returns 返回当前实例以支持链式调用
     */
    configure(options: HashOptions): this {
        if (options.algorithm) this.algorithm = options.algorithm;
        if (options.chunkSize) this.chunkSize = options.chunkSize;
        if (options.format) this.format = options.format; // 修复：之前是 this.format，应该是 options.format
        if (options.seed !== undefined) this.seed = options.seed;
        if (options.normalizeLineEndings !== undefined)
            this.normalizeLineEndings = options.normalizeLineEndings;

        return this;
    }

    /**
     * 计算文件的哈希值
     * 
     * @param file - 要计算哈希的File对象
     * @param callback - 计算完成后的回调函数
     * @param options - 可选的哈希计算配置
     */
    public hashFile(file: File, callback: HashCallback, options?: HashOptions): void {
        if (options) {
            this.configure(options);
        }

        // 重新创建处理器实例以应用新配置
        const fileHashProcessor = new FileHashProcessor(
            this.taskManager,
            this.algorithm,
            this.chunkSize,
            this.format,
            this.seed,
            this.normalizeLineEndings,
            this.post.bind(this),
            this.logger
        );

        fileHashProcessor.process(file, callback);
    }

    /**
     * 计算数据的哈希值
     * 
     * @param data - 要计算哈希的数据，可以是字符串、ArrayBuffer等
     * @param callback - 计算完成后的回调函数
     * @param options - 可选的哈希计算配置
     */
    public hashData(data: any, callback: HashCallback, options?: HashOptions): void {
        if (options) {
            this.configure(options);
        }

        // 重新创建处理器实例以应用新配置
        const dataHashProcessor = new DataHashProcessor(
            this.taskManager,
            this.algorithm,
            this.format,
            this.seed,
            this.normalizeLineEndings,
            this.post.bind(this),
            this.logger
        );

        dataHashProcessor.process(data, callback);
    }

    /**
     * 处理从Web Worker接收到的消息
     * 
     * @param event - 包含消息数据的事件对象
     * @protected
     */
    protected onMessage(event: MessageEvent): void {
        this.messageHandler.handleMessage(event);
    }

    /**
     * 当Web Worker发生错误时的处理方法
     * 
     * @param error - 发生的错误信息
     * @protected
     */
    protected onError(error: ErrorEvent): void {
        this.logger.error('HashWorker error:', error);
    }
}