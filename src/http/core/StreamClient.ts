import { IHeaderProcessor, IUrlProcessor, RequestOptions } from '../types';
import { prepareRequest } from './request-helper';

export class StreamClient {
    private urlProcessors: IUrlProcessor[];
    private headerProcessors: IHeaderProcessor[];
    private baseUrl: string;

    constructor(config: {
        baseUrl?: string;
        urlProcessors?: IUrlProcessor[];
        headerProcessors?: IHeaderProcessor[];
    }) {
        this.urlProcessors = config.urlProcessors || [];
        this.headerProcessors = config.headerProcessors || [];
        this.baseUrl = config.baseUrl || '';
    }

    /**
     * AI 流式请求专用方法
     * 采用 Async Generator 模式，外部可直接使用 for await 消费
     */
    public async *chatStream<T>(
        url: string,
        body: any,
        options: RequestOptions = {}
    ): AsyncIterable<T> {
        // 1. 调用公共预处理逻辑 (与 HttpClient 共享)
        const { finalUrl, finalHeaders, signal } = prepareRequest(
            this.baseUrl,
            url,
            'POST',
            options,
            this.urlProcessors,
            this.headerProcessors
        );

        // 2. 发起 Fetch 请求
        const response = await fetch(finalUrl, {
            method: 'POST',
            headers: finalHeaders,
            body: typeof body === 'string' ? body : JSON.stringify(body),
            signal,
        });

        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });

        // 3. 极简的响应校验：非 2xx 直接抛出上下文式的错误
        if (!response.ok) {
            // 这里我们依然手动包装一个类似 Context 的错误，方便上层统一处理
            throw {
                status: response.status,
                headers: headers,
                options,
                metadata: {
                    isTransportFailure: false,
                    isHttpSuccess: false,
                    error: 'Stream Status Error',
                },
            };
        }

        if (!response.body) {
            throw new Error('Response body is empty');
        }

        // 4. 流式迭代逻辑
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // 5. 这里的 Chunk 处理可以根据具体协议（如 OpenAI SSE）简单修剪
                const chunk = decoder.decode(value, { stream: true });

                // 简单示例：直接 Yield 原始字符串或尝试解析每一行
                // 实际生产中这里通常会有一个简单的 SSE Parser 逻辑
                yield chunk as unknown as T;
            }
        } finally {
            // 确保资源释放
            reader.releaseLock();
        }
    }
}
