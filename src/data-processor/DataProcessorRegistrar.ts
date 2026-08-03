/**
 * 数据处理注册器（优化版）
 *
 * 参照 validation 的 ValidatorRegistrar 实现
 * - 支持权重 + 偏移量排序
 * - 支持 tags 过滤和复用
 * - 支持执行过程跟踪
 *
 * @module data-processor/DataProcessorRegistrar
 */

import { RegistrarBase } from '@/registry';
import type { DataProcessorHandler, DataProcessorKey, DataProcessorTag } from './types';
import { getWeightName } from './weights';

/**
 * 数据处理注册器名称常量
 */
export const DataProcessorRegistrarName = 'data-processor' as const;

/**
 * 数据处理注册器
 *
 * 继承自 RegistrarBase，遵循注册表模式
 *
 * 参照 validation 的 ValidatorRegistrar 设计：
 * - 权重 + 偏移量排序算法
 * - Tags 过滤和复用机制
 * - 执行过程跟踪
 *
 * @example
 * // 注册处理器
 * DataProcessor.register({
 *     name: 'abp-pagination',
 *     weight: DataProcessorWeight.TRANSFORM,
 *     offset: 10,
 *     tags: ['abp', 'pre'],
 *     handle: async (ctx) => { /* ... *\/ }
 * });
 *
 * // 获取管道（通过 tags 过滤）
 * const pipeline = DataProcessor.getPipeline('abp', 'pre');
 *
 * // 执行管道
 * await DataProcessor.execute('abp', 'pre', context);
 */
export class DataProcessorRegistrar extends RegistrarBase<Map<string, DataProcessorHandler[]>> {
    public readonly name = DataProcessorRegistrarName;

    /**
     * 存储处理器
     * key: 处理器名称（唯一标识）
     * value: 处理器定义
     */
    protected storage = new Map<string, DataProcessorHandler[]>();

    /**
     * 管道缓存（排序后的管道）
     * key: `${key}-${tag}` 组合键
     * value: 排序后的处理器列表
     */
    private static pipelineCache = new Map<string, DataProcessorHandler[]>();

    /**
     * 注册处理器
     *
     * @param handler 处理器定义
     *
     * @example
     * DataProcessor.register({
     *     name: 'abp-pagination',
     *     weight: DataProcessorWeight.TRANSFORM,
     *     offset: 10,
     *     tags: ['abp', 'pre'],
     *     description: 'ABP 分页参数转换',
     *     handle: async (ctx) => {
     *         // 处理逻辑
     *     }
     * });
     */
    register(handler: DataProcessorHandler): void {
        this.checkLock();

        // 验证处理器
        this.validateHandler(handler);

        // 使用处理器名称作为键
        const key = handler.name;

        if (!this.storage.has(key)) {
            this.storage.set(key, []);
        }

        this.storage.get(key)!.push(handler);

        // 清除所有缓存（因为新增处理器可能影响所有管道）
        DataProcessorRegistrar.pipelineCache.clear();
    }

    /**
     * 批量注册处理器
     *
     * @param handlers 处理器列表
     *
     * @example
     * DataProcessor.registerAll([
     *     { name: 'handler1', weight: 100, tags: ['abp'], handle: async (ctx) => { /* ... *\/ } },
     *     { name: 'handler2', weight: 90, tags: ['abp'], handle: async (ctx) => { /* ... *\/ } }
     * ]);
     */
    registerAll(handlers: DataProcessorHandler[]): void {
        this.checkLock();

        handlers.forEach(handler => {
            this.validateHandler(handler);
            const key = handler.name;

            if (!this.storage.has(key)) {
                this.storage.set(key, []);
            }

            this.storage.get(key)!.push(handler);
        });

        DataProcessorRegistrar.pipelineCache.clear();
    }

    /**
     * 获取管道列表（已排序）
     *
     * @param preset 预设类型（如 'abp'、'spring'）
     * @param phase 阶段（'pre' 或 'post'）
     * @returns 排序后的处理器列表
     *
     * @description
     * 通过 tags 过滤处理器：
     * - 处理器的 tags 包含 preset → 包含
     * - 处理器的 tags 包含 phase → 包含
     * - 处理器的 tags 包含 'any' → 包含（通配符）
     *
     * 排序算法：
     * - 按 weight + offset 升序排序
     * - 权重小的先执行
     *
     * @example
     * // 获取 ABP 前导管道
     * const pipeline = DataProcessor.getPipeline('abp', 'pre');
     */
    getPipeline(preset: DataProcessorKey, phase?: 'pre' | 'post'): DataProcessorHandler[] {
        // 构建缓存键
        const cacheKey = phase ? `${preset}-${phase}` : preset;

        // 检查缓存
        if (DataProcessorRegistrar.pipelineCache.has(cacheKey)) {
            return DataProcessorRegistrar.pipelineCache.get(cacheKey)!;
        }

        // 获取所有处理器
        const allHandlers = Array.from(this.storage.values()).flat();

        // 通过 tags 过滤
        const filtered = allHandlers.filter(handler => {
            const tags = handler.tags || ['any'];

            // 通配符匹配
            if (tags.includes('any')) {
                return true;
            }

            // 预设匹配
            const matchesPreset = tags.includes(preset as DataProcessorTag);

            // 阶段匹配（如果指定了阶段）
            const matchesPhase = phase ? tags.includes(phase as DataProcessorTag) : true;

            return matchesPreset && matchesPhase;
        });

        // 按 weight + offset 升序排序（权重小的先执行）
        const sorted = filtered.sort((a, b) => {
            const weightA = (a.weight ?? 100) + (a.offset ?? 0);
            const weightB = (b.weight ?? 100) + (b.offset ?? 0);
            return weightA - weightB;
        });

        // 缓存结果
        DataProcessorRegistrar.pipelineCache.set(cacheKey, sorted);

        return sorted;
    }

    /**
     * 移除处理器
     *
     * @param handlerName 处理器名称
     */
    unregister(handlerName: string): void {
        this.checkLock();

        this.storage.delete(handlerName);
        DataProcessorRegistrar.pipelineCache.clear();
    }

    /**
     * 获取处理器
     *
     * @param handlerName 处理器名称
     * @returns 处理器定义，未找到返回 undefined
     */
    get(handlerName: string): DataProcessorHandler[] | undefined {
        return this.storage.get(handlerName);
    }

    /**
     * 检查处理器是否存在
     *
     * @param handlerName 处理器名称
     * @returns 是否存在
     */
    has(handlerName: string): boolean {
        return this.storage.has(handlerName);
    }

    /**
     * 清空所有处理器
     */
    clear(): void {
        this.checkLock();
        this.storage.clear();
        DataProcessorRegistrar.pipelineCache.clear();
    }

    /**
     * 验证处理器
     *
     * @param handler 处理器定义
     * @throws Error 如果处理器无效
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
     * @description 显示所有处理器信息，按权重分组
     */
    protected doInspect(): void {
        console.group('🔧 Data Processor Registry');

        const allHandlers = Array.from(this.storage.values()).flat();

        if (allHandlers.length === 0) {
            console.log('No processors registered');
            console.groupEnd();
            return;
        }

        // 按权重分组
        const groups = new Map<number, DataProcessorHandler[]>();

        allHandlers.forEach(handler => {
            const weight = handler.weight ?? 100;
            if (!groups.has(weight)) {
                groups.set(weight, []);
            }
            groups.get(weight)!.push(handler);
        });

        // 按权重排序输出
        Array.from(groups.entries())
            .sort((a, b) => a[0] - b[0])
            .forEach(([weight, handlers]) => {
                const weightName = getWeightName(weight);
                console.log(`\n📦 ${weightName} (${weight}):`);

                const tableData = handlers.map(h => ({
                    Name: h.name,
                    Offset: h.offset ?? 0,
                    Total: (h.weight ?? 100) + (h.offset ?? 0),
                    Tags: (h.tags || ['any']).join(', '),
                    Description: h.description || '-',
                }));

                console.table(tableData);
            });

        console.groupEnd();
    }
}
