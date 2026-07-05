/**
 * StreamClient 类
 *
 * 专门用于处理流式数据请求（如 SSE、AI 流式 API）
 * - 使用 Async Generator 模式，支持 for await 消费
 * - 基于 RequestContextBuilder 构建上下文
 * - 通过 HttpExecutor 执行 prepare 管道后，直接消费 ReadableStream
 *
 * @module http/StreamClient
 */

import { RequestContextBuilder, type RequestContext } from '@qimenjs/context';
import { HttpExecutor } from './HttpExecutor';
import type { HttpMethod } from './types/http-context';

/**
 * 流式请求选项
 */
export interface StreamRequestOptions {
    /**
     * 请求头
     */
    headers?: Record<string, string>;

    /**
     * 查询参数
     */
    queryParams?: Record<string, any>;
}

/**
 * 流式请求任务
 */
export interface StreamTask<T = any> {
    /**
     * 异步生成器，用于 for await 消费
     */
    stream: AsyncIterableIterator<T>;

    /**
     * 取消流式请求
     */
    cancel: (reason?: string) => void;

    /**
     * 请求上下文
     */
    context: RequestContext;
}

/**
 * StreamClient 类
 *
 * 专门用于处理流式数据请求，特别是 AI 相关的流式 API
 * 使用 Async Generator 模式，支持 for await 消费
 */
export class StreamClient {
    private domain: string;
    private executor: HttpExecutor;

    /**
     * 构造函数
     *
     * @param domain - 域名，默认为 'default'
     */
    constructor(domain: string = 'default') {
        this.domain = domain;
        this.executor = new HttpExecutor();
    }

    /**
     * 发起流式请求
     *
     * @param method - HTTP 方法
     * @param url - 请求 URL
     * @param body - 请求体
     * @param options - 请求选项
     * @returns StreamTask 对象，包含异步生成器、取消方法和上下文
     */
    request<T = any>(
        method: HttpMethod,
        url: string,
        body?: any,
        options: StreamRequestOptions = {}
    ): StreamTask<T> {
        // 1. 构建 RequestContext
        let builder = RequestContextBuilder.create()
            .withDomain(this.domain)
            .withUrl(url)
            .withMethod(method);

        if (options.headers) {
            builder = builder.withHeaders(options.headers);
        }

        if (body !== undefined) {
            builder = builder.withBody(body);
        }

        if (options.queryParams) {
            builder = builder.withQueryParams(options.queryParams);
        }

        const context = builder.build();

        // 2. 创建 AbortController（独立于 context.request.controller，用于流式取消）
        const controller = new AbortController();
        context.metadata._streamController = controller;

        // 3. 定义异步生成器
        const generate = async function* (this: StreamClient): AsyncIterableIterator<T> {
            // 执行 prepare 管道（Token 注入、URL 构建等）
            await this.executor.execute(context);

            // 如果管道执行出错，抛出异常
            if (context.error) {
                throw context.error;
            }

            // 发起 fetch 请求
            const response = await fetch(context.request.url, {
                method: context.request.method,
                headers: context.request.headers,
                body:
                    context.request.body !== undefined
                        ? typeof context.request.body === 'string'
                            ? context.request.body
                            : JSON.stringify(context.request.body)
                        : undefined,
                signal: controller.signal,
            });

            // 同步响应头到 context
            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((v, k) => {
                responseHeaders[k] = v;
            });
            context.response.headers = responseHeaders;
            context.response.status = response.status;
            context.response.isSuccess = response.ok;

            if (!response.ok) {
                throw new Error(`Stream request failed: ${response.status} ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('Stream response has no body');
            }

            // 消费 ReadableStream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const parts = buffer.split('\n\n');
                    buffer = parts.pop() || '';

                    for (const part of parts) {
                        if (part.trim().startsWith('data:')) {
                            const data = part.replace(/^data:\s*/, '').trim();
                            if (data === '[DONE]') return;
                            try {
                                yield JSON.parse(data) as T;
                            } catch {
                                yield data as unknown as T;
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        };

        return {
            stream: generate.call(this),
            cancel: (reason?: string) => {
                controller.abort(reason || 'manual_stop');
            },
            context,
        };
    }

    /**
     * 发起 POST 流式请求（最常用的 AI 流式接口）
     *
     * @param url - 请求 URL
     * @param body - 请求体
     * @param options - 请求选项
     * @returns StreamTask 对象
     */
    post<T = any>(url: string, body?: any, options?: StreamRequestOptions): StreamTask<T> {
        return this.request('POST', url, body, options);
    }

    /**
     * 发起 GET 流式请求
     *
     * @param url - 请求 URL
     * @param options - 请求选项
     * @returns StreamTask 对象
     */
    get<T = any>(url: string, options?: StreamRequestOptions): StreamTask<T> {
        return this.request('GET', url, undefined, options);
    }
}
