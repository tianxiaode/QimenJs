export interface AuthProvider {
  apply(req: HttpRequest): Promise<HttpRequest> | HttpRequest
}