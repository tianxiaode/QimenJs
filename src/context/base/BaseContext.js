"use strict";
/**
 * 基础执行上下文
 *
 * 所有上下文的基类，提供通用的执行追踪和元数据管理
 *
 * @module context/base/BaseContext
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseContext = createBaseContext;
exports.addStep = addStep;
exports.setError = setError;
exports.clearError = clearError;
exports.setTerminate = setTerminate;
exports.isTerminated = isTerminated;
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
function createBaseContext(partial = {}) {
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
function addStep(context, step) {
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
function setError(context, error) {
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
function clearError(context) {
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
function setTerminate(context, reason) {
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
function isTerminated(context) {
    return context.metadata.terminate === true;
}
//# sourceMappingURL=BaseContext.js.map