
export type RawBody = string | Blob | ReadableStream | ArrayBuffer | any | null;

export interface IHttpResponse {
    readonly status: number;
    readonly headers: Record<string, string>;
    readonly rawBody: RawBody; // 统一类型
    readonly isTransportFailure: false;
}

export enum TransportFailureReason {
  NetworkError = 'NETWORK_ERROR',     // 断网、DNS 失败
  Aborted = 'ABORTED',               // 超时或主动取消
  SecurityError = 'SECURITY_ERROR',   // 跨域拦截、SSL 证书问题
  Unknown = 'UNKNOWN'
}

export interface IHttpTransportFailure {
    readonly error: any;
    readonly message: string;
    readonly isTransportFailure: true;
    readonly reason: string;
}

export type RequestResult = IHttpResponse | IHttpTransportFailure;

