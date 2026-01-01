export interface IHttpResponse {
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly rawBody: any;
  readonly isTransportFailure: false;
}

export interface IHttpTransportFailure {
  readonly error: any; // 这里的 error 可以是自定义的 HttpError 接口
  readonly message: string;
  readonly isTransportFailure: true;
}

// 统一响应类型
export type RequestResult = IHttpResponse | IHttpTransportFailure;