import { RetryPolicy } from '../types';

export const DefaultRetryPolicy: RetryPolicy = {
    retries: 3,
    delay: attempt => attempt * 500,
    shouldRetry: err => err.retryable === true || (err.status !== undefined && err.status >= 500),
}
