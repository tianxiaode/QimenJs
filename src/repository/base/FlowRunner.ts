import { HttpClient, HttpResponseContext, RequestTask } from '@orbitjs/http';
import {
    REPO_ACTION,
    DataProcessContext,
    FlowContext,
    FlowOptions,
} from '../types';
import { AccessExecutor, CacheExecutor, DataProcessorExecutor, PreProcessorExecutor } from './executor';
import { EntityManagerBusinessError } from '../errors';
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

            if(options.enableCache){
                const  cacheResult = await CacheExecutor.read(options.repoName, options.cacheManager!, action, payload);
                if(cacheResult){
                    flow.result = cacheResult;
                    options.onSuccess(flow.result);
                    return flow.result;
                }
            }

            flow.result = RepositoryContextFactory.createDataProcess(
                {
                    status: 0,
                    data: null,
                    metadata: { isHttpSuccess: false, isTransportFailure: false, isAborted: false },
                } as any,
                { message: 'Request Initializing' } // 这里可以传入初始状态
            );

            // 2. 预处理 (传参)
            const preCtx = await PreProcessorExecutor.run(
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

            // 3. 网络请求执行体 (传参 + 状态 Map)
            await this.executeNetworkFlow(options, flow);

            if (!flow.result.status.isBusinessSuccess) {
                // 这里 reject，业务层 list() 后续不执行
                throw new EntityManagerBusinessError(flow.result.message, flow.result);
            }

            if (flow.result) {
                options.onSuccess(flow.result);
            }

            if(options.enableCache && flow.result){
                await CacheExecutor.save(options.repoName, options.cacheManager!, action, payload, flow.result,options.cacheTTL);
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
