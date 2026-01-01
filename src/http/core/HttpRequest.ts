import { HttpMethod, HttpOptions } from "./types";

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
export class HttpRequest {
  public readonly url: string;
  public readonly method: HttpMethod;
  public readonly headers: Record<string, string>;
  public readonly body: any; // 不做序列化，保持原始形态
  public readonly options: Readonly<HttpOptions>;

  constructor(payload: {
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: any;
    options?: Partial<HttpOptions>;
  }) {
    this.url = payload.url;
    this.method = payload.method;
    this.headers = payload.headers ?? {};
    this.body = payload.body;
    
    // 设置默认选项
    this.options = {
      timeout: payload.options?.timeout ?? 0,
      responseType: payload.options?.responseType ?? 'json',
      chunk: payload.options?.chunk ?? false,
    };
  }
}