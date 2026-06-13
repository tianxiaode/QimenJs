/**
 * 数据处理注册器
 * 
 * 统一管理所有数据处理管道，通过关键字路由
 * 参考 src/registry 的注册表模式实现
 * 
 * @module data-processor/DataProcessorRegistrar
 */

import { RegistrarBase } from '../../registry/registrars';
import { FlowContext } from '../types';
import { DataProcessorHandler, DataProcessorKey, ProcessorExecutionStep } from './types';
import { ProcessorExecutionError } from './errors';

/**
 * 数据处理注册器名称常量
 */
export const DataProcessorRegistrarName = 'data-processor' as const;

/**
 * 数据处理注册器
 * 
 * 继承自 RegistrarBase，遵循注册表模式
 * 
 * 使用方式：
 * - register('abp-pre', handler) - 注册 ABP 前导处理器
 * - register('abp-post', handler) - 注册 ABP 后道处理器
 * - getPipeline('abp-pre') - 获取 ABP 前导管道
 * - execute('abp-pre', context) - 执行 ABP 前导管道
 * 
 * @example
 * // 注册处理器
 * DataProcessor.register('abp-post', {
 *     name: 'abp-extract',
 *     weight: 100,
 *     handle: async (ctx) => {
 *         // 数据提取逻辑
 *     }
 * });
 * 
 * // 执行管道
 * await DataProcessor.execute('abp-post', context);
 */
export class DataProcessorRegistrar extends RegistrarBase<Map<string, DataProcessorHandler[]>> {
    public readonly name = DataProcessorRegistrarName;
    
    /**
     * 存储管道处理器
     * key: 管道关键字（如 'abp-pre'、'abp-post'）
     * value: 处理器列表
     */
    protected storage = new Map<string, DataProcessorHandler[]>();
    
    /**
     * 管道缓存（排序后的管道）
     * 用于优化性能，避免重复排序
     */
    private pipelineCache = new Map<string, DataProcessorHandler[]>();
    
    /**
     * 注册处理器
     * 
     * @param key 管道关键字，如 'abp-pre'、'abp-post'
     * @param handler 处理器定义
     * 
     * @example
     * DataProcessor.register('abp-pre', {
     *     name: 'abp-pagination',
     *     weight: 100,
     *     description: 'ABP 分页参数转换',
     *     handle: async (ctx) => {
     *         // 处理逻辑
     *     }
     * });
     */
    register(key: DataProcessorKey, handler: DataProcessorHandler): void {
        this.checkLock();
        
        // 验证处理器
        this.validateHandler(handler);
        
        // 初始化管道
        if (!this.storage.has(key)) {
            this.storage.set(key, []);
        }
        
        // 添加处理器
        this.storage.get(key)!.push(handler);
        
        // 清除缓存
        this.pipelineCache.delete(key);
    }
    
    /**
     * 批量注册处理器
     * 
     * @param key 管道关键字
     * @param handlers 处理器列表
     * 
     * @example
     * DataProcessor.registerAll('abp-post', [
     *     { name: 'handler1', weight: 100, handle: async (ctx) => { /* ... *\/ } },
     *     { name: 'handler2', weight: 90, handle: async (ctx) => { /* ... *\/ } }
     * ]);
     */
    registerAll(key: DataProcessorKey, handlers: DataProcessorHandler[]): void {
        this.checkLock();
        
        // 验证所有处理器
        handlers.forEach(handler => this.validateHandler(handler));
        
        // 初始化管道
        if (!this.storage.has(key)) {
            this.storage.set(key, []);
        }
        
        // 批量添加
        this.storage.get(key)!.push(...handlers);
        
        // 清除缓存
        this.pipelineCache.delete(key);
    }
    
    /**
     * 获取管道列表（已排序）
     * 
     * @param key 管道关键字
     * @returns 排序后的处理器列表（按权重降序）
     * 
     * @example
     * const pipeline = DataProcessor.getPipeline('abp-post');
     * console.log(pipeline); // [{ name: 'handler1', weight: 100 }, ...]
     */
    getPipeline(key: DataProcessorKey): DataProcessorHandler[] {
        // 检查缓存
        if (this.pipelineCache.has(key)) {
            return this.pipelineCache.get(key)!;
        }
        
        const handlers = this.storage.get(key) || [];
        
        // 按权重降序排序（权重高的先执行）
        const sorted = [...handlers].sort((a, b) => {
            return (b.weight ?? 100) - (a.weight ?? 100);
        });
        
        // 缓存排序结果
        this.pipelineCache.set(key, sorted);
        
        return sorted;
    }
    
    /**
     * 执行管道
     * 
     * @param key 管道关键字
     * @param context 流上下文
     * @returns Promise<void>
     * 
     * @example
     * // 执行 ABP 前导管道
     * await DataProcessor.execute('abp-pre', context);
     * 
     * // 执行 ABP 后道管道
     * await DataProcessor.execute('abp-post', context);
     */
    async execute(key: DataProcessorKey, context: FlowContext): Promise<void> {
        const pipeline = this.getPipeline(key);
        
        for (const handler of pipeline) {
            // Guard Clause: 条件判断
            if (handler.shouldExecute && !handler.shouldExecute(context)) {
                // 记录跳过
                context.steps.push({
                    name: handler.name,
                    duration: 0,
                    status: 'skipped',
                });
                continue;
            }
            
            const startTime = Date.now();
            try {
                // 执行处理器
                await handler.handle(context);
                
                // 记录成功
                context.steps.push({
                    name: handler.name,
                    duration: Date.now() - startTime,
                    status: 'success',
                });
            } catch (error) {
                // 记录错误
                context.steps.push({
                    name: handler.name,
                    duration: Date.now() - startTime,
                    status: 'error',
                    error,
                });
                
                // 设置错误状态
                context.error = error;
                context.metadata.hasError = true;
                
                // 抛出执行错误
                throw new ProcessorExecutionError(handler.name, error);
            }
        }
    }
    
    /**
     * 移除处理器
     * 
     * @param key 管道关键字
     * @param handlerName 处理器名称（可选，不传则移除整个管道）
     * 
     * @example
     * // 移除特定处理器
     * DataProcessor.unregister('abp-post', 'handler-name');
     * 
     * // 移除整个管道
     * DataProcessor.unregister('abp-post');
     */
    unregister(key: DataProcessorKey, handlerName?: string): void {
        this.checkLock();
        
        if (handlerName) {
            // 移除特定处理器
            const handlers = this.storage.get(key);
            if (handlers) {
                const index = handlers.findIndex(h => h.name === handlerName);
                if (index !== -1) {
                    handlers.splice(index, 1);
                    this.pipelineCache.delete(key);
                }
            }
        } else {
            // 移除整个管道
            this.storage.delete(key);
            this.pipelineCache.delete(key);
        }
    }
    
    /**
     * 获取处理器
     * 
     * @param key 管道关键字
     * @param handlerName 处理器名称
     * @returns 处理器定义，未找到返回 undefined
     */
    get(key: DataProcessorKey, handlerName: string): DataProcessorHandler | undefined {
        const handlers = this.storage.get(key);
        if (!handlers) return undefined;
        
        return handlers.find(h => h.name === handlerName);
    }
    
    /**
     * 检查管道是否存在
     * 
     * @param key 管道关键字
     * @returns 是否存在
     */
    has(key: DataProcessorKey): boolean {
        return this.storage.has(key);
    }
    
    /**
     * 获取管道处理器数量
     * 
     * @param key 管道关键字
     * @returns 处理器数量
     */
    size(key: DataProcessorKey): number {
        return this.storage.get(key)?.length || 0;
    }
    
    /**
     * 清空所有管道
     */
    clear(): void {
        this.checkLock();
        this.storage.clear();
        this.pipelineCache.clear();
    }
    
    /**
     * 验证处理器
     * 
     * @param handler 处理器定义
     * @throws InvalidProcessorError 如果处理器无效
     */
    private validateHandler(handler: DataProcessorHandler): void {
        if (!handler.name || typeof handler.name !== 'string') {
            throw new Error('Handler must have a valid name');
        }
        
        if (!handler.handle || typeof handler.handle !== 'function') {
            throw new Error('Handler must have a valid handle function');
        }
    }
    
    /**
     * 调试输出
     * 
     * @description 显示所有管道和处理器信息
     */
    protected doInspect(): void {
        console.group('🔧 Data Processor Registry');
        
        if (this.storage.size === 0) {
            console.log('No pipelines registered');
            console.groupEnd();
            return;
        }
        
        // 按关键字分组
        const groups = new Map<string, string[]>();
        
        this.storage.forEach((handlers, key) => {
            // 提取基础关键字（去掉 -pre 或 -post 后缀）
            const baseKey = key.replace(/-pre$|-post$/, '');
            if (!groups.has(baseKey)) {
                groups.set(baseKey, []);
            }
            groups.get(baseKey)!.push(key);
        });
        
        // 输出分组信息
        groups.forEach((keys, baseKey) => {
            console.log(`\n📦 ${baseKey}:`);
            keys.forEach(key => {
                const handlers = this.getPipeline(key);
                console.log(`  ${key} (${handlers.length} handlers)`);
                
                // 输出处理器列表
                const tableData = handlers.map(h => ({
                    'Name': h.name,
                    'Weight': h.weight ?? 100,
                    'Description': h.description || '-',
                }));
                console.table(tableData);
            });
        });
        
        console.groupEnd();
    }
    
    /**
     * 获取单例实例
     */
    static getInstance(): DataProcessorRegistrar {
        return super.getInstance();
    }
}

/**
 * 数据处理注册器实例（便捷访问）
 */
export const DataProcessor = DataProcessorRegistrar.getInstance();
