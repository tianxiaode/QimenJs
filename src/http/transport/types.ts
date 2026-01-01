/**
 * 传输层失败的枚举原因
 */
export enum TransportFailureReason {
  NetworkError = 'NETWORK_ERROR',     // 断网、DNS 失败
  Aborted = 'ABORTED',               // 超时或主动取消
  SecurityError = 'SECURITY_ERROR',   // 跨域拦截、SSL 证书问题
  Unknown = 'UNKNOWN'
}
