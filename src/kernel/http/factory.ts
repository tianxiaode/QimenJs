import {
    FlowContext,
    HttpMethod,
    RequestTask,
    RetryOptions,
    RequestOptions,
    PollingOptions,
} from '../types';
import { HttpClient } from './HttpClient';
import { globalTaskQueue } from '@orbitjs/tasks';

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
    static createRetryTask(
        method: HttpMethod,
        url: string,
        options: RequestOptions & { retry?: RetryOptions },
        domain: string = 'default'
    ): RequestTask {
        const { retry, ...requestOptions } = options;
        const controller = new AbortController();
        const signal = requestOptions.signal || controller.signal;

        let retryCount = 0;
        let currentTask: RequestTask | null = null;
        let client = new HttpClient(domain);

        const execute = async (): Promise<FlowContext> => {
            while (true) {
                // 1. 发起请求并等待管道执行完毕（管道内部已捕获物理错误）
                currentTask = client.request(method, url, { ...requestOptions, signal });
                const context = await currentTask.context;

                // 2. 核心逻辑：判断是否需要重试
                // 如果 metadata.hasError 为 false，说明请求完全成功，直接返回
                if (!context.metadata.hasError) {
                    return context;
                }

                // 3. 检查重试条件 (基于 Context 内容)
                const canRetry =
                    retry &&
                    retryCount < retry.maxRetries &&
                    !context.metadata.isAborted && // 手动取消不重试
                    (retry.shouldRetry ? retry.shouldRetry(context) : true);

                if (canRetry) {
                    retryCount++;
                    if (retry.delay) {
                        await new Promise(resolve => setTimeout(resolve, retry.delay));
                    }
                    continue; // 重新发起循环
                }

                // 4. 不满足重试条件，返回这个带错的 context 供上层处理
                return context;
            }
        };

        return {
            context: execute(),
            cancel: (reason?: string) => {
                controller.abort(reason || 'user_cancelled');
                currentTask?.cancel(reason);
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
        method: HttpMethod,
        url: string,
        pollingOptions: PollingOptions,
        domain: string = 'default'
    ): void {
        // 解构轮询选项
        const {
            interval = 5000, // 默认轮询间隔 5 秒
            priority = 'NORMAL', // 默认优先级
            maxRetries = 3, // 默认最大重试次数
            retryDelay = 1000, // 默认重试延迟
            ...requestOptions // 其他请求选项
        } = pollingOptions;

        const client = new HttpClient(domain);

        // 将 HttpClient 的调用包装成 TaskQueue 需要的异步函数
        const taskFn = async () => {
            const task = client.request(method, url, requestOptions);
            const ctx = await task.context;

            // 如果 Context 标记了错误，抛出它以便 TaskQueue 触发重试逻辑
            if (ctx.metadata.hasError) {
                throw ctx;
            }
            // 正常情况，什么都不返回，即 Promise<void>
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
