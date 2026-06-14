/**
 * 数据处理执行器
 *
 * 直接使用统一的 pipeline 执行器
 * 避免重复实现监控、日志等功能
 *
 * @module data-processor/executor
 */
import { RequestContext } from '../types';
import { DataProcessorHandler } from './types';
/**
 * 数据处理执行器
 *
 * @description 简单封装 pipeline，提供数据处理专用的执行接口
 *
 * @example
 * import { DataProcessorExecutor } from '@/data-processor';
 *
 * const executor = new DataProcessorExecutor();
 *
 * // 执行管道
 * const result = await executor.execute(context, handlers);
 *
 * // 打印报告
 * executor.printReport(result);
 */
export declare class DataProcessorExecutor {
    /**
     * 管道执行器实例
     */
    private pipeline;
    /**
     * 执行数据处理管道
     *
     * @param context 请求上下文
     * @param handlers 处理器列表
     * @param phase 阶段（用于日志）
     * @returns 执行结果
     *
     * @example
     * const handlers = DataProcessor.getPipeline('abp', 'pre');
     * const result = await executor.execute(context, handlers, 'pre');
     */
    execute(context: RequestContext, handlers: DataProcessorHandler[], phase?: 'pre' | 'post'): Promise<any>;
    /**
     * 获取执行统计
     */
    getStats(): any;
    /**
     * 重置统计
     */
    resetStats(): void;
    /**
     * 打印执行报告
     */
    printReport(result: any): void;
}
/**
 * 默认数据处理执行器实例
 */
export declare const dataProcessorExecutor: DataProcessorExecutor;
//# sourceMappingURL=executor.d.ts.map