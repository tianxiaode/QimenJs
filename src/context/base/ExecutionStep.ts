/**
 * 执行步骤
 *
 * 记录管道中每个处理器的执行情况
 *
 * @module context/base/ExecutionStep
 */

/**
 * 执行动作类型
 */
export type ExecutionAction = 'executed' | 'skipped' | 'terminated';

/**
 * 执行步骤接口
 *
 * @description 记录管道中每个处理器的执行情况
 *
 * @example
 * ```typescript
 * const step: ExecutionStep = {
 *     processor: 'StringTypeProcessor',
 *     weight: 100,
 *     offset: 10,
 *     action: 'executed',
 *     duration: 0.5,
 * };
 * ```
 */
export interface ExecutionStep {
    /**
     * 处理器名称
     */
    processor: string;

    /**
     * 权重
     */
    weight?: number;

    /**
     * 偏移量
     */
    offset?: number;

    /**
     * 执行动作
     * - executed: 已执行
     * - skipped: 已跳过
     * - terminated: 已终止
     */
    action: ExecutionAction;

    /**
     * 执行耗时（毫秒）
     */
    duration?: number;

    /**
     * 原因
     *
     * @description 跳过或终止的原因
     */
    reason?: string;

    /**
     * 错误信息
     */
    error?: any;
}
