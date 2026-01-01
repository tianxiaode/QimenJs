import { HttpRequest, HttpResponse } from '../core';
import { HttpTransport } from './HttpTransport';
import { HttpTransportFailure } from './HttpTransportFailure';
import { TransportFailureReason } from './types';

/**
 * 职责：
 * - 上传 / 下载进度
 * - 分片
 * 输出仍然是 HttpResponse或 HttpTransportFailure
 * 禁止：
 * ❌ 不碰 error parser
 * ❌ 不处理 chunk 逻辑（由上层控制）
 */
export class XhrTransport implements HttpTransport {
    /**
     * 补全核心方法：send
     */
    send(req: HttpRequest): Promise<HttpResponse | HttpTransportFailure> {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();
            const { timeout, responseType } = req.options;

            // 1. 初始化请求
            xhr.open(req.method, req.url, true);

            // 补全：正确映射 XHR 的 responseType
            // 注意：XHR 不支持 'stream'，只能由 FetchTransport 处理，这里映射为原生支持的类型
            if (responseType && responseType !== 'stream') {
                xhr.responseType = responseType;
            }

            if (timeout) {
                xhr.timeout = timeout;
            }

            // 2. 设置 Headers
            Object.entries(req.headers).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
            });

            // 3. 进度监听
            if (req.options.onProgress) {
                if (this.hasRequestBody(req)) {
                    xhr.upload.onprogress = e => req.options.onProgress?.(e);
                } else {
                    xhr.onprogress = e => req.options.onProgress?.(e);
                }
            }

            // 4. 响应处理
            xhr.onload = () => {
                resolve(
                    new HttpResponse({
                        status: xhr.status,
                        headers: this.parseResponseHeaders(xhr.getAllResponseHeaders()),
                        rawBody: xhr.response,
                    })
                );
            };

            // 5. 错误处理
            xhr.onerror = err => {
                resolve({
                    isTransportFailure: true,
                    reason: TransportFailureReason.NetworkError,
                    message: 'XHR network error or CORS restriction',
                    error: err,
                });
            };

            xhr.ontimeout = () => {
                resolve({
                    isTransportFailure: true,
                    reason: TransportFailureReason.Aborted,
                    message: 'XHR request timed out',
                });
            };

            // 6. 发送原始 Body
            xhr.send(req.body);
        });
    }

    /**
     * 补全：判断是否包含 Request Body
     * 逻辑：GET 和 HEAD 方法在协议上不携带 body
     */
    private hasRequestBody(req: HttpRequest): boolean {
        const method = req.method.toUpperCase();
        return !!req.body && method !== 'GET' && method !== 'HEAD';
    }

    /**
     * 解析 Header 字符串
     */
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
