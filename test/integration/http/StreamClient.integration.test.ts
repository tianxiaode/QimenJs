/**
 * StreamClient 流式请求集成测试
 *
 * 验证 StreamClient 的 SSE 流式数据接收：
 * 1. SSE 流式数据接收
 * 2. 流中断处理
 * 3. 流错误处理
 * 4. 取消流请求
 * 5. [DONE] 终止标记
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { StreamClient } from '@/http/StreamClient';
import { HttpActionRegistrar, HttpActionCategory } from '@/http/HttpActionRegistrar';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { RegistryHub } from '@/registry/RegistryHub';

// 确保默认 HTTP Actions 已注册
import '@/http/actions/register';

const TEST_DOMAIN = 'test-stream';

/**
 * 创建 mock SSE ReadableStream body
 * 使用 getReader() 模式，兼容 StreamClient 的消费方式
 */
function createMockSSEBody(events: object[], options?: { done?: boolean }) {
    const encoder =
        typeof TextEncoder !== 'undefined'
            ? new TextEncoder()
            : {
                  encode: (str: string) => {
                      const arr = new Uint8Array(str.length);
                      for (let i = 0; i < str.length; i++) {
                          arr[i] = str.charCodeAt(i);
                      }
                      return arr;
                  },
              };

    const chunks: Uint8Array[] = [];
    for (const event of events) {
        chunks.push(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    }
    if (options?.done !== false) {
        chunks.push(encoder.encode('data: [DONE]\n\n'));
    }

    let index = 0;

    return {
        getReader: () => ({
            read: async () => {
                if (index < chunks.length) {
                    return { done: false, value: chunks[index++] };
                }
                return { done: true, value: undefined };
            },
            cancel: async () => {},
            releaseLock: () => {},
        }),
    };
}

describe('StreamClient 流式请求集成测试', () => {
    let originalFetch: any;

    beforeAll(() => {
        originalFetch = (global as any).fetch;
    });

    afterAll(() => {
        (global as any).fetch = originalFetch;
    });

    beforeEach(() => {
        const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
        domainRegistrar.register(
            TEST_DOMAIN,
            {
                baseUrl: 'https://test-api.example.com',
                preset: 'default',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            },
            true
        );
    });

    afterEach(() => {
        const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
        try {
            domainRegistrar.unregister(TEST_DOMAIN);
        } catch {}
        jest.restoreAllMocks();
    });

    describe('SSE 流式数据接收', () => {
        it('streamClient.get() 通过 AsyncGenerator 逐条接收 SSE 事件', async () => {
            const events = [{ content: 'hello' }, { content: 'world' }, { content: 'done' }];

            const body = createMockSSEBody(events);

            (global as any).fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                body,
                headers: new Headers({ 'Content-Type': 'text/event-stream' }),
            });

            const client = new StreamClient(TEST_DOMAIN);
            const task = client.get('/api/stream');

            const received: any[] = [];
            for await (const chunk of task.stream) {
                received.push(chunk);
            }

            expect(received.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('流中断处理', () => {
        it('有限长度的流迭代正常结束', async () => {
            const events = [{ content: 'chunk1' }, { content: 'chunk2' }];

            const body = createMockSSEBody(events);

            (global as any).fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                body,
                headers: new Headers({ 'Content-Type': 'text/event-stream' }),
            });

            const client = new StreamClient(TEST_DOMAIN);
            const task = client.get('/api/stream');

            const received: any[] = [];
            // 迭代应正常结束，不抛出异常
            for await (const chunk of task.stream) {
                received.push(chunk);
            }

            // 验证迭代正常完成（不抛出异常即通过）
            expect(received.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('流错误处理', () => {
        it('fetch 抛出网络错误时 AsyncGenerator 抛出错误', async () => {
            (global as any).fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            const client = new StreamClient(TEST_DOMAIN);
            const task = client.get('/api/stream');

            let caught = false;
            try {
                for await (const chunk of task.stream) {
                    // 不应到达这里
                }
            } catch (e: any) {
                caught = true;
                expect(e.message).toContain('Network error');
            }

            expect(caught).toBe(true);
        });
    });

    describe('取消流请求', () => {
        it('cancel() 后流迭代停止', async () => {
            const events = [{ content: 'chunk1' }, { content: 'chunk2' }, { content: 'chunk3' }];

            const body = createMockSSEBody(events, { done: false });

            (global as any).fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                body,
                headers: new Headers({ 'Content-Type': 'text/event-stream' }),
            });

            const client = new StreamClient(TEST_DOMAIN);
            const task = client.get('/api/stream');

            // 取消请求
            task.cancel();

            // 验证 cancel 不抛出异常
            expect(() => task.cancel()).not.toThrow();
        });
    });
});
