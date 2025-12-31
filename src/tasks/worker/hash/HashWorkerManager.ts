import {
    HashAlgorithm,
    HashFormat,
    HashOptions,
    HashResult,
    HashCallback,
    HashEvent,
    HashEventType
} from '../types';
import { WorkerManagerBase } from '../WorkerManagerBase';
import { ILogger, Logger } from '@orbitjs/logger';
import {
    WorkerInitializationError,
} from '../../errors';

// 自定义哈希算法函数类型
export type CustomHashFunction = (data: any, options?: HashOptions) => Promise<string> | string;

// HashWorkerManager的配置选项接口
export interface HashWorkerOptions {
    algorithmFn: CustomHashFunction;  // 必需的算法函数
    workerUrl: string;                // Worker URL
    format?: HashFormat;              // 输出格式，默认为'hex'
    chunkSize?: number;               // 分块大小，默认为1MB
    normalizeLineEndings?: boolean;   // 是否标准化换行符，默认为true
}

/**
 * HashWorkerManager - 哈希计算工作管理器
 * 
 * 该类扩展了WorkerManagerBase，提供了对文件和数据进行哈希计算的功能。
 * 它使用Web Worker来执行计算密集型的哈希操作，避免阻塞主线程。
 * 
 * 与传统实现不同，它不需要在Worker中预定义算法，而是通过构造函数参数传入算法函数。
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
 * // 从项目内部或其他库导入算法函数
 * import { md5 } from '@orbitjs/crypto';
 * 
 * // 或使用自定义实现
 * const customHashAlgorithm = async (data: any, options?: HashOptions): Promise<string> => {
 *   // 实现自定义哈希算法逻辑
 *   return 'computed_hash_value';
 * };
 * 
 * // 创建管理器实例，传入算法函数
 * const manager = new HashWorkerManager({
 *   algorithmFn: md5,
 *   workerUrl: '/path/to/worker.js',
 *   format: 'hex'
 * });
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
    private readonly algorithmFn: CustomHashFunction;
    private format: HashFormat = 'hex';
    private format: HashFormat = 'hex';
    private normalizeLineEndings: boolean = true;
    private taskIdCounter: number = 0;
    private pendingTasks: Map<string, (result: any) => void> = new Map();
    protected logger: ILogger;
    private normalizeLineEndings: boolean = true;
    private taskIdCounter: number = 0;
    private pendingTasks: Map<string, (result: any) => void> = new Map();

    protected logger: ILogger;

    /**
     * 构造函数 - 初始化HashWorkerManager实例
     * 
     * @param options - 配置选项，包括算法函数和Worker URL
     * @throws WorkerInitializationError 当Worker初始化失败时抛出
     */
    constructor(options: HashWorkerOptions) {
        super(options.workerUrl);
        this.algorithmFn = options.algorithmFn;
        this.format = options.format || 'hex';
        this.chunkSize = options.chunkSize || 1024 * 1024;
        this.normalizeLineEndings = options.normalizeLineEndings !== undefined ? 
                                  options.normalizeLineEndings : true;
        
        this.logger = Logger.for(this.constructor.name);
        
        // 设置算法到Worker
        this.setAlgorithmInWorker();
    }
    
    /**
     * 将算法函数发送到Worker
     * @private
     */
    private setAlgorithmInWorker(): void {
        const algorithmString = this.algorithmFn.toString();
        
        this.post({
            type: 'SET_ALGORITHM',
            algorithmCode: algorithmString
        });
    }

    /**
     * 配置哈希管理器参数
     * 
     * @param options - 要应用的配置选项
     * @returns 返回当前实例以支持链式调用
     */
    configure(options: Partial<HashWorkerOptions>): this {
        if (options.format) this.format = options.format;
        if (options.chunkSize) this.chunkSize = options.chunkSize;
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
    public async hashFile(file: File, callback: HashCallback, options?: HashOptions): Promise<void> {
        if (options) {
            this.configure({ ...options });
        }

        try {
            // 触发开始事件
            callback({ type: 'start', data: null });
            
            const startTime = performance.now();
            
            // 读取文件内容
            const arrayBuffer = await file.arrayBuffer();
            
            // 生成任务ID
            const taskId = `task_${++this.taskIdCounter}`;
            
            // 创建Promise来处理结果
            const resultPromise = new Promise<any>((resolve) => {
                this.pendingTasks.set(taskId, resolve);
            });
            
            // 发送任务到Worker
            this.post({
                type: 'EXECUTE_HASH',
                taskId,
                data: arrayBuffer,
                options: { ...options, format: this.format }
            });
            
            // 等待结果
            const resultData = await resultPromise;
            
            const endTime = performance.now();
            
            const result: HashResult = {
                algorithm: 'CUSTOM' as HashAlgorithm,
                hash: resultData.hash,
                format: this.format,
                fileSize: file.size,
                timeCost: endTime - startTime,
                chunkCount: 1, // 简化版，不处理分块
            };

            // 触发完成事件
            const event: HashEvent = {
                type: 'complete',
                data: result
            };
            
            callback(event);
        } catch (error) {
            this.logger.error('Error calculating file hash:', error);
            
            const event: HashEvent = {
                type: 'error',
                data: error as Error
            };
            
            callback(event);
        }
    }

    /**
     * 计算数据的哈希值
     * 
     * @param data - 要计算哈希的数据，可以是字符串、ArrayBuffer等
     * @param callback - 计算完成后的回调函数
     * @param options - 可选的哈希计算配置
     */
    public async hashData(data: any, callback: HashCallback, options?: HashOptions): Promise<void> {
        if (options) {
            this.configure({ ...options });
        }

        try {
            // 触发开始事件
            callback({ type: 'start', data: null });
            
            const startTime = performance.now();
            
            // 生成任务ID
            const taskId = `task_${++this.taskIdCounter}`;
            
            // 创建Promise来处理结果
            const resultPromise = new Promise<any>((resolve) => {
                this.pendingTasks.set(taskId, resolve);
            });
            
            // 发送任务到Worker
            this.post({
                type: 'EXECUTE_HASH',
                taskId,
                data,
                options: { ...options, format: this.format }
            });
            
            // 等待结果
            const resultData = await resultPromise;
            
            const endTime = performance.now();
            
            const result: HashResult = {
                algorithm: 'CUSTOM' as HashAlgorithm,
                hash: resultData.hash,
                format: this.format,
                fileSize: typeof data === 'string' ? new Blob([data]).size : (data as ArrayBuffer).byteLength || 0,
                timeCost: endTime - startTime,
                chunkCount: 1, // 简化版，不处理分块
            };

            // 触发完成事件
            const event: HashEvent = {
                type: 'complete',
                data: result
            };
            
            callback(event);
        } catch (error) {
            this.logger.error('Error calculating data hash:', error);
            
            const event: HashEvent = {
                type: 'error',
                data: error as Error
            };
            
            callback(event);
        }
    }

    /**
     * 处理从Web Worker接收到的消息
     * 
     * @param event - 包含消息数据的事件对象
     * @protected
     */
    protected onMessage(event: MessageEvent): void {
        const message = event.data;
        
        if (message.type === 'EXECUTE_RESULT' && message.taskId) {
            const resolver = this.pendingTasks.get(message.taskId);
            if (resolver) {
                resolver(message);
                this.pendingTasks.delete(message.taskId);
            }
        } else if (message.type === 'ERROR' && message.taskId) {
            const resolver = this.pendingTasks.get(message.taskId);
            if (resolver) {
                resolver(new Error(message.error));
                this.pendingTasks.delete(message.taskId);
            }
        } else if (message.type === 'ALGORITHM_SET') {
            // 算法设置成功
            this.logger.info('Algorithm set successfully in worker');
        } else {
            // 处理其他消息类型
            this.logger.warn('Unknown message type received:', message.type);
        }
    }

    /**
     * 当Web Worker发生错误时的处理方法
     * 
     * @param error - 发生的错误信息
     * @protected
     */
    protected onError(error: ErrorEvent): void {
        this.logger.error('HashWorker error:', error);
        
        // 拒绝所有待处理的任务
        for (const [taskId, resolver] of this.pendingTasks) {
            resolver(new Error(`Worker error: ${error.message}`));
        }
        this.pendingTasks.clear();
    }
}