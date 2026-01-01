import { HttpTransport, HttpRequest, HttpResponse } from './types';
import { HeaderProcessor, HttpResponseHandler, UrlProcessor } from '../processors';
import { HttpTransportFailure } from '../transport';

export class HttpClient {
    constructor(
        private config: {
            transport: HttpTransport;
            urlProcessors?: UrlProcessor[];
            headerProcessors?: HeaderProcessor[];
            responseHandlers?: HttpResponseHandler[];
        }
    ) {}

    async request(req: HttpRequest): Promise<HttpResponse | HttpTransportFailure> {
        // 1. 执行 URL 管道
        let finalUrl = req.url;
        for (const processor of this.config.urlProcessors ?? []) {
            finalUrl = processor(finalUrl, req.options.params);
        }

        // 2. 执行 Header 管道 (使用原生的 Headers 对象，方便修改)
        const headers = new Headers(req.headers);
        for (const processor of this.config.headerProcessors ?? []) {
            await processor(headers, req);
        }

        // 3. 构建发送对象并交给传输层
        const finalReq = new HttpRequest({
            ...req,
            url: finalUrl,
            headers: Object.fromEntries(headers.entries()),
        });

        const result = await this.config.transport.send(finalReq);

        // 4. 执行响应处理管道 (截断机制)
        for (const handler of this.config.responseHandlers ?? []) {
            const consumed = await handler(result, finalReq);
            if (consumed === true) break;
        }

        return result;
    }

    async request(req: HttpRequest): Promise<HttpResponse | HttpTransportFailure> {
        // 1. 准备阶段 (URL & Headers)
        const finalUrl = this.runUrlProcessors(req.url, req.options.params);
        const headers = new Headers(req.headers);
        await this.runHeaderProcessors(headers, req);

        const preparedReq = new HttpRequest({
            ...req,
            url: finalUrl,
            headers: Object.fromEntries(headers.entries()),
        });

        // 2. 带有重试策略的执行阶段
        const result = await this.executeWithRetry(preparedReq);

        // 3. 响应处理阶段 (注意：处理的是重试完之后的最终结果)
        await this.runResponseHandlers(result, preparedReq);

        return result;
    }

    private async executeWithRetry(req: HttpRequest): Promise<HttpResponse | HttpTransportFailure> {
        const policy = req.options.retryPolicy ?? DefaultRetryPolicy;
        let lastResult: HttpResponse | HttpTransportFailure;

        for (let attempt = 0; attempt <= policy.retries; attempt++) {
            lastResult = await this.config.transport.send(req);

            // 如果成功了，直接返回
            if (!lastResult.isTransportFailure && lastResult.status < 400) {
                return lastResult;
            }

            // 如果失败了，判断是否需要重试
            // 注意：这里需要将 HttpTransportFailure 或 HttpResponse 包装成你定义的 HttpError 传给 policy
            const errorContext = this.wrapToHttpError(lastResult);

            if (attempt < policy.retries && policy.shouldRetry(errorContext)) {
                const waitTime = policy.delay(attempt + 1);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            break; // 不再重试，跳出循环返回最后一次结果
        }

        return lastResult!;
    }

async get<T = any>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
    const result = await this.request(new HttpRequest({
      url,
      method: 'GET',
      options: { ...options, params }
    }));
    return this.unwrap<T>(result);
  }

  /**
   * POST 请求专用糖
   */
  async post<T = any>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    const result = await this.request(new HttpRequest({
      url,
      method: 'POST',
      body,
      options
    }));
    return this.unwrap<T>(result);
  }

  // PUT, DELETE 同理...

  /**
   * 一个私有的辅助方法：用于把结果“拆包”成业务数据或抛出错误
   * 这符合大多数人的使用习惯：成功拿数据，失败进 catch
   */
  private unwrap<T>(result: HttpResponse | HttpTransportFailure): T {
    if (result.isTransportFailure) {
      throw result.error; // 或者是你定义的 HttpError
    }
    // 这里可以根据你的业务逻辑决定是返回 result.data 还是整个 HttpResponse
    return result.rawBody as unknown as T;
  }    
}
