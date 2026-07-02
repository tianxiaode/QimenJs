/**
 * 基础执行上下文
 * 
 * 所有上下文的基类，提供通用的执行追踪和元数据管理
 * 
 * @module context/base/BaseContext
 */

import type { ExecutionStep } from './ExecutionStep';

/**
 * 基础元数据接口
 * 
 * @description 所有上下文共享的元数据结构
 */
export interface BaseMetadata {
    /**
     * 是否有错误
     */
    hasError?: boolean;
    
    /**
     * 是否终止
     */
    terminate?: boolean;
    
    /**
     * 允许扩展其他属性
     */
    [key: string]: any;
}

/**
 * 基础执行上下文接口
 * 
 * @description 所有上下文的基类，提供通用的执行追踪和元数据管理
 * 
 * @example
 * ```typescript
 * const context: BaseContext = {
 *     steps: [],
 *     metadata: {},
 * };
 * ```
 */
export interface BaseContext {
    /**
     * 执行步骤记录
     * 
     * @description 记录管道中每个处理器的执行情况
     */
    steps: ExecutionStep[];
    
    /**
     * 错误信息
     */
    error?: any;
    
    /**
     * 元数据
     * 
     * @description 存储执行过程中的元数据
     */
    metadata: BaseMetadata;
}

/**
 * 创建基础上下文
 * 
 * @description 工厂函数，用于创建基础上下文实例
 * 
 * @param partial 部分上下文数据
 * @returns 基础上下文实例
 * 
 * @example
 * ```typescript
 * const context = createBaseContext({
 *     metadata: { custom: 'value' },
 * });
 * ```
 */
export function createBaseContext(partial: Partial<BaseContext> = {}): BaseContext {
    return {
        steps: partial.steps || [],
        error: partial.error,
        metadata: partial.metadata || {},
    };
}

/**
 * 添加执行步骤
 * 
 * @description 向上下文中添加一个执行步骤
 * 
 * @param context 上下文
 * @param step 执行步骤
 * 
 * @example
 * ```typescript
 * addStep(context, {
 *     processor: 'MyProcessor',
 *     action: 'executed',
 *     duration: 0.5,
 * });
 * ```
 */
export function addStep(context: BaseContext, step: ExecutionStep): void {
    context.steps.push(step);
}

/**
 * 设置错误
 * 
 * @description 设置上下文的错误信息
 * 
 * @param context 上下文
 * @param error 错误信息
 * 
 * @example
 * ```typescript
 * setError(context, new Error('Something went wrong'));
 * ```
 */
export function setError(context: BaseContext, error: any): void {
    context.error = error;
    context.metadata.hasError = true;
}

/**
 * 清除错误
 * 
 * @description 清除上下文的错误信息
 * 
 * @param context 上下文
 * 
 * @example
 * ```typescript
 * clearError(context);
 * ```
 */
export function clearError(context: BaseContext): void {
    context.error = undefined;
    context.metadata.hasError = false;
}

/**
 * 设置终止标志
 * 
 * @description 设置上下文的终止标志
 * 
 * @param context 上下文
 * @param reason 终止原因
 * 
 * @example
 * ```typescript
 * setTerminate(context, 'Validation failed');
 * ```
 */
export function setTerminate(context: BaseContext, reason?: string): void {
    context.metadata.terminate = true;
    if (reason) {
        context.metadata.terminateReason = reason;
    }
}

/**
 * 检查是否终止
 * 
 * @description 检查上下文是否已终止
 * 
 * @param context 上下文
 * @returns 是否终止
 * 
 * @example
 * ```typescript
 * if (isTerminated(context)) {
 *     // 处理终止逻辑
 * }
 * ```
 */
export function isTerminated(context: BaseContext): boolean {
    return context.metadata.terminate === true;
}
