import { HttpResponseContext } from "./processors";

/**
 * 重试配置接口
 * 定义了请求重试的相关配置选项
 */
export interface RetryOptions {
    /**
     * 最大重试次数
     */
    maxRetries: number;       
    /**
     * 重试延迟时间（毫秒），默认情况下使用固定延迟
     */
    delay?: number;           
    /**
     * 判断函数：由外部决定什么样的响应上下文需要重试
     * 例如：context.status === -1 (网络丢包) 或 context.status === 429 (限流)
     * @param context - HTTP 响应上下文
     * @returns 是否需要重试
     */
    shouldRetry: (context: HttpResponseContext) => boolean;
}