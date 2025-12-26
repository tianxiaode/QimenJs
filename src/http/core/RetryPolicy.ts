import { HttpError } from "./HttpError";

export interface RetryPolicy {
    retries: number;
    delay(attempt: number): number;
    shouldRetry(error: HttpError): boolean;
}


export const DefaultRetryPolicy: RetryPolicy = {
    retries: 3,
    delay: attempt => attempt * 500,
    shouldRetry: err =>
        err.retryable === true ||
        (err.status !== undefined && err.status >= 500),
};
