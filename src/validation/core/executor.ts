/**
 * 验证执行器
 * 
 * 使用统一的 pipeline 执行器
 * 避免重复实现监控、日志等功能
 * 
 * @module validation/executor
 */

import { Pipeline } from '../../pipeline';
import { ValidationContext } from '../types';

/**
 * 验证执行器
 * 
 * @description 简单封装 pipeline，提供验证专用的执行接口
 * 
 * @example
 * import { ValidationExecutor } from '@/validation';
 * 
 * const executor = new ValidationExecutor();
 * 
 * // 执行验证管道
 * const result = await executor.execute(context, processors);
 * 
 * // 打印报告
 * executor.printReport(result);
 */
export class ValidationExecutor {
    /**
     * 管道执行器实例
     */
    private pipeline = new Pipeline();
    
    /**
     * 执行验证管道
     * 
     * @param context 验证上下文
     * @param processors 处理器列表
     * @param ruleType 规则类型（用于日志）
     * @returns 执行结果
     * 
     * @example
     * const processors = Validator.get('string');
     * const result = await executor.execute(context, processors, 'string');
     */
    async execute(
        context: ValidationContext, 
        processors: any[],
        ruleType?: string
    ) {
        // 转换为 pipeline 的处理器格式
        const pipelineProcessors = processors.map(processor => ({
            name: processor.name,
            weight: processor.weight,
            offset: processor.offset,
            description: processor.description,
            execute: async (ctx: ValidationContext) => {
                await processor.execute(ctx);
            }
        }));
        
        // 直接使用 pipeline 执行
        return await this.pipeline.execute(context, pipelineProcessors, {
            enableTracking: true,
            enableTiming: true,
            breakOnError: false,  // 验证不中断，收集所有错误
            pipelineName: ruleType ? `Validation:${ruleType}` : 'Validation',
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
 * 默认验证执行器实例
 */
export const validationExecutor = new ValidationExecutor();
