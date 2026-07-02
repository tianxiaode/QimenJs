/**
 * 管道执行器类型定义
 * 
 * @module pipeline/types
 */

import type { ILogger } from '@/logger';
import type { ExecutionStep, BaseContext, BaseMetadata } from '@/context';

// 重新导出 ExecutionStep 以保持向后兼容
export type { ExecutionStep };

/**
 * 处理器接口
 */
export interface Processor<T = any> {
    /**
     * 处理器名称
     */
    name: string;
    
    /**
     * 处理函数
     */
    execute: (context: T) => Promise<void>;
    
    /**
     * 权重
     */
    weight?: number;
    
    /**
     * 偏移量
     */
    offset?: number;
    
    /**
     * 描述
     */
    description?: string;
}

/**
 * 管道执行选项
 */
export interface PipelineOptions {
    /**
     * 是否启用跟踪
     * @default true
     */
    enableTracking?: boolean;
    
    /**
     * 是否启用性能计时
     * @default true
     */
    enableTiming?: boolean;
    
    /**
     * 是否在错误时中断
     * @default true
     */
    breakOnError?: boolean;
    
    /**
     * 管道名称（用于日志）
     */
    pipelineName?: string;
}

/**
 * 管道执行结果
 */
export interface PipelineResult<T = any> {
    /**
     * 执行上下文
     */
    context: T;
    
    /**
     * 执行步骤
     */
    steps: ExecutionStep[];
    
    /**
     * 是否成功
     */
    isSuccess: boolean;
    
    /**
     * 总耗时（毫秒）
     */
    totalDuration: number;
    
    /**
     * 错误信息
     */
    error?: any;
}

/**
 * 管道执行器接口
 * 
 * @description 统一的管道执行器接口
 * 所有需要执行管道的模块都应该实现此接口
 */
export interface IPipelineExecutor {
    /**
     * 执行管道
     * 
     * @param context 执行上下文
     * @param processors 处理器列表
     * @param options 执行选项
     * @returns 执行结果
     */
    execute<T = any>(
        context: T, 
        processors: Processor<T>[], 
        options?: PipelineOptions
    ): Promise<PipelineResult<T>>;
    
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
 * 管道执行统计
 */
export interface PipelineStats {
    /**
     * 总执行次数
     */
    totalExecutions: number;
    
    /**
     * 成功次数
     */
    successCount: number;
    
    /**
     * 失败次数
     */
    failureCount: number;
    
    /**
     * 平均耗时
     */
    averageDuration: number;
    
    /**
     * 最大耗时
     */
    maxDuration: number;
    
    /**
     * 最小耗时
     */
    minDuration: number;
}

/**
 * 可执行管道接口
 * 
 * @description 上下文对象应该实现此接口
 * 以支持管道执行和监控
 * 
 * @deprecated 使用 BaseContext 代替
 */
export type IExecutableContext = BaseContext;
