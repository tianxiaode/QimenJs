import {
    DataProcessContext,
    PreProcessor,
    PreProcessorPipelines,
    PreRequestContext,
    REPO_ACTION,
} from '@/repository/types';
import { RepositoryContextFactory } from '../RepositoryContextFactory';

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
        config: {
            basePath: string;
            rowKey: string;
            global: PreProcessorPipelines;
            local: PreProcessorPipelines;
        },
        action: REPO_ACTION,
        payload: any,
        transformFn: (p: any, a: REPO_ACTION) => any
    ): Promise<{ preCtx: PreRequestContext | null; abortedResult: DataProcessContext | null }> {
        // 1. 获取预组装的任务数组 (使用优化的 getHandlers)
        const handlers = this.getHandlers(repoName, config, action);

        // 2. 调用工厂创建初始上下文
        const preCtx = RepositoryContextFactory.createPreRequest(
            { basePath: config.basePath, rowKey: config.rowKey },
            action,
            payload,
            transformFn
        );

        // 3. 执行处理器链
        for (const handler of handlers) {
            // 约定：只有显式返回 false 才认为是被拦截中断
            const result = await handler(preCtx, payload);
            if (!result) {
                return {
                    preCtx: null,
                    abortedResult: RepositoryContextFactory.createAbortedContext(
                        action,
                        'Pre-Processor Rejection'
                    ),
                };
            }
        }

        return { preCtx, abortedResult: null };
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
