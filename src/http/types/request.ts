import { RetryPolicy } from './retry';

// 基础配置
export interface HttpOptions {
  timeout: number;
  responseType: 'json' | 'blob' | 'text' | 'arraybuffer';
  onProgress?: (ev: ProgressEvent) => void;
  withCredentials?: boolean;
}

// 扩展配置
export interface RequestOptions extends Partial<HttpOptions> {
  params?: Record<string, any>;
  retryPolicy?: RetryPolicy | null;
}

// 核心请求接口：被 HttpClient 和 Transport 共同依赖
export interface IHttpRequest {
  readonly url: string;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly body?: any;
  readonly options: RequestOptions;
}