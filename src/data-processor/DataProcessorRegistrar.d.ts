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
import { RegistrarBase } from '@/registry/registrars/RegistrarBase';
import { DataProcessorHandler, DataProcessorKey } from './types';
/**
 * 数据处理注册器名称常量
 */
export declare const DataProcessorRegistrarName: "data-processor";
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
export declare class DataProcessorRegistrar extends RegistrarBase<Map<string, DataProcessorHandler[]>> {
    readonly name: "data-processor";
    /**
     * 存储处理器
     * key: 处理器名称（唯一标识）
     * value: 处理器定义
     */
    protected storage: Map<string, DataProcessorHandler[]>;
    /**
     * 管道缓存（排序后的管道）
     * key: `${key}-${tag}` 组合键
     * value: 排序后的处理器列表
     */
    private static pipelineCache;
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
    register(handler: DataProcessorHandler): void;
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
    registerAll(handlers: DataProcessorHandler[]): void;
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
    getPipeline(preset: DataProcessorKey, phase?: 'pre' | 'post'): DataProcessorHandler[];
    /**
     * 移除处理器
     *
     * @param handlerName 处理器名称
     */
    unregister(handlerName: string): void;
    /**
     * 获取处理器
     *
     * @param handlerName 处理器名称
     * @returns 处理器定义，未找到返回 undefined
     */
    get(handlerName: string): DataProcessorHandler[] | undefined;
    /**
     * 检查处理器是否存在
     *
     * @param handlerName 处理器名称
     * @returns 是否存在
     */
    has(handlerName: string): boolean;
    /**
     * 清空所有处理器
     */
    clear(): void;
    /**
     * 验证处理器
     *
     * @param handler 处理器定义
     * @throws Error 如果处理器无效
     */
    private validateHandler;
    /**
     * 调试输出
     *
     * @description 显示所有处理器信息，按权重分组
     */
    protected doInspect(): void;
}
//# sourceMappingURL=DataProcessorRegistrar.d.ts.map