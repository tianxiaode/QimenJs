import { HttpResponse } from '../models';
import {
    IHttpRequest,
    IHttpTransport,
    RawBody,
    RequestOptions,
    RequestResult,
    TransportFailureReason,
} from '../types';

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
export class FetchTransport implements IHttpTransport {
    async send(req: IHttpRequest): Promise<RequestResult> {
        // 1. 获取取消上下文 (包括合并后的信号和清理函数)
        const { signal, done } = this.createAbortContext(req.options);

        try {
            const response = await fetch(req.url, {
                method: req.method,
                headers: req.headers,
                body: this.hasPayload(req.method) ? this.serializeBody(req.body) : undefined,
                signal: signal, // 绑定统一的信号
                credentials: req.options.withCredentials ? 'include' : 'same-origin',
            });

            // 2. 提取响应体 (之前拆分的方法)
            const rawBody = await this.handleRawBody(response, req.options);

            return new HttpResponse({
                status: response.status,
                headers: this.extractHeaders(response.headers),
                rawBody: rawBody,
            });
        } catch (error: any) {
            return this.handleError(error, signal);
        } finally {
            // 3. 无论成功失败，必须清理定时器和监听器
            done();
        }
    }
    /**
     * 辅助：fetch 需要 headers 转换为普通对象
     */
    private extractHeaders(headers: Headers): Record<string, string> {
        const result: Record<string, string> = {};
        headers.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    /**
     * 辅助：判断是否是带载荷的方法
     */
    private hasPayload(method: string): boolean {
        return !['GET', 'HEAD'].includes(method.toUpperCase());
    }

    /**
     * 辅助：简单的 Body 预处理
     * 注意：Transport 层只做基础保证，复杂的序列化应由 Processor 完成
     */
    private serializeBody(body: any): any {
        if (body === null || body === undefined) return undefined;
        if (typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
            return JSON.stringify(body);
        }
        return body;
    }

    /**
     * 核心重构：根据响应头和配置动态提取 Body
     */
    private async handleRawBody(response: Response, options: RequestOptions): Promise<RawBody> {
        const contentType = response.headers.get('Content-Type') || '';

        // 动态判定是否应该作为流处理
        const isStream =
            options.stream === true ||
            contentType.includes('text/event-stream') ||
            contentType.includes('application/x-ndjson') ||
            contentType.includes('application/octet-stream');

        if (isStream) {
            // 注意：fetch 的 response.body 本身就是 ReadableStream
            return response.body;
        }

        // 根据用户预设的类型提取，否则默认返回 ArrayBuffer 以保持数据中立
        switch (options.responseType) {
            case 'blob':
                return await response.blob();
            case 'text':
                return await response.text();
            case 'arraybuffer':
            default:
                return await response.arrayBuffer();
        }
    }

    /**
     * 核心重构：取消逻辑拆分为独立方法
     * 职责：合并超时与外部信号，返回一个统一的可观测信号
     */
    private createAbortContext(options: RequestOptions) {
        const { timeout, signal: externalSignal } = options;
        const internalController = new AbortController();
        let timeoutId: any;

        // 处理超时：超时后触发内部取消
        if (timeout && timeout > 0) {
            timeoutId = setTimeout(() => {
                internalController.abort('timeout');
            }, timeout);
        }

        // 处理外部信号联动
        const onExternalAbort = () => {
            internalController.abort(externalSignal?.reason);
        };

        if (externalSignal) {
            if (externalSignal.aborted) {
                internalController.abort(externalSignal.reason);
            } else {
                externalSignal.addEventListener('abort', onExternalAbort);
            }
        }

        return {
            signal: internalController.signal,
            done: () => {
                if (timeoutId) clearTimeout(timeoutId);
                if (externalSignal) {
                    externalSignal.removeEventListener('abort', onExternalAbort);
                }
            },
        };
    }

    /**
     * 错误分类逻辑：也建议拆分出来，保持 send 纯净
     */
    private handleError(error: any, signal: AbortSignal): RequestResult {
        // 如果是信号触发的取消
        if (error.name === 'AbortError' || signal.aborted) {
            const isTimeout = signal.reason === 'timeout' || error === 'timeout';
            return {
                isTransportFailure: true,
                reason: TransportFailureReason.Aborted,
                message: isTimeout ? 'Request timeout' : 'Request cancelled by user',
                error,
            };
        }

        // 其他底层网络错误
        return {
            isTransportFailure: true,
            reason: TransportFailureReason.NetworkError,
            message: error.message || 'Network communication failure',
            error,
        };
    }
}
