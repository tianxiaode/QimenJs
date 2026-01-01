import { RawBody } from './types';

/**
 * 职责：
 * 描述 transport 返回的**原始响应**
 * * 必须包含：
 * status
 *  headers
 * rawBody（string | Blob | ReadableStream | null）
 * 关键原则：
 *  HttpResponse **不等于“成功响应”**
 * **禁止：**
 * ❌ 不抛异常
 * ❌ 不解析 json
 *  不判断 error
 */
export class HttpResponse {
    // 核心标识：这不是传输失败
    public readonly isTransportFailure = false as const;
    /**
     * HTTP 状态码 (如 200, 404, 500)
     */
    public readonly status: number;
    /**
     * 响应头映射
     */
    public readonly headers: Record<string, string>;

    /**
     * 未经解析的原始数据体
     */
    public readonly rawBody: RawBody;

    /**
     * 构造函数：仅用于数据填充
     */
    constructor(payload: { status: number; headers: Record<string, string>; rawBody: RawBody }) {
        this.status = payload.status;
        this.headers = payload.headers;
        this.rawBody = payload.rawBody;
    }
}
