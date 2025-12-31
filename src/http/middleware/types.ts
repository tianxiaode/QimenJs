// 定义HttpRequest接口
interface HttpRequest {
  withHeader(name: string, value: string): HttpRequest;
  withHeaders(headers: { [key: string]: string }): HttpRequest;
  url: string;
  body?: any;
}

export interface AuthProvider {
  apply(req: HttpRequest): Promise<HttpRequest> | HttpRequest
}