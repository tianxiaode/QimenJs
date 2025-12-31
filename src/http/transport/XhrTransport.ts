import { HttpRequest, HttpResponse } from "../core/types";
import { HttpTransport } from "./HttpTransport";

// 扩展HttpRequest接口以支持进度事件
interface ExtendedHttpRequest extends HttpRequest {
  onProgress?: (progressEvent: ProgressEvent) => void;
}

export class XhrTransport implements HttpTransport {
    async send(req: ExtendedHttpRequest): Promise<HttpResponse> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(req.method, req.url);

            Object.entries(req.headers || {}).forEach(([k, v]) =>
                xhr.setRequestHeader(k, v as string)
            );

            if (req.onProgress) {
                xhr.upload.onprogress = req.onProgress;
            }

            xhr.onload = () => {
                resolve({
                    statusCode: xhr.status,
                    headers: {}, // 这里可以解析响应头
                    body: xhr.responseText,
                    getBody() {
                        try {
                            return JSON.parse(xhr.responseText);
                        } catch {
                            return xhr.responseText;
                        }
                    },
                    isJsonResponse() {
                        const contentType = xhr.getResponseHeader('content-type') || '';
                        return contentType.includes('application/json');
                    },
                    isCustomBackendError() {
                        // 根据实际后端错误判断逻辑实现
                        return false;
                    }
                });
            };

            xhr.onerror = () => reject(new Error('Network error'));
            
            // 处理请求体，将其转换为合适的格式
            let body: Document | BodyInit | null = null;
            if (req.body) {
                if (typeof req.body === 'string') {
                    body = req.body;
                } else if (req.body instanceof Blob || req.body instanceof ArrayBuffer) {
                    body = req.body;
                } else {
                    body = JSON.stringify(req.body);
                }
            }
            
            xhr.send(body);
        });
    }
}