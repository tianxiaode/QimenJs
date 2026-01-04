import { HttpClient, HttpResponseContext, RequestTask } from '@orbitjs/http';
import { REPO_ACTION, DataProcessContext, FlowContext, FlowOptions } from '../types';
import {
    AccessController,
    AccessExecutor,
    DataProcessorExecutor,
    PreProcessorExecutor,
} from './executor';
import { RepositoryContextFactory } from './RepositoryContextFactory';

export class FlowRunner {
    /**
     * @param options 运行所需的资源和环境
     */
    static async run(
        options: FlowOptions,
        action: REPO_ACTION,
        payload: any
    ): Promise<DataProcessContext> {
        const flow: FlowContext = { action, payload, preCtx: null, httpRes: null, result: null };

        options.onLoading(true);
        try {
            // 1. 权限校验 (传参)
            await AccessExecutor.run(
                { basePath: options.basePath, accessController: options.accessController },
                action,
                payload
            );

            // 2. 预处理 (传参)
            const { preCtx, abortedResult } = await PreProcessorExecutor.run(
                options.repoName,
                {
                    basePath: options.basePath,
                    rowKey: options.rowKey,
                    global: options.prePipelines.global,
                    local: options.prePipelines.local,
                },
                action,
                payload,
                options.transformFn
            );
            flow.preCtx = preCtx;
            flow.result = abortedResult;
            if (flow.result || !flow.preCtx) return flow.result!;

            // 3. 网络请求执行体 (传参 + 状态 Map)
            await this.executeNetworkFlow(options, flow);

            if (flow.result) {
                options.onSuccess(flow.result);
            }

            return flow.result!;
        } catch (error: any) {
            options.onError(error);
            throw error;
        } finally {
            // 4. 触发 loading: false
            options.onLoading(false);
        }
    }

    private static async executeNetworkFlow(
        options: {
            repoName: string;
            httpClient: HttpClient;
            activeTasks: Map<REPO_ACTION, RequestTask<HttpResponseContext>>;
            dataPipelines: { global: any; local: any };
        },
        f: FlowContext
    ) {
        if (!f.preCtx) return;

        try {
            // 使用注入的 httpClient 和 activeTasks
            const task = options.httpClient.request(
                f.preCtx.method,
                f.preCtx.url,
                f.preCtx.options
            );
            options.activeTasks.set(f.action, task);

            f.httpRes = await task.promise;

            // 调用数据专家
            f.result = await DataProcessorExecutor.run(
                options.repoName,
                options.dataPipelines,
                f.httpRes,
                f.preCtx
            );
        } finally {
            options.activeTasks.delete(f.action);
        }
    }
}
