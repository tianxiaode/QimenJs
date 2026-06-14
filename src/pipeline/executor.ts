/**
 * 管道执行器
 * 
 * 统一的管道执行器，内置监控和日志功能
 * 所有模块（validation、http、data-processor）都应该使用此执行器
 * 
 * @module pipeline/executor
 */

import { Logger } from '../../logger';
import {
    Processor,
    ExecutionStep,
    PipelineOptions,
    PipelineResult,
    PipelineStats,
    IPipelineExecutor,
    IExecutableContext,
} from './types';

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
export class Pipeline implements IPipelineExecutor {
    /**
     * 日志记录器
     */
    private logger = Logger.for(Pipeline);
    
    /**
     * 执行统计
     */
    private stats: PipelineStats = {
        totalExecutions: 0,
        successCount: 0,
        failureCount: 0,
        averageDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
    };
    
    /**
     * 执行管道
     * 
     * @param context 执行上下文
     * @param processors 处理器列表
     * @param options 执行选项
     * @returns 执行结果
     */
    async execute<T = any>(
        context: T,
        processors: Processor<T>[],
        options: PipelineOptions = {}
    ): Promise<PipelineResult<T>> {
        const {
            enableTracking = true,
            enableTiming = true,
            breakOnError = true,
            pipelineName = 'Pipeline',
        } = options;
        
        const startTime = enableTiming ? performance.now() : 0;
        const steps: ExecutionStep[] = [];
        let error: any = undefined;
        let isSuccess = true;
        
        this.logger.debug(`[${pipelineName}] Execution started`);
        
        try {
            // 1. 排序处理器（权重 + 偏移量升序）
            const sortedProcessors = this.sortProcessors(processors);
            
            this.logger.debug(`[${pipelineName}] Processing ${sortedProcessors.length} processors`);
            
            // 2. 串行执行
            for (const processor of sortedProcessors) {
                const step: ExecutionStep = {
                    processor: processor.name,
                    weight: processor.weight,
                    offset: processor.offset,
                    action: 'executed',
                };
                
                // 熔断检查
                if (this.isTerminated(context)) {
                    step.action = 'skipped';
                    step.reason = 'Pipeline terminated';
                    if (enableTracking) steps.push(step);
                    continue;
                }
                
                // 执行处理器
                const processorStartTime = enableTiming ? performance.now() : 0;
                
                try {
                    await processor.execute(context);
                    
                    // 记录成功
                    if (enableTiming) {
                        step.duration = performance.now() - processorStartTime;
                    }
                    
                    // 检查是否被处理器熔断
                    if (this.isTerminated(context)) {
                        step.action = 'terminated';
                        step.reason = 'Processor raised termination';
                    }
                    
                    if (enableTracking) steps.push(step);
                    
                    this.logger.debug(
                        `[${pipelineName}] Processor "${processor.name}" executed in ${step.duration?.toFixed(2) || '-'}ms`
                    );
                    
                } catch (err) {
                    // 记录错误
                    if (enableTiming) {
                        step.duration = performance.now() - processorStartTime;
                    }
                    
                    step.action = 'terminated';
                    step.error = err;
                    step.reason = 'Processor threw error';
                    
                    if (enableTracking) steps.push(step);
                    
                    this.logger.error(
                        `[${pipelineName}] Processor "${processor.name}" failed:`,
                        err
                    );
                    
                    // 设置错误状态
                    this.setError(context, err);
                    
                    error = err;
                    isSuccess = false;
                    
                    // 是否中断后续执行
                    if (breakOnError) {
                        break;
                    }
                }
            }
            
        } catch (err) {
            this.logger.error(`[${pipelineName}] Execution failed:`, err);
            error = err;
            isSuccess = false;
        }
        
        const endTime = enableTiming ? performance.now() : 0;
        const totalDuration = enableTiming ? endTime - startTime : 0;
        
        // 更新统计
        this.updateStats(isSuccess, totalDuration);
        
        this.logger.debug(
            `[${pipelineName}] Execution finished in ${totalDuration.toFixed(2)}ms`
        );
        
        return {
            context,
            steps,
            isSuccess,
            totalDuration,
            error,
        };
    }
    
    /**
     * 排序处理器
     * 
     * @description 按 weight + offset 升序排序
     */
    private sortProcessors<T>(processors: Processor<T>[]): Processor<T>[] {
        return [...processors].sort((a, b) => {
            const weightA = (a.weight ?? 100) + (a.offset ?? 0);
            const weightB = (b.weight ?? 100) + (b.offset ?? 0);
            return weightA - weightB;
        });
    }
    
    /**
     * 检查是否已熔断
     */
    private isTerminated<T>(context: T): boolean {
        return (context as IExecutableContext).metadata?.terminate === true;
    }
    
    /**
     * 设置错误状态
     */
    private setError<T>(context: T, error: any): void {
        const ctx = context as IExecutableContext;
        ctx.error = error;
        if (!ctx.metadata) {
            ctx.metadata = {};
        }
        ctx.metadata.hasError = true;
    }
    
    /**
     * 更新统计信息
     */
    private updateStats(isSuccess: boolean, duration: number): void {
        this.stats.totalExecutions++;
        
        if (isSuccess) {
            this.stats.successCount++;
        } else {
            this.stats.failureCount++;
        }
        
        // 更新耗时统计
        if (duration > 0) {
            const totalDuration = this.stats.averageDuration * (this.stats.totalExecutions - 1) + duration;
            this.stats.averageDuration = totalDuration / this.stats.totalExecutions;
            
            if (duration > this.stats.maxDuration) {
                this.stats.maxDuration = duration;
            }
            
            if (duration < this.stats.minDuration) {
                this.stats.minDuration = duration;
            }
        }
    }
    
    /**
     * 获取执行统计
     */
    getStats(): PipelineStats {
        return { ...this.stats };
    }
    
    /**
     * 重置统计
     */
    resetStats(): void {
        this.stats = {
            totalExecutions: 0,
            successCount: 0,
            failureCount: 0,
            averageDuration: 0,
            maxDuration: 0,
            minDuration: Infinity,
        };
    }
    
    /**
     * 打印执行报告
     */
    printReport(result: PipelineResult): void {
        console.group('📊 Pipeline Execution Report');
        
        console.log(`\n✅ Status: ${result.isSuccess ? 'Success' : 'Failed'}`);
        console.log(`⏱️  Total Duration: ${result.totalDuration.toFixed(2)}ms`);
        console.log(`📝 Steps: ${result.steps.length}`);
        
        if (result.steps.length > 0) {
            console.log('\n📋 Execution Steps:');
            
            const tableData = result.steps.map((step, index) => ({
                '#': index + 1,
                'Processor': step.processor,
                'Weight': step.weight ?? '-',
                'Offset': step.offset ?? '-',
                'Action': step.action,
                'Duration': step.duration ? `${step.duration.toFixed(2)}ms` : '-',
                'Reason': step.reason || '-',
            }));
            
            console.table(tableData);
        }
        
        if (result.error) {
            console.log('\n❌ Error:', result.error);
        }
        
        console.groupEnd();
    }
}

/**
 * 默认管道执行器实例
 */
export const pipeline = new Pipeline();
