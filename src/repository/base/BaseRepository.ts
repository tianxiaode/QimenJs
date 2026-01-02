import { composeMixins } from "@orbitjs/utils";

const BaseRepoWithEvents = composeMixins(Object as any, [WithEvents]);

export abstract class BaseRepository extends BaseRepoWithEvents {
    // 这里的 super.on / super.emit 都是安全的
}

export abstract class BaseRepository {
    protected readonly globalConfig = RepositoryGlobalConfig.get();

    protected async dispatch<T>(action: string, url: string, params: any = {}): Promise<T> {
        // 1. 初始化上下文 (此时 RequestOptions 已包含业务传进来的 params)
        let reqCtx: RepoRequestContext = {
            action,
            url,
            options: {
                method: 'GET', // 默认，后期可被处理器修改
                params: params,
                headers: {}
            }
        };

        // 2. 执行请求处理器链 (RequestProcessors)
        // 比如在这里跑：分页转换 -> 参数对齐 -> 全 POST 转换
        for (const processor of this.globalConfig.requestProcessors) {
            reqCtx = await processor(reqCtx, this.globalConfig);
        }

        // 3. 提交请求
        const result = await this.globalConfig.httpClient.request<T>(
            reqCtx.options.method!,
            reqCtx.url,
            reqCtx.options
        ).promise;

        // 4. 执行响应处理器链 (ResponseProcessors)
        // 比如在这里跑：删除成功提示 -> 埋点记录
        const resCtx: RepoResponseContext<T> = {
            action,
            data: result,
            response: (result as any)._rawResponse // 假设 HttpClient 把原始响应也带回来了
        };

        for (const processor of this.globalConfig.responseProcessors) {
            await processor(resCtx, this.globalConfig);
        }

        return result;
    }
}