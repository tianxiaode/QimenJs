/**
 * 数据处理执行器
 * 
 * 直接使用统一的 pipeline 执行器
 * 避免重复实现监控、日志等功能
 * 
 * @module data-processor/executor
 */

import { Pipeline } from '@/pipeline';
import type { RequestContext } from '@/context';
import type { DataProcessorHandler } from './types';

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
export class DataProcessorExecutor {
    /**
     * 管道执行器实例
     */
    private pipeline = new Pipeline();
    
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
    async execute(
        context: RequestContext, 
        handlers: DataProcessorHandler[],
        phase?: 'pre' | 'post'
    ) {
        // 转换为 pipeline 的处理器格式
        const processors = handlers.map(handler => ({
            name: handler.name,
            weight: handler.weight,
            offset: handler.offset,
            description: handler.description,
            execute: async (ctx: RequestContext) => {
                // 条件执行检查
                if (handler.shouldExecute && !handler.shouldExecute(ctx)) {
                    return;
                }
                
                await handler.handle(ctx);
            }
        }));
        
        // 直接使用 pipeline 执行
        return await this.pipeline.execute(context, processors, {
            enableTracking: true,
            enableTiming: true,
            breakOnError: true,
            pipelineName: phase ? `DataProcessor:${phase}` : 'DataProcessor',
        });
    }
    
    /**
     * 获取执行统计
     */
    getStats() {
        return this.pipeline.getStats();
    }
    
    /**
     * 重置统计
     */
    resetStats() {
        this.pipeline.resetStats();
    }
    
    /**
     * 打印执行报告
     */
    printReport(result: any) {
        this.pipeline.printReport(result);
    }
}

/**
 * 默认数据处理执行器实例
 */
export const dataProcessorExecutor = new DataProcessorExecutor();
