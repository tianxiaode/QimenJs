/**
 * HttpFactory 类
 *
 * HTTP 工厂类，提供创建 HTTP 客户端和相关工具的静态方法
 * 作为 HTTP 功能的统一入口，封装了高级功能如重试、轮询等
 */
import type { RequestContext } from '@orbitjs/context';
import type { HttpMethod } from './types/http-context';
import { type SimpleRequestOptions } from './HttpClient';
/**
 * 重试选项
 */
export interface RetryOptions {
    /**
     * 最大重试次数
     */
    maxRetries: number;
    /**
     * 重试延迟（毫秒）
     */
    delay?: number;
    /**
     * 自定义重试判断函数
     */
    shouldRetry?: (context: RequestContext) => boolean;
}
/**
 * 轮询选项
 */
export interface PollingOptions extends SimpleRequestOptions {
    /**
     * 轮询间隔（毫秒）
     */
    interval?: number;
    /**
     * 任务优先级
     */
    priority?: 'HIGH' | 'NORMAL' | 'LOW';
    /**
     * 最大重试次数
     */
    maxRetries?: number;
    /**
     * 重试延迟（毫秒）
     */
    retryDelay?: number;
}
/**
 * 请求任务（带重试）
 */
export interface RetryRequestTask {
    /**
     * 请求上下文（Promise）
     */
    context: Promise<RequestContext>;
    /**
     * 取消请求的方法
     */
    cancel: (reason?: string) => void;
}
/**
 * HttpFactory 类
 */
export declare class HttpFactory {
    /**
     * 创建具有自动重试功能的 HTTP 请求任务
     *
     * @param method - HTTP 请求方法
     * @param url - 请求 URL
     * @param options - 请求选项（包含重试配置）
     * @param domain - 域名
     * @returns 请求任务
     */
    static createRetryTask(method: HttpMethod, url: string, options?: SimpleRequestOptions & {
        retry?: RetryOptions;
    }, domain?: string): RetryRequestTask;
    /**
     * 创建周期性轮询任务
     *
     * @param method - HTTP 请求方法
     * @param url - 请求 URL
     * @param pollingOptions - 轮询选项
     * @param domain - 域名
     * @param callback - 轮询回调函数
     * @returns 停止轮询的函数
     */
    static createPolling(method: HttpMethod, url: string, pollingOptions?: PollingOptions, domain?: string, callback?: (context: RequestContext) => void): () => void;
}
//# sourceMappingURL=factory.d.ts.map