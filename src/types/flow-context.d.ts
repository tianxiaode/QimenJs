/**
 * 核心执行上下文类型定义
 *
 * 只包含真正需要跨包共享的基础类型
 *
 * @module types/flow-context
 */
/**
 * 执行步骤记录
 */
export interface ExecutionStep {
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
    status: 'success' | 'error' | 'skipped' | 'pending';
    /**
     * 错误信息（如果有）
     */
    error?: any;
}
/**
 * 可执行上下文接口（最小化）
 *
 * 所有上下文类型的基础接口
 */
export interface IExecutableContext {
    /**
     * 是否已中止
     */
    isAborted: boolean;
    /**
     * 执行步骤记录
     */
    steps: ExecutionStep[];
    /**
     * 元数据（允许扩展）
     */
    metadata: Record<string, any>;
}
/**
 * 管道结果接口
 */
export interface IPipelineResult<T = any> {
    /**
     * 执行是否成功
     */
    success: boolean;
    /**
     * 最终上下文
     */
    context: T;
    /**
     * 执行步骤
     */
    steps: ExecutionStep[];
    /**
     * 错误信息（如果有）
     */
    error?: any;
}
//# sourceMappingURL=flow-context.d.ts.map