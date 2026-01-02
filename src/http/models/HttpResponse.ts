import { IHttpResponse, RawBody } from '../types';

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
export class HttpResponse implements IHttpResponse {
    public readonly isTransportFailure = false as const;
    public readonly status: number;
    public readonly headers: Record<string, string>;
    public readonly rawBody: RawBody;

    constructor(payload: { status: number; headers: Record<string, string>; rawBody: RawBody }) {
        this.status = payload.status;
        this.headers = payload.headers;
        this.rawBody = payload.rawBody;
    }

}
