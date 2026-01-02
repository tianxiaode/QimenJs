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
 * FetchTransport 类
 * 
 * 职责：
 * - 封装浏览器原生 fetch API 的调用
 * - 提供统一的请求处理接口
 * - 处理请求取消逻辑（超时和外部信号）
 * - 将原生 Response 转换为 HttpResponse 对象
 * 
 * 负责：
 * - 发起网络请求
 * - abort 请求
 * - 将 Response 转换为 HttpResponse
 * 
 * 禁止
 * ❌ 不解析 json
 * ❌ 不处理业务状态码
 * ❌ 不判断请求成功或失败
 */
export class FetchTransport implements IHttpTransport {
    /**
     * 发送 HTTP 请求
     * 
     * @param req - HTTP 请求对象
     * @returns Promise<RequestResult> - 请求结果，可能是 HttpResponse 或错误
     */
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
     * 提取响应头
     * 
     * 将原生 Headers 对象转换为普通对象
     * 
     * @param headers - 原生 Headers 对象
     * @returns Record<string, string> - 普通对象格式的 headers
     */
    private extractHeaders(headers: Headers): Record<string, string> {
        const result: Record<string, string> = {};
        headers.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    /**
     * 判断请求方法是否携带载荷
     * 
     * GET 和 HEAD 方法不携带请求体
     * 
     * @param method - HTTP 方法
     * @returns boolean - 是否携带载荷
     */
    private hasPayload(method: string): boolean {
        return !['GET', 'HEAD'].includes(method.toUpperCase());
    }

    /**
     * 序列化请求体
     * 
     * 注意：Transport 层只做基础保证，复杂的序列化应由 Processor 完成
     * 
     * @param body - 原始请求体
     * @returns any - 序列化后的请求体
     */
    private serializeBody(body: any): any {
        if (body === null || body === undefined) return undefined;
        if (typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
            return JSON.stringify(body);
        }
        return body;
    }

    /**
     * 根据响应头和配置动态提取响应体
     * 
     * @param response - 原生 Response 对象
     * @param options - 请求选项
     * @returns Promise<RawBody> - 响应体
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
     * 创建取消上下文
     * 
     * 合并超时与外部信号，返回一个统一的可观测信号
     * 
     * @param options - 请求选项
     * @returns 包含信号和清理函数的对象
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
     * 处理请求错误
     * 
     * 根据错误类型返回不同的 TransportFailure 对象
     * 
     * @param error - 原始错误对象
     * @param signal - 中断信号
     * @returns RequestResult - 错误结果对象
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