/**
 * 验证执行器
 *
 * 使用统一的 pipeline 执行器
 * 避免重复实现监控、日志等功能
 *
 * @module validation/executor
 */
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
export declare class ValidationExecutor {
    /**
     * 管道执行器实例
     */
    private pipeline;
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
    execute(context: ValidationContext, processors: any[], ruleType?: string): Promise<import("@/pipeline").PipelineResult<ValidationContext>>;
    /**
     * 获取执行统计
     */
    getStats(): import("@/pipeline").PipelineStats;
    /**
     * 重置统计
     */
    resetStats(): void;
    /**
     * 打印执行报告
     */
    printReport(result: any): void;
}
/**
 * 默认验证执行器实例
 */
export declare const validationExecutor: ValidationExecutor;
//# sourceMappingURL=executor.d.ts.map