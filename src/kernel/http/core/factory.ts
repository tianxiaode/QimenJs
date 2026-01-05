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
} from '../../types/http';

import { HttpClient } from './HttpClient';
import { StreamClient } from './StreamClient';
import { globalTaskQueue, TaskPriority } from '@orbitjs/tasks';

/**
 * 标准化基础配置函数
 * 
 * 该函数负责：
 * 1. 清理和格式化基础 URL
 * 2. 提供默认的 URL 处理器
 * 3. 提供默认的 Header 处理器
 * 
 * @param config 包含 baseUrl 和处理器的配置对象
 * @returns 标准化的配置对象
 */
export function normalizeBaseConfig(config: {
    baseUrl?: string;
    urlProcessors?: IUrlProcessor[];
    headerProcessors?: IHeaderProcessor[];
}): {
    baseUrl: string;
    urlProcessors: IUrlProcessor[];
    headerProcessors: IHeaderProcessor[];
} {
    return {
        // 1. BaseUrl 格式化 - 移除前后空格和结尾的斜杠
        baseUrl: config.baseUrl?.trim().replace(/\/+$/, '') || '',

        // 2. 注入 URL 默认处理器 - 参数序列化和路径参数处理
        urlProcessors: config.urlProcessors || [QueryParamsProcessor, PathParamsProcessor],

        // 3. 注入 Header 默认处理器 - 内容类型和认证头处理
        headerProcessors: config.headerProcessors || [
            HeaderContentTypeProcessor,
            AuthHeaderProcessor,
        ],
    };
}

/**
 * HttpFactory 类
 * 
 * 提供创建 HTTP 客户端和相关工具的工厂方法
 * 
 * 核心逻辑：
 * 1. 提取 prepareRequest 相关的基础配置（BaseUrl, URL/Header Processors）
 * 2. HttpClient：注入严格的响应流水线
 * 3. StreamClient：注入极简的流处理配置
 */
export class HttpFactory {
    /**
     * 创建标准 HttpClient
     * 
     * 根据配置创建具有完整处理流水线的 HttpClient 实例
     * 
     * @param config HttpClient 配置
     * @returns 新创建的 HttpClient 实例
     */
    static createHttpClient(config: HttpClientConfig = {}): HttpClient {
        // 提取并归一化公共配置
        const base = normalizeBaseConfig(config);
        const userP = config.responseProcessors || {};

        // 按照业务逻辑顺序编排响应流水线
        // 1. 传输失败处理器 - 处理网络错误
        // 2. HTTP 状态处理器 - 处理 HTTP 状态码
        // 3. 内容类型处理器 - 处理响应内容类型
        // 4. JSON 解析处理器 - 解析 JSON 响应
        // 5. REST 错误处理器 - 处理业务错误
        // 6. 数据提取处理器 - 提取响应数据
        // 7. 额外的用户自定义处理器
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
     * 
     * 根据配置创建用于处理流式数据的 StreamClient 实例
     * 
     * @param config StreamClient 配置
     * @returns 新创建的 StreamClient 实例
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
     * 
     * 同时创建 HttpClient 和 StreamClient 实例，形成完整的请求工具套件
     * 
     * @param baseConfig 基础配置对象
     * @returns 包含 http 和 stream 客户端的对象
     */
    static createSuite(baseConfig: BaseConfig) {
        return {
            // 创建标准 HTTP 客户端
            http: this.createHttpClient(baseConfig.httpConfig),
            // 创建流式客户端，如果没有提供流配置，则使用 HTTP 配置
            stream: this.createStreamClient(baseConfig.streamConfig || baseConfig.httpConfig),
        };
    }

    /**
     * 内置的重试任务创建器
     * 
     * 将普通的 HttpClient 调用包装成一个具有自动重试能力的 Task
     * 
     * @param client HttpClient 实例
     * @param method HTTP 方法
     * @param url 请求 URL
     * @param options 请求选项，包含重试配置
     * @returns 具有重试功能的 RequestTask
     */
    static createRetryTask<T>(
        client: HttpClient,
        method: HttpMethod,
        url: string,
        options: RequestOptions & { retry?: RetryOptions }
    ): RequestTask<T> {
        // 提取重试选项并保留其他请求选项
        const { retry, ...requestOptions } = options;
        const controller = new AbortController();
        const signal = requestOptions.signal || controller.signal;

        let retryCount = 0;
        let currentTask: RequestTask<HttpResponseContext> | null = null;

        // 执行函数，包含重试逻辑
        const execute = async (): Promise<HttpResponseContext> => {
            while (true) {
                try {
                    // 1. 发起实际请求
                    currentTask = client.request(method, url, { ...requestOptions, signal });
                    return await currentTask.promise;
                } catch (err: any) {
                    const context = err as HttpResponseContext;

                    // 2. 检查是否符合重试条件
                    // 需要同时满足：有重试配置、未超过最大重试次数、不是手动取消的请求
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
            promise: execute() as any,
            cancel: () => {
                controller.abort();
                currentTask?.cancel();
            },
        };
    }

    /**
     * 创建并启动一个轮询任务
     * 
     * 将请求包装为一个周期性执行的任务，添加到全局任务队列中
     * 
     * @param client 实例化的 HttpClient
     * @param method 请求方式
     * @param url 请求地址
     * @param pollingOptions 轮询与请求配置
     * @returns 无返回值，任务已添加到队列中
     */
    static schedulePolling<T>(
        client: HttpClient,
        method: HttpMethod,
        url: string,
        pollingOptions: PollingOptions
    ): void {
        // 解构轮询选项
        const {
            interval = 5000,        // 默认轮询间隔 5 秒
            priority = 'NORMAL',    // 默认优先级
            maxRetries = 3,        // 默认最大重试次数
            retryDelay = 1000,     // 默认重试延迟
            ...requestOptions      // 其他请求选项
        } = pollingOptions;

        // 将 HttpClient 的调用包装成 TaskQueue 需要的异步函数
        const taskFn = async () => {
            // 注意：这里我们不需要在 promise 后面写 .catch，
            // 因为 GlobalTaskQueue 内部已经处理了 try-catch 并负责重试逻辑。
            const task = client.request(method, url, requestOptions);
            await task.promise;
        };

        // 直接注入全局任务队列
        globalTaskQueue.addTask(
            taskFn,
            priority,
            maxRetries,
            retryDelay,
            true, // isPolling = true，标识这是一个轮询任务
            interval
        );
    }
}
