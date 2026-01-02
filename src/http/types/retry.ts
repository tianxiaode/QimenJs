import { HttpResponseContext } from "./processors";

/**
 * 重试配置接口
 */
export interface RetryOptions {
    maxRetries: number;       // 最大重试次数
    delay?: number;           // 重试延迟（毫秒）
    // 判断函数：由外部决定什么样的 context 需要重试
    // 例如：context.status === -1 (网络丢包) 或 context.status === 429 (限流)
    shouldRetry: (context: HttpResponseContext) => boolean;
}