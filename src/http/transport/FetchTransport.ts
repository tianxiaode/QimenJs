import { HttpRequest, HttpResponse, HttpResponseType, RawBody } from '../core';
import { HttpTransport } from './HttpTransport';
import { HttpTransportFailure } from './HttpTransportFailure';
import { TransportFailureReason } from './types';

/**
 * 职责：
 * fetch 的最薄封装
 * 负责：
 * - fetch
 * - abort
 * - 把 Response 转成 HttpResponse
 * 禁止
 * ❌ 不 parse json
 * ❌ 不处理 code
 * ❌ 不判断成功失败
 */
export class FetchTransport implements HttpTransport {
    async send(req: HttpRequest): Promise<HttpResponse | HttpTransportFailure> {
        const controller = new AbortController();
        const { timeout, chunk } = req.options;

        // 处理超时逻辑
        let timeoutId: any;
        if (timeout > 0) {
            timeoutId = setTimeout(() => controller.abort(), timeout);
        }

        try {
            const response = await fetch(req.url, {
                method: req.method,
                headers: req.headers,
                body: this.isPayloadMethod(req.method) ? req.body : undefined,
                signal: controller.signal,
            });

            // 清除超时定时器
            if (timeoutId) clearTimeout(timeoutId);

            // 职责：最薄封装，直接转换，不解析内容，不判断状态码
            return new HttpResponse({
                status: response.status,
                headers: this.copyHeaders(response.headers),
                rawBody: chunk
                    ? response.body
                    : await this.getRawBody(response, req.options.responseType),
            });
        } catch (error: any) {
            if (timeoutId) clearTimeout(timeoutId);

            // 判断：是主动取消/超时，还是底层网络错误
            if (error.name === 'AbortError') {
                return {
                    isTransportFailure: true,
                    reason: TransportFailureReason.Aborted,
                    message: 'Request was aborted or timed out',
                    error,
                };
            }

            // 浏览器环境下，TypeError: Failed to fetch 通常涵盖了：
            // 1. 网络断开 (DNS/Offline)
            // 2. 跨域被拦截 (CORS)
            // 3. 证书错误 (SSL)
            return {
                isTransportFailure: true,
                reason: TransportFailureReason.NetworkError,
                message: error.message || 'Network failure or CORS restriction',
                error,
            };
        }
    }

    /**
     * 辅助：处理不同类型的原始 Body 提取
     */
    private async getRawBody(res: Response, type: HttpResponseType): Promise<RawBody> {
        try {
            if (type === 'blob') return await res.blob();
            if (type === 'arraybuffer') return await res.arrayBuffer();
            if (type === 'stream') return res.body;
            return await res.text(); // 默认按文本读取，但不解析 JSON
        } catch {
            return null;
        }
    }

    private copyHeaders(headers: Headers): Record<string, string> {
        const obj: Record<string, string> = {};
        headers.forEach((v, k) => {
            obj[k] = v;
        });
        return obj;
    }

    private isPayloadMethod(method: string): boolean {
        return !['GET', 'HEAD'].includes(method.toUpperCase());
    }
}
