import { HttpError } from './HttpError';


/**
 * 职责：、
 * - 只描述：
 * - 是否重试
 * - 重试间隔
 * - 最大次数
 * 禁止：
 * ❌ 不关心错误类型细节
 * ❌ 不关心 transport
 * ❌ 不直接 sleep
 */
export interface RetryPolicy {
    retries: number;
    delay(attempt: number): number;
    shouldRetry(error: HttpError): boolean;
}

export const DefaultRetryPolicy: RetryPolicy = {
    retries: 3,
    delay: attempt => attempt * 500,
    shouldRetry: err => err.retryable === true || (err.status !== undefined && err.status >= 500),
};
