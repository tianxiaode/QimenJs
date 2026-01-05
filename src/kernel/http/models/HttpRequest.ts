import { HttpMethod, IHttpRequest, RequestOptions } from '../../types/http';

/**
 * 职责：
 * 描述一个"已经标准化"的请求
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
    /**
     * 请求的完整URL
     */
    public readonly url: string;

    /**
     * HTTP请求方法（GET, POST, PUT, DELETE等）
     */
    public readonly method: HttpMethod;

    /**
     * 请求头对象，键值对形式存储请求头信息
     */
    public readonly headers: Record<string, string>;

    /**
     * 请求体数据，可以是任意类型
     */
    public readonly body: any;

    /**
     * 请求选项配置，包含超时、响应类型等设置
     */
    public readonly options: Readonly<RequestOptions>;

    /**
     * 构造一个HttpRequest实例
     * @param payload 包含请求信息的对象
     * @param payload.url 请求的URL地址
     * @param payload.method HTTP请求方法
     * @param payload.headers 请求头信息
     * @param payload.body 请求体数据
     * @param payload.options 请求选项配置
     */
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