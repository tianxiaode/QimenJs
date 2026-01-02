import {
    AuthHeaderProcessor,
    ContentTypeProcessor,
    DataExtractorProcessor,
    HeaderContentTypeProcessor,
    HttpStatusProcessor,
    JsonParseProcessor,
    PathParamsProcessor,
    QueryParamsProcessor,
    RestErrorProcessor,
    TransportFailureProcessor,
} from '../processors';
import {
    BaseConfig,
    HttpClientConfig,
    HttpMethod,
    HttpResponseContext,
    IHeaderProcessor,
    IResponseProcessor,
    IUrlProcessor,
    PollingOptions,
    RequestOptions,
    RequestTask,
    RetryOptions,
    StreamClientConfig,
} from '../types';

import { HttpClient } from './HttpClient';
import { StreamClient } from './StreamClient';
import { globalTaskQueue, TaskPriority } from '@orbitjs/tasks';

export function normalizeBaseConfig(config: {
    baseUrl?: string;
    urlProcessors?: IUrlProcessor[];
    headerProcessors?: IHeaderProcessor[];
}) {
    return {
        // 1. BaseUrl 格式化
        baseUrl: config.baseUrl?.trim().replace(/\/+$/, '') || '',

        // 2. 注入 URL 默认处理器
        urlProcessors: config.urlProcessors || [QueryParamsProcessor, PathParamsProcessor],

        // 3. 注入 Header 默认处理器
        headerProcessors: config.headerProcessors || [
            HeaderContentTypeProcessor,
            AuthHeaderProcessor,
        ],
    };
}

/**
 * HttpFactory.ts
 * * 核心逻辑：
 * 1. 提取 prepareRequest 相关的基础配置（BaseUrl, URL/Header Processors）
 * 2. HttpClient：注入严格的响应流水线
 * 3. StreamClient：注入极简的流处理配置
 */
export class HttpFactory {
    /**
     * 创建标准 HttpClient
     */
    static createHttpClient(config: HttpClientConfig = {}): HttpClient {
        // 提取并归一化公共配置
        const base = normalizeBaseConfig(config);
        const userP = config.responseProcessors || {};

        // 按照业务逻辑顺序编排响应流水线
        const flattenedResponseProcessors: IResponseProcessor[] = [
            TransportFailureProcessor,
            ...(userP.status || [HttpStatusProcessor]),
            ContentTypeProcessor,
            ...(userP.parse || [JsonParseProcessor]),
            ...(userP.error || [RestErrorProcessor]),
            ...(userP.extract || [DataExtractorProcessor]),
            ...(userP.extra || []),
        ];

        return new HttpClient({
            ...base,
            responseProcessors: flattenedResponseProcessors,
        });
    }

    /**
     * 创建 StreamClient (AI 专用)
     */
    static createStreamClient(config: StreamClientConfig = {}): StreamClient {
        // 提取并归一化公共配置
        const base = normalizeBaseConfig(config);

        return new StreamClient({
            ...base,
        });
    }

    /**
     * 创建全套请求套件
     */
    static createSuite(baseConfig: BaseConfig) {
        // 这里的逻辑也变简单了：如果 streamConfig 没传，直接拿 httpConfig 去归一化
        return {
            http: this.createHttpClient(baseConfig.httpConfig),
            stream: this.createStreamClient(baseConfig.streamConfig || baseConfig.httpConfig),
        };
    }

    /**
     * 内置的重试任务创建器
     * 它将普通的 HttpClient 调用包装成一个具有自动重试能力的 Task
     */
    static createRetryTask<T>(
        client: HttpClient,
        method: HttpMethod,
        url: string,
        options: RequestOptions & { retry?: RetryOptions }
    ): RequestTask<T> {
        const { retry, ...requestOptions } = options;
        const controller = new AbortController();
        const signal = requestOptions.signal || controller.signal;

        let retryCount = 0;
        let currentTask: RequestTask<T> | null = null;

        const execute = async (): Promise<T> => {
            while (true) {
                try {
                    // 1. 发起实际请求
                    currentTask = client.request<T>(method, url, { ...requestOptions, signal });
                    return await currentTask.promise;
                } catch (err: any) {
                    const context = err as HttpResponseContext;

                    // 2. 检查是否符合重试条件
                    const canRetry =
                        retry &&
                        retryCount < retry.maxRetries &&
                        !context.metadata.isAborted && // 如果是手动取消，不重试
                        retry.shouldRetry(context);

                    if (canRetry) {
                        retryCount++;
                        // 3. 延迟处理
                        if (retry.delay) {
                            await new Promise(resolve => setTimeout(resolve, retry.delay));
                        }
                        // 继续循环，重新发起请求
                        continue;
                    }

                    // 4. 不满足重试条件，直接抛出最终的错误上下文
                    throw context;
                }
            }
        };

        return {
            promise: execute(),
            cancel: () => {
                controller.abort();
                currentTask?.cancel();
            },
        };
    }

    /**
     * 创建并启动一个轮询任务
     * @param client 实例化的 HttpClient
     * @param method 请求方式
     * @param url 请求地址
     * @param pollingOptions 轮询与请求配置
     * @returns 返回任务 ID，方便后续手动停止（如果队列支持的话）
     */
    static schedulePolling<T>(
        client: HttpClient,
        method: HttpMethod,
        url: string,
        pollingOptions: PollingOptions
    ): void {
        const {
            interval = 5000,
            priority = 'NORMAL',
            maxRetries = 3,
            retryDelay = 1000,
            ...requestOptions
        } = pollingOptions;

        // 将 HttpClient 的调用包装成 TaskQueue 需要的异步函数
        const taskFn = async () => {
            // 注意：这里我们不需要在 promise 后面写 .catch，
            // 因为 GlobalTaskQueue 内部已经处理了 try-catch 并负责重试逻辑。
            const task = client.request<T>(method, url, requestOptions);
            await task.promise;
        };

        // 直接注入全局任务队列
        globalTaskQueue.addTask(
            taskFn,
            priority,
            maxRetries,
            retryDelay,
            true, // isPolling = true
            interval
        );
    }
}
