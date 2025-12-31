import { HttpRequest, HttpResponse } from "../core/types";
import { HttpTransport } from "./HttpTransport";

export class FetchTransport implements HttpTransport {
    async send(req: HttpRequest): Promise<HttpResponse> {
        const res = await fetch(req.url, {
            method: req.method,
            headers: req.headers,
            body: req.body ? JSON.stringify(req.body) : undefined,
        });

        return {
            statusCode: res.status,
            headers: {}, // 简化处理，实际项目中应解析headers
            body: await res.text(), // 使用text()而不是json()，避免解析非JSON响应
            getBody() {
                return res.json().catch(() => res.text());
            },
            isJsonResponse() {
                const contentType = res.headers.get('content-type') || '';
                return contentType.includes('application/json');
            },
            isCustomBackendError() {
                // 根据实际后端错误判断逻辑实现
                return false;
            }
        };
    }
}