import { HttpMethod, IHttpRequest, RequestOptions } from '../types';

/**
 * 职责：
 * 描述一个“已经标准化”的请求
 * 包含：
 * url
 * method
 * headers
 * body
 * options（timeout / responseType / chunk）
 * 禁止：
 * ❌ 不做序列化
 * ❌ 不拼接 token
 * ❌ 不关心 transport
 */
/**
 * HttpRequest
 * 职责：描述一个已经标准化的请求，仅作为数据载体。
 */
export class HttpRequest implements IHttpRequest {
    public readonly url: string;
    public readonly method: HttpMethod;
    public readonly headers: Record<string, string>;
    public readonly body: any;
    public readonly options: Readonly<RequestOptions>;

    constructor(payload: {
        url: string;
        method: HttpMethod;
        headers?: Record<string, string>;
        body?: any;
        // 这里改为 RequestOptions，因为 payload 需要包含 pathParams 等
        options?: RequestOptions;
    }) {
        this.url = payload.url;
        this.method = payload.method;
        this.headers = payload.headers ?? {};
        this.body = payload.body;

        // 对齐参数：确保 HttpOptions 的必填项有默认值，同时保留 RequestOptions 的扩展项
        this.options = {
            // 1. 默认的物理控制项
            timeout: payload.options?.timeout ?? 0,
            responseType: payload.options?.responseType ?? 'json',
            withCredentials: payload.options?.withCredentials ?? true,

            // 2. 业务处理项 (直接透传)
            pathParams: payload.options?.pathParams,
            queryParams: payload.options?.queryParams,
            onProgress: payload.options?.onProgress,
        };
    }
}
