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
 * HTTP 工厂类，提供创建 HTTP 客户端和相关工具的静态方法
 * 作为 HTTP 功能的统一入口，封装了高级功能如重试、轮询等
 *
 * 主要职责：
 * 1. 创建具有自动重试机制的 HTTP 请求任务
 * 2. 创建周期性轮询任务并管理其生命周期
 * 3. 统一处理 HTTP 请求的高级功能配置
 * 4. 与全局任务队列集成，实现任务的调度和管理
 *
 * 设计特点：
 * - 静态方法为主，无需实例化即可使用
 * - 与 HttpClient 协同工作，扩展其基础功能
 * - 支持域名隔离，可为不同域创建独立的 HTTP 客户端
 * - 提供灵活的配置选项，满足不同场景的请求需求
 */
export class HttpFactory {
    /**
     * 创建具有自动重试功能的 HTTP 请求任务
     *
     * 此方法将普通的 HTTP 请求包装成一个支持自动重试的任务。
     * 当请求失败时，会根据配置的重试策略自动重新发起请求，
     * 直到成功或达到最大重试次数为止。
     *
     * 重试逻辑详解：
     * 1. 请求成功 (hasError = false): 立即返回结果
     * 2. 请求失败: 检查重试条件
     *    - 是否配置了重试选项
     *    - 是否未达到最大重试次数
     *    - 是否不是手动取消的请求
     *    - 自定义重试判断函数是否允许重试
     * 3. 满足条件则等待指定延迟后重新请求
     * 4. 不满足条件则返回最终结果（可能包含错误）
     *
     * 使用场景：
     * - 网络不稳定环境下的关键请求
     * - 对可靠性要求高的数据同步操作
     * - 可能出现临时性故障的服务调用
     *
     * @param method - HTTP 请求方法 (GET, POST, PUT, DELETE 等)
     * @param url - 请求的目标 URL，可以是相对路径或完整地址
     * @param options - 请求选项，包含标准请求配置和可选的重试配置
     * @param domain - 请求所属的域，默认为 'default'，用于多域管理
     * @returns 返回一个 RequestTask 对象，包含：
     *          - context: Promise<FlowContext>，解析请求结果
     *          - cancel: 取消请求的方法
     *
     * @example
     * const task = HttpFactory.createRetryTask(
     *   'GET',
     *   '/api/data',
     *   {
     *     retry: {
     *       maxRetries: 3,
     *       delay: 1000,
     *       shouldRetry: (context) => context.response?.status === 503
     *     }
     *   }
     * );
     *
     * try {
     *   const result = await task.context;
     *   console.log('请求成功:', result);
     * } catch (error) {
     *   console.error('请求最终失败:', error);
     * }
     *
     * // 可随时取消请求
     * // task.cancel('用户取消');
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
     * 创建并调度一个周期性轮询任务
     *
     * 此方法创建一个按指定间隔周期性执行的 HTTP 请求任务，
     * 并将其添加到全局任务队列中进行管理。轮询任务会持续
     * 按照设定的时间间隔发起请求，直到被显式移除或发生不可恢复的错误。
     *
     * 轮询机制特点：
     * - 基于时间间隔的周期性执行
     * - 集成任务队列的优先级管理
     * - 支持失败重试机制
     * - 可通过任务队列API进行统一监控和控制
     *
     * 执行流程：
     * 1. 创建 HttpClient 实例用于发送请求
     * 2. 包装请求逻辑为异步函数 taskFn
     * 3. 成功时正常结束本次执行，等待下一次轮询
     * 4. 失败时抛出上下文，触发任务队列的重试机制
     * 5. 达到最大重试次数后，任务可能会被暂停或移除
     *
     * 典型应用场景：
     * - 实时数据更新（如股票行情、监控指标）
     * - 状态轮询（如订单状态、任务进度）
     * - 心跳检测和保活机制
     * - 定期同步服务端数据
     *
     * @param method - HTTP 请求方法
     * @param url - 轮询的目标 URL
     * @param pollingOptions - 轮询配置选项，包含：
     *   - interval: 轮询时间间隔（毫秒），默认 5000ms
     *   - priority: 任务优先级，默认 'NORMAL'
     *   - maxRetries: 单次请求失败后的最大重试次数，默认 3
     *   - retryDelay: 重试延迟时间（毫秒），默认 1000ms
     *   - 其他所有 RequestOptions 支持的选项
     * @param domain - 请求域，默认为 'default'
     *
     * @returns void
     *
     * @example
     * HttpFactory.schedulePolling(
     *   'GET',
     *   '/api/realtime-data',
     *   {
     *     interval: 3000,        // 每3秒轮询一次
     *     priority: 'HIGH',      // 高优先级
     *     maxRetries: 2,         // 失败后最多重试2次
     *     headers: {             // 自定义请求头
     *       'X-Auth-Token': token
     *     }
     *   },
     *   'data-service'
     * );
     *
     * // 后续可通过 globalTaskQueue 控制轮询任务
     * // 如：globalTaskQueue.pause()/resume() 等
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
