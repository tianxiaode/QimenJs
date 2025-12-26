import { HttpTransport } from "../transport/HttpTransport";
import { HttpError } from "./HttpError";
import { RetryPolicy } from "./RetryPolicy";
import { BackendAdapter, HttpRequest, Middleware } from "./types";

export class HttpClient {
    constructor(
        private transport: HttpTransport,
        private adapter: BackendAdapter,
        private retry: RetryPolicy,
        private middlewares: Middleware[] = []
    ) {}

    async request<T>(req: HttpRequest): Promise<T> {
        let attempt = 0;

        while (true) {
            try {
                const raw = await this.transport.request(req);

                if (!this.adapter.isSuccess(raw.body)) {
                    const errInfo = this.adapter.extractError(raw.body);
                    throw new HttpError('code',errInfo.message, {
                        code: errInfo.code,
                        status: raw.status,
                        detail: errInfo.detail,
                    });
                }

                return this.adapter.extractData(raw.body);
            } catch (e) {
                const err = e instanceof HttpError ? e : new HttpError('ddd',String(e));

                if (
                    attempt < this.retry.retries &&
                    this.retry.shouldRetry(err)
                ) {
                    attempt++;
                    await new Promise(r =>
                        setTimeout(r, this.retry.delay(attempt))
                    );
                    continue;
                }

                throw err;
            }
        }
    }

    get<T>(url: string, config?: Partial<HttpRequest>) {
        return this.request<T>({ ...config, method: 'GET', url } as any);
    }

    post<T>(url: string, body?: any, config?: Partial<HttpRequest>) {
        return this.request<T>({
            ...config,
            method: 'POST',
            url,
            body,
        } as any);
    }

    upload<T>(
        url: string,
        body: FormData,
        onProgress?: (e: ProgressEvent) => void
    ) {
        return this.request<T>({
            method: 'POST',
            url,
            body,
            onProgress,
        } as any);
    }
}
