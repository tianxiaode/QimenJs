/**
 * 数据处理管道类型定义
 * 
 * @module data-processor/types
 */

import { FlowContext } from '../types';

/**
 * 数据处理器
 * 
 * @description 数据处理管道的基本处理单元
 */
export interface DataProcessorHandler {
    /**
     * 处理器名称（唯一标识）
     */
    name: string;
    
    /**
     * 处理函数
     */
    handle: (context: FlowContext) => Promise<void>;
    
    /**
     * 权重（数字越大优先级越高）
     * @default 100
     */
    weight?: number;
    
    /**
     * 条件执行函数
     * @description 返回 true 时执行，返回 false 时跳过
     */
    shouldExecute?: (context: FlowContext) => boolean;
    
    /**
     * 描述信息
     */
    description?: string;
}

/**
 * 数据处理关键字类型
 * 
 * @description 用于标识不同的数据处理管道
 * 
 * 命名规则：
 * - '{preset}' - 完整管道（前导 + 后道）
 * - '{preset}-pre' - 前导管道
 * - '{preset}-post' - 后道管道
 * 
 * @example
 * 'abp' - ABP 完整管道
 * 'abp-pre' - ABP 前导管道
 * 'abp-post' - ABP 后道管道
 * 'spring-pre' - Spring 前导管道
 * 'custom-xxx' - 自定义管道
 */
export type DataProcessorKey = 
    | 'abp'           // ABP 完整管道
    | 'abp-pre'       // ABP 前导管道
    | 'abp-post'      // ABP 后道管道
    | 'spring'        // Spring 完整管道
    | 'spring-pre'    // Spring 前导管道
    | 'spring-post'   // Spring 后道管道
    | string;         // 自定义关键字

/**
 * 执行步骤记录
 */
export interface ProcessorExecutionStep {
    /**
     * 处理器名称
     */
    name: string;
    
    /**
     * 执行耗时（毫秒）
     */
    duration: number;
    
    /**
     * 执行状态
     */
    status: 'success' | 'error' | 'skipped';
    
    /**
     * 错误信息（如果有）
     */
    error?: any;
}

/**
 * 通用管道定义
 */
export interface CommonPipelineDefinition {
    /**
     * 管道名称
     */
    name: string;
    
    /**
     * 管道类别
     */
    category: 'param' | 'data' | 'error' | 'utility';
    
    /**
     * 描述信息
     */
    description: string;
    
    /**
     * 创建处理器的工厂函数
     */
    createHandler: (options?: any) => DataProcessorHandler;
    
    /**
     * 标签（用于分类和搜索）
     */
    tags?: string[];
}
