import { IHeaderProcessor, IUrlProcessor, RequestOptions } from '../../types/http';
import { prepareRequest } from './request-helper';

/**
 * StreamClient 类
 * 专门用于处理流式数据请求，特别是 AI 相关的流式 API
 * 使用 Async Generator 模式，支持 for await 消费
 */
export class StreamClient {
    // URL 处理流水线，用于处理请求 URL
    private urlProcessors: IUrlProcessor[];
    
    // Header 处理流水线，用于处理请求头
    private headerProcessors: IHeaderProcessor[];
    
    // 基础 URL，用于拼接请求 URL
    private baseUrl: string;

    /**
     * 构造函数 - 初始化 StreamClient 实例
     * @param config 配置对象，包含基础 URL 和处理器
     */
    constructor(config: {
        baseUrl?: string;
        urlProcessors?: IUrlProcessor[];
        headerProcessors?: IHeaderProcessor[];
    }) {
        // 初始化处理器流水线和基础 URL
        this.urlProcessors = config.urlProcessors || [];
        this.headerProcessors = config.headerProcessors || [];
        this.baseUrl = config.baseUrl || '';
    }

    /**
     * AI 流式请求专用方法
     * 采用 Async Generator 模式，外部可直接使用 for await 消费
     * 
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns 异步可迭代对象，可以使用 for await 消费
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

        // 3. 将 Headers 对象转换为普通对象，方便后续处理
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });

        // 4. 极简的响应校验：非 2xx 直接抛出上下文式的错误
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

        // 5. 检查响应体是否存在
        if (!response.body) {
            throw new Error('Response body is empty');
        }

        // 6. 初始化流读取器和文本解码器
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            // 7. 循环读取流数据，直到流结束
            while (true) {
                // 读取下一个数据块
                const { done, value } = await reader.read();
                
                // 如果流已结束，跳出循环
                if (done) break;

                // 解码数据块为字符串
                const chunk = decoder.decode(value, { stream: true });

                // 8. 生成处理后的数据块，外部可以使用 for await 消费
                // 这里通常会有一个简单的 SSE Parser 逻辑，根据具体协议处理
                yield chunk as unknown as T;
            }
        } finally {
            // 9. 确保资源释放，解锁读取器
            reader.releaseLock();
        }
    }
}