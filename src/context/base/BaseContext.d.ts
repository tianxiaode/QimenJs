/**
 * 基础执行上下文
 *
 * 所有上下文的基类，提供通用的执行追踪和元数据管理
 *
 * @module context/base/BaseContext
 */
import { ExecutionStep } from './ExecutionStep';
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
export declare function createBaseContext(partial?: Partial<BaseContext>): BaseContext;
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
export declare function addStep(context: BaseContext, step: ExecutionStep): void;
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
export declare function setError(context: BaseContext, error: any): void;
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
export declare function clearError(context: BaseContext): void;
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
export declare function setTerminate(context: BaseContext, reason?: string): void;
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
export declare function isTerminated(context: BaseContext): boolean;
//# sourceMappingURL=BaseContext.d.ts.map