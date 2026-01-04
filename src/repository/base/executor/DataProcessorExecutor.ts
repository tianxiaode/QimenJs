import {
    DataProcessContext,
    DataProcessor,
    DataProcessorPipelines,
    PreRequestContext,
    REPO_ACTION,
} from '@/repository/types';
import { HttpResponseContext } from '@orbitjs/http';
import { RepositoryContextFactory } from '../RepositoryContextFactory';

export class DataProcessorExecutor {
    // 缓存已经拍平的处理器数组
    private static readonly compiledMap = new Map<string, Map<REPO_ACTION, DataProcessor[]>>();

    /**
     * 执行数据转换逻辑
     * @param repoName 仓储名
     * @param config 处理器配置
     * @param httpRes HTTP 响应
     * @param reqCtx 请求上下文（用于辅助转换，如获取 action）
     */
static async run(
        repoName: string,
        config: {
            global: DataProcessorPipelines;
            local: DataProcessorPipelines;
        },
        httpRes: HttpResponseContext,
        reqCtx: PreRequestContext
    ): Promise<DataProcessContext> {
        const action = reqCtx.metadata.action;
        const handlers = this.getHandlers(repoName, config, action);

        // 1. 调用工厂初始化上下文 (对标原本的 createDataProcessContext)
        // 这里初始化的 dataCtx 包含了 status, code 等基础信息
        let dataCtx = RepositoryContextFactory.createDataProcess(httpRes);
        
        // 2. 执行管道 (对标原本的 for 循环)
        for (const handler of handlers) {
            // 兼容你原来的逻辑：处理器可能会返回一个新的 context 对象
            // 如果处理器没有返回(void)，则继续使用当前的 dataCtx
            const result = await handler(dataCtx, httpRes, reqCtx);
            if (result) {
                dataCtx = result;
            }
        }

        return dataCtx;
    }
    private static getHandlers(
        repoName: string,
        config: { global: DataProcessorPipelines; local: DataProcessorPipelines },
        action: REPO_ACTION
    ): DataProcessor[] {
        let repoMap = this.compiledMap.get(repoName);
        if (!repoMap) {
            repoMap = new Map();
            this.compiledMap.set(repoName, repoMap);
        }

        let handlers = repoMap.get(action);
        if (!handlers) {
            // 组装顺序：全局通用 -> 本地通用 -> 本地特定动作 -> 全局特定动作
            handlers = [
                ...(config.global.common || []),
                ...(config.local.common || []),
                ...(config.local[action] || []),
                ...(config.global[action] || []),
            ];
            repoMap.set(action, handlers);
        }
        return handlers;
    }
}