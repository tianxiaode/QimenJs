// 请求方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 请求头类型
export interface HttpHeaders {
  [key: string]: string;
}

// 请求体类型
export interface HttpBody {
  [key: string]: any;
}

// HttpResponse 类型定义
export interface HttpResponse {
  statusCode: number;
  headers: HttpHeaders;
  body: any;  // 可扩展为更细化的类型
  getBody(): any;
  isJsonResponse(): boolean;
  isCustomBackendError(): boolean;
}

// HttpRequest 类型定义
export interface HttpRequest {
  url: string;
  method: HttpMethod;
  headers: HttpHeaders;
  body?: HttpBody;
}

// 错误解析器接口定义
export interface ErrorParser {
  parse(response: HttpResponse): HttpError | null;
}

// 错误处理类定义
export class HttpError extends Erro {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
