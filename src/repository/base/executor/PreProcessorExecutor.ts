import {
    DataProcessContext,
    FlowStatus,
    PreProcessor,
    PreProcessorPipelines,
    PreRequestContext,
    REPO_ACTION,
} from '@/repository/types';
import { RepositoryContextFactory } from '../RepositoryContextFactory';
import { RepositoryFlowAbortedError } from '@/repository/errors/RepositoryFlowAbortedError';

// PreProcessorExecutor.ts
export class PreProcessorExecutor {
    /**
     * 静态 Map：存储每个 Repository 组装好的“拍平”后的处理器数组
     * Key: Repository 类名, Value: Map<Action, 处理器数组>
     */
    private static readonly compiledMap = new Map<string, Map<REPO_ACTION, PreProcessor[]>>();

    /**
     * 执行预处理逻辑
     */
    static async run(
        repoName: string,
        config: any,
        action: REPO_ACTION,
        payload: any,
        transformFn: any
    ): Promise<PreRequestContext> {
        const handlers = this.getHandlers(repoName, config, action);

        // 初始化上下文
        let context = RepositoryContextFactory.createPreRequest(
            { basePath: config.basePath, rowKey: config.rowKey },
            action,
            payload,
            transformFn
        );

        for (const handler of handlers) {
            try {
                // 1. 执行处理器：支持同步/异步，且对返回值进行保护
                context = (await handler(context, payload)) || context;

                // 2. 防御性检查：即使处理器内部没有 throw，
                // 只要它通过 ctx.status 表达了不满，我们在此处主动断开
                if (context.status === FlowStatus.ABORTED) {
                    throw context;
                }
            } catch (errOrCtx: any) {
                // 3. 统一拦截出口：
                // 如果已经是 context 对象了，直接顺延向上 reject
                if (errOrCtx?.status === FlowStatus.ABORTED) {
                    // 这样抛出的错误里直接带着可以直接给 UI 展示的 DataProcessContext
                    const abortedResult = RepositoryContextFactory.handleAborted(errOrCtx);
                    throw new RepositoryFlowAbortedError(abortedResult.message, abortedResult);
                }

                // 如果是真正的代码 Bug（比如处理器内部读了空指针）
                // 我们将 Bug 捕获并强行转化为一个“异常工单”
                context.status = FlowStatus.ABORTED;
                context.abortReason = `[Handler Panic] ${errOrCtx.message || 'Unknown error'}`;
                throw new RepositoryFlowAbortedError(
                    context.abortReason,
                    RepositoryContextFactory.handleAborted(context)
                );
            }
        }

        context.status = FlowStatus.PROCEED;
        return context;
    }
    /**
     * 内部方法：获取或组装处理器清单（带缓存 Map）
     */
    private static getHandlers(
        repoName: string,
        config: { global: PreProcessorPipelines; local: PreProcessorPipelines },
        action: REPO_ACTION
    ): PreProcessor[] {
        // 获取当前仓库的 Action Map
        let repoMap = this.compiledMap.get(repoName);
        if (!repoMap) {
            repoMap = new Map();
            this.compiledMap.set(repoName, repoMap);
        }

        // 获取该 Action 已经拍平的 handlers
        let handlers = repoMap.get(action);
        if (!handlers) {
            // 组装逻辑：这里使用了正确的 config 变量名
            handlers = [
                ...(config.global.common || []),
                ...(config.local.common || []),
                ...(config.local[action] || []),
                ...(config.global[action] || []),
            ];
            // 写入缓存，下次直接 O(1) 获取
            repoMap.set(action, handlers);
        }

        return handlers;
    }
}
