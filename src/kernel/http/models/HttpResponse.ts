import { IHttpResponse, RawBody } from '../../types/http';

/**
 * 职责：
 * 描述 transport 返回的**原始响应**
 * * 必须包含：
 * status
 *  headers
 * rawBody（string | Blob | ReadableStream | null）
 * 关键原则：
 *  HttpResponse **不等于"成功响应"**
 * **禁止：**
 * ❌ 不抛异常
 * ❌ 不解析 json
 *  不判断 error
 */
export class HttpResponse implements IHttpResponse {
    /**
     * 指示是否传输失败，默认为false
     * 这个属性用于区分是网络传输失败还是业务逻辑错误
     */
    public readonly isTransportFailure = false as const;

    /**
     * HTTP响应状态码（如200、404等）
     */
    public readonly status: number;

    /**
     * 响应头对象，键值对形式存储响应头信息
     */
    public readonly headers: Record<string, string>;

    /**
     * 原始响应体数据，可以是字符串、Blob对象、可读流或null
     */
    public readonly rawBody: RawBody;

    /**
     * 构造一个HttpResponse实例
     * @param payload 包含响应信息的对象
     * @param payload.status HTTP响应状态码
     * @param payload.headers 响应头信息
     * @param payload.rawBody 原始响应体数据
     */
    constructor(payload: { status: number; headers: Record<string, string>; rawBody: RawBody }) {
        this.status = payload.status;
        this.headers = payload.headers;
        this.rawBody = payload.rawBody;
    }
}