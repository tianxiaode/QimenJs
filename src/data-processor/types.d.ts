/**
 * 数据处理管道类型定义
 *
 * @module data-processor/types
 */
import { RequestContext } from '../types';
/**
 * 数据处理标签
 *
 * @description 用于标记处理器的适用范围，支持复用
 *
 * 使用方式：
 * - 单一标签：['abp'] - 仅适用于 ABP
 * - 多标签：['abp', 'spring'] - 适用于 ABP 和 Spring
 * - 通配符：['any'] - 适用于所有场景
 */
export type DataProcessorTag = 'abp' | 'spring' | 'nestjs' | 'custom' | 'pre' | 'post' | 'any' | string;
/**
 * 数据处理器
 *
 * @description 数据处理管道的基本处理单元
 *
 * 参照 validation 的处理器设计
 */
export interface DataProcessorHandler {
    /**
     * 处理器名称（唯一标识）
     */
    name: string;
    /**
     * 处理函数
     */
    handle: (context: RequestContext) => Promise<void>;
    /**
     * 权重（阶段权重）
     * @see DataProcessorWeight
     * @default 100
     */
    weight?: number;
    /**
     * 偏移量（同阶段内的微调）
     * @default 0
     */
    offset?: number;
    /**
     * 标签（用于过滤和复用）
     * @description 处理器可通过标签匹配不同的管道
     * @default ['any']
     */
    tags?: DataProcessorTag[];
    /**
     * 条件执行函数
     * @description 返回 true 时执行，返回 false 时跳过
     */
    shouldExecute?: (context: RequestContext) => boolean;
    /**
     * 描述信息
     */
    description?: string;
    /**
     * 类别（用于分组）
     */
    category?: string;
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
export type DataProcessorKey = 'abp' | 'abp-pre' | 'abp-post' | 'spring' | 'spring-pre' | 'spring-post' | string;
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
    /**
     * 权重
     */
    weight?: number;
    /**
     * 偏移量
     */
    offset?: number;
    /**
     * 跳过原因
     */
    reason?: string;
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
//# sourceMappingURL=types.d.ts.map