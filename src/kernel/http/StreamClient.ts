import { NoProgressOptions, StreamTask } from '../types';
import { createFlowContext, runPipeline } from '../core';
import { EntityActionRegistrar } from '../registrars';
import { StreamError, KernelErrorCode } from '../errors';
import { DomainConfig, Registry } from '@orbitjs/registry';

/**
 * StreamClient 类
 * 
 * 专门用于处理流式数据请求，特别是 AI 相关的流式 API
 * 使用 Async Generator 模式，支持 for await 消费
 */
export class StreamClient {
    protected domain: string;
    
    /**
     * 构造函数
     * @param domain 域名，默认为 'default'
     */
    constructor(domain: string = 'default') {
        this.domain = domain;
    }

    /**
     * 修改后的 chatStream：不再直接 yield，而是返回一个 Task
     * 
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns StreamTask 对象，包含异步生成器、取消方法和上下文
     */
    public chatStream<T>(url: string, body: any, options: NoProgressOptions): StreamTask<T> {
        // 1. 创建控制器
        const controller = new AbortController();
        const domainName = this.domain ?? 'default';

        const domainConfig: DomainConfig = Registry.domain.get(domainName);

        // 2. 创建上下文，并将 signal 注入
        const context = createFlowContext('POST', url, domainName, domainConfig, {
            ...options,
            body,
            stream: true,
            signal: controller.signal,
        });

        // 3. 定义内部生成器函数
        const generate = async function* (): AsyncIterableIterator<T> {
            // --- 这一部分就是你刚才写的逻辑 ---
            const allActions = EntityActionRegistrar.getInstance().getPreparePipeline();
            await runPipeline(context, allActions);

            const response = await fetch(context.http.url, {
                method: context.http.method,
                headers: context.http.headers,
                body: typeof body === 'string' ? body : JSON.stringify(body),
                signal: context.http.signal, // 这里是关键：fetch 监听 signal
            });

            // ... 同步 Header 逻辑 (与你之前的一致) ...
            const headers: Record<string, string> = {};
            response.headers.forEach((v, k) => {
                headers[k] = v;
            });
            context.http.responseHeaders = headers;

            if (!response.ok || !response.body) {
                throw new StreamError(
                    'Stream request failed',
                    KernelErrorCode.STREAM_REQUEST_FAILED
                );
            }

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
                // 物理层断开后释放锁
                reader.releaseLock();
            }
        };

        // 4. 返回包装对象
        return {
            stream: generate(),
            cancel: (reason?: string) => {
                controller.abort(reason || 'manual_stop');
            },
            context: context,
        };
    }
}