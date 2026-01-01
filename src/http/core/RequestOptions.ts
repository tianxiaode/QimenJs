import { RetryPolicy } from '../types/retry';

export interface RequestOptions extends HttpOptions {
  /** * 重试策略
   * 如果不传，HttpClient 可以使用之前定义的 DefaultRetryPolicy
   * 如果传 null，则表示本次请求禁止重试
   */
  retryPolicy?: RetryPolicy | null;

  /** * 查询参数（URL 拼接用）
   * 放在这里方便 UrlProcessor 统一处理
   */
  params?: Record<string, any>;

  /** * 是否允许自动分发 Transport
   * 虽然我们有 upload 糖，但在核心 request 里也可以通过这个标记来强制选择
   */
  useXhr?: boolean;
  
  /**
   * 这里的 HttpOptions 属性已经通过 extends 包含进来了：
   * - timeout
   * - onProgress
   * - responseType
   * - withCredentials
   */
}