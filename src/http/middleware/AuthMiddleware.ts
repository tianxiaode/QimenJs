import { Middleware } from "../core/types";

// 定义AuthProvider接口
interface AuthProvider {
  apply(req: HttpRequest): HttpRequest | Promise<HttpRequest>;
}

// 定义HttpRequest接口
interface HttpRequest {
  withHeader(name: string, value: string): HttpRequest;
  withHeaders(headers: { [key: string]: string }): HttpRequest;
  url: string;
  body?: any;
}

export class AuthMiddleware implements HttpMiddleware {
  constructor(private provider: AuthProvider) {}

  async handle(req, next) {
    const authedReq = await this.provider.apply(req)
    return next(authedReq)
  }
}

class JwtAuthProvider implements AuthProvider {
  apply(req: HttpRequest) {
    return req.withHeader(
      'Authorization',
      `Bearer ${getToken()}`
    )
  }
}

class SignatureAuthProvider implements AuthProvider {
  apply(req: HttpRequest) {
    const signature = sign(req.url, req.body)
    return req.withHeaders({
      'X-App-Id': APP_ID,
      'X-Signature': signature,
    })
  }
}

// 定义APP_ID常量
const APP_ID = process.env.APP_ID || 'default-app-id';

// 定义辅助函数
function getToken(): string {
  // 实现获取token的逻辑
  return localStorage.getItem('token') || '';
}

function sign(url: string, body: any): string {
  // 实现签名逻辑
  return `signature-${url}-${Date.now()}`;
}