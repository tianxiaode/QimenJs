import { Middleware } from "../core/types";

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

  