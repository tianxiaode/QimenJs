/**
 * 管道执行器
 *
 * 统一的管道执行器，内置监控和日志功能
 * 所有模块（validation、http、data-processor）都应该使用此执行器
 *
 * @module pipeline/executor
 */
import { Processor, PipelineOptions, PipelineResult, PipelineStats, IPipelineExecutor } from './types';
/**
 * 管道执行器类
 *
 * @description 提供统一的管道执行能力，内置监控和日志
 *
 * 特性：
 * - 权重 + 偏移量排序
 * - 熔断机制
 * - 执行跟踪
 * - 性能计时
 * - 统计信息
 * - 日志记录
 *
 * @example
 * const executor = new Pipeline();
 *
 * const result = await executor.execute(context, processors, {
 *     enableTracking: true,
 *     enableTiming: true,
 *     pipelineName: 'DataProcessor',
 * });
 *
 * executor.printReport(result);
 */
export declare class Pipeline implements IPipelineExecutor {
    /**
     * 日志记录器
     */
    private logger;
    /**
     * 执行统计
     */
    private stats;
    /**
     * 执行管道
     *
     * @param context 执行上下文
     * @param processors 处理器列表
     * @param options 执行选项
     * @returns 执行结果
     */
    execute<T = any>(context: T, processors: Processor<T>[], options?: PipelineOptions): Promise<PipelineResult<T>>;
    /**
     * 排序处理器
     *
     * @description 按 weight + offset 升序排序
     */
    private sortProcessors;
    /**
     * 检查是否已熔断
     */
    private isTerminated;
    /**
     * 设置错误状态
     */
    private setError;
    /**
     * 更新统计信息
     */
    private updateStats;
    /**
     * 获取执行统计
     */
    getStats(): PipelineStats;
    /**
     * 重置统计
     */
    resetStats(): void;
    /**
     * 打印执行报告
     */
    printReport(result: PipelineResult): void;
}
/**
 * 默认管道执行器实例
 */
export declare const pipeline: Pipeline;
//# sourceMappingURL=executor.d.ts.map