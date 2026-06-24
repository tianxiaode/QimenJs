/**
 * HttpExecutor 核心类
 *
 * 负责执行 HTTP 请求的核心逻辑
 * - 接收 RequestContext
 * - 处理 domain 配置
 * - 从 HttpActionRegistrar 获取 actions
 * - 执行管道
 * - 返回处理后的上下文
 */
import type { RequestContext } from '@orbitjs/context';
/**
 * HTTP 执行结果
 */
export interface HttpExecutionResult {
    /**
     * 执行后的上下文
     */
    context: RequestContext;
    /**
     * 是否成功
     */
    success: boolean;
    /**
     * 错误信息（如果有）
     */
    error?: any;
}
/**
 * HttpExecutor 核心类
 */
export declare class HttpExecutor {
    /**
     * 处理 domain 配置
     *
     * @param context - 请求上下文
     */
    private processDomainConfig;
    /**
     * 获取 actions 列表
     *
     * @returns actions 列表
     */
    private getActions;
    /**
     * 执行 HTTP 请求
     *
     * @param context - 请求上下文
     * @returns 执行结果
     */
    execute(context: RequestContext): Promise<HttpExecutionResult>;
    /**
     * 创建可取消的执行任务
     *
     * @param context - 请求上下文
     * @returns 包含 promise 和 cancel 方法的对象
     */
    createTask(context: RequestContext): {
        promise: Promise<HttpExecutionResult>;
        cancel: (reason?: string) => void;
    };
}
//# sourceMappingURL=HttpExecutor.d.ts.map