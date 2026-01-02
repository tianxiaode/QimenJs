import { HttpResponse } from '../models';
import {
    IHttpRequest,
    IHttpTransport,
    RequestOptions,
    RequestResult,
    TransportFailureReason,
} from '../types';

/**
 * 职责：
 * - 上传 / 下载进度
 * - 分片
 * 输出仍然是 HttpResponse或 HttpTransportFailure
 * 禁止：
 * ❌ 不碰 error parser
 * ❌ 不处理 chunk 逻辑（由上层控制）
 */
export class XhrTransport implements IHttpTransport {
    async send(req: IHttpRequest): Promise<RequestResult> {
        const { signal, done } = this.createAbortContext(req.options);

        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();
            xhr.open(req.method, req.url, true);

            // 1. 纯上传场景，响应通常很小，直接按 text 或 json 处理即可
            xhr.responseType = 'text';

            // 2. 绑定取消信号
            const onAbort = () => xhr.abort();
            signal.addEventListener('abort', onAbort);

            // 3. 设置 Headers
            Object.entries(req.headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

            // 4. 核心：只处理上传进度
            if (req.options.onProgress) {
                xhr.upload.onprogress = req.options.onProgress;
            }

            // 5. 极简响应处理
            xhr.onload = () => {
                resolve(
                    new HttpResponse({
                        status: xhr.status,
                        headers: this.parseResponseHeaders(xhr.getAllResponseHeaders()),
                        rawBody: xhr.response, // 直接返回字符串，后续由处理器 JSON.parse
                    })
                );
            };

            // 6. 错误处理 (复用 FetchTransport 的归因逻辑)
            xhr.onerror = err =>
                resolve(this.createError(TransportFailureReason.NetworkError, err));
            xhr.onabort = () =>
                resolve(this.createError(TransportFailureReason.Aborted, signal.reason));

            // 7. 资源清理与发送
            const finalize = (res: RequestResult) => {
                done();
                signal.removeEventListener('abort', onAbort);
                resolve(res);
            };

            xhr.send(req.body);
        });
    }

    // 辅助方法：生成统一错误格式
    private createError(reason: TransportFailureReason, err?: any): RequestResult {
        return { isTransportFailure: true, reason, message: 'Upload failed', error: err };
    }
    /**
     * 实现断点续传：
     * 业务层调用 cancel() -> 这里触发 xhr.abort()
     * 业务层再次调用 upload -> 这里 new XHR() 从新偏移量开始 send(blob.slice(offset))
     */

    private createAbortContext(options: RequestOptions) {
        const { timeout, signal: externalSignal } = options;
        const internalController = new AbortController();
        let timeoutId: any;

        if (timeout && timeout > 0) {
            timeoutId = setTimeout(() => internalController.abort('timeout'), timeout);
        }

        const onExternalAbort = () => internalController.abort(externalSignal?.reason);
        if (externalSignal) {
            externalSignal.addEventListener('abort', onExternalAbort);
        }

        return {
            signal: internalController.signal,
            done: () => {
                if (timeoutId) clearTimeout(timeoutId);
                if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
            },
        };
    }

    private hasRequestBody(req: IHttpRequest): boolean {
        const method = req.method.toUpperCase();
        return !!req.body && !['GET', 'HEAD'].includes(method);
    }

    private parseResponseHeaders(headerStr: string): Record<string, string> {
        const headers: Record<string, string> = {};
        if (!headerStr) return headers;
        headerStr
            .trim()
            .split(/[\r\n]+/)
            .forEach(line => {
                const parts = line.split(': ');
                const key = parts.shift()?.toLowerCase();
                const value = parts.join(': ');
                if (key) headers[key] = value;
            });
        return headers;
    }
}
