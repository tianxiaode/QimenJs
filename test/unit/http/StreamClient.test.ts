/**
 * StreamClient 单元测试
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
            }))
        }
    };
});

import { StreamClient } from '@/http/StreamClient';

// Mock HttpExecutor
jest.mock('@/http/HttpExecutor', () => ({
    HttpExecutor: jest.fn().mockImplementation(() => ({
        execute: jest.fn().mockImplementation((ctx) => {
            if (!ctx.request.url) {
                ctx.request.url = 'http://example.com/stream';
            }
            return Promise.resolve();
        }),
    })),
}));

// Set up mock fetch
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

// Polyfill TextEncoder/TextDecoder for jsdom
import { TextEncoder, TextDecoder } from 'util';
if (typeof (globalThis as any).TextEncoder === 'undefined') {
    (globalThis as any).TextEncoder = TextEncoder;
}
if (typeof (globalThis as any).TextDecoder === 'undefined') {
    (globalThis as any).TextDecoder = TextDecoder;
}

// Polyfill ReadableStream for jsdom
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
if (typeof (globalThis as any).ReadableStream === 'undefined') {
    (globalThis as any).ReadableStream = NodeReadableStream;
}

// Helper to create a mock ReadableStream from SSE data
// 兼容浏览器 getReader() API，不依赖 Node.js ReadableStream 的迭代器
function createMockReadableStream(chunks: string[]): any {
    const encoder = new TextEncoder();
    const encodedChunks = chunks.map(c => encoder.encode(c));
    let index = 0;

    // 使用 Node.js ReadableStream 作为基础（满足 instanceof 检查）
    const nodeStream = new (globalThis as any).ReadableStream({
        pull(controller: any) {
            if (index < encodedChunks.length) {
                controller.enqueue(encodedChunks[index++]);
            } else {
                controller.close();
            }
        },
    });

    // 为 Node.js ReadableStream 添加浏览器兼容的 getReader() 方法
    if (!nodeStream.getReader) {
        let readIndex = 0;
        nodeStream.getReader = () => ({
            read: async () => {
                if (readIndex < encodedChunks.length) {
                    return { done: false, value: encodedChunks[readIndex++] };
                }
                return { done: true, value: undefined };
            },
            cancel: async () => {},
            releaseLock: () => {},
        });
    }

    return nodeStream;
}

// Helper to create a mock Response
function createMockResponse(body: any, status = 200, ok = true) {
    return {
        ok,
        status,
        statusText: ok ? 'OK' : 'Error',
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
    } as Response;
}

describe('StreamClient', () => {
    let client: StreamClient;

    beforeEach(() => {
        client = new StreamClient('test-domain');
        mockFetch.mockReset();
    });

    describe('constructor', () => {
        it('should create with default domain', () => {
            const defaultClient = new StreamClient();
            expect(defaultClient).toBeDefined();
        });

        it('should create with specified domain', () => {
            expect(client).toBeDefined();
        });
    });

    describe('request', () => {
        it('should return a StreamTask with stream, cancel, and context', () => {
            const task = client.request('GET', 'http://example.com/stream');
            expect(task.stream).toBeDefined();
            expect(task.cancel).toBeDefined();
            expect(task.context).toBeDefined();
        });

        it('should build context with headers', () => {
            const task = client.request('GET', 'http://example.com/stream', undefined, {
                headers: { 'Authorization': 'Bearer token' },
            });
            expect(task.context).toBeDefined();
        });

        it('should build context with body', () => {
            const task = client.request('POST', 'http://example.com/stream', { query: 'hello' });
            expect(task.context).toBeDefined();
        });

        it('should build context with queryParams', () => {
            const task = client.request('GET', 'http://example.com/stream', undefined, {
                queryParams: { page: 1 },
            });
            expect(task.context).toBeDefined();
        });

        it('should cancel via abort controller', () => {
            const task = client.request('GET', 'http://example.com/stream');
            expect(() => task.cancel('test reason')).not.toThrow();
        });

        it('should cancel with default reason', () => {
            const task = client.request('GET', 'http://example.com/stream');
            expect(() => task.cancel()).not.toThrow();
        });

        it('should consume SSE stream and yield parsed data', async () => {
            const stream = createMockReadableStream([
                'data: {"text":"hello"}\n\n',
                'data: {"text":"world"}\n\n',
            ]);
            (globalThis.fetch as jest.Mock).mockResolvedValue(createMockResponse(stream));

            const task = client.request('GET', 'http://example.com/stream');
            const results: any[] = [];
            for await (const item of task.stream) {
                results.push(item);
            }
            expect(results).toEqual([{ text: 'hello' }, { text: 'world' }]);
        });

        it('should handle [DONE] sentinel in SSE stream', async () => {
            const stream = createMockReadableStream([
                'data: {"text":"hello"}\n\n',
                'data: [DONE]\n\n',
            ]);
            (globalThis.fetch as jest.Mock).mockResolvedValue(createMockResponse(stream));

            const task = client.request('GET', 'http://example.com/stream');
            const results: any[] = [];
            for await (const item of task.stream) {
                results.push(item);
            }
            expect(results).toEqual([{ text: 'hello' }]);
        });

        it('should yield raw string when JSON parse fails', async () => {
            const stream = createMockReadableStream([
                'data: not-json\n\n',
            ]);
            (globalThis.fetch as jest.Mock).mockResolvedValue(createMockResponse(stream));

            const task = client.request('GET', 'http://example.com/stream');
            const results: any[] = [];
            for await (const item of task.stream) {
                results.push(item);
            }
            expect(results).toEqual(['not-json']);
        });

        it('should throw when response is not ok', async () => {
            const stream = createMockReadableStream([]);
            (globalThis.fetch as jest.Mock).mockResolvedValue(
                createMockResponse(stream, 500, false)
            );

            const task = client.request('GET', 'http://example.com/stream');
            await expect(async () => {
                for await (const _ of task.stream) { /* consume */ }
            }).rejects.toThrow('Stream request failed');
        });

        it('should throw when response has no body', async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                body: null,
            });

            const task = client.request('GET', 'http://example.com/stream');
            await expect(async () => {
                for await (const _ of task.stream) { /* consume */ }
            }).rejects.toThrow('Stream response has no body');
        });

        it('should sync response headers to context', async () => {
            const stream = createMockReadableStream([
                'data: {"text":"hello"}\n\n',
            ]);
            (globalThis.fetch as jest.Mock).mockResolvedValue(createMockResponse(stream));

            const task = client.request('GET', 'http://example.com/stream');
            for await (const _ of task.stream) { /* consume */ }
            expect(task.context.response.status).toBe(200);
            expect(task.context.response.isSuccess).toBe(true);
        });

        it('should send string body in fetch request', async () => {
            const stream = createMockReadableStream([]);
            (globalThis.fetch as jest.Mock).mockResolvedValue(createMockResponse(stream));

            const task = client.request('POST', 'http://example.com/stream', 'raw-string-body');
            try {
                for await (const _ of task.stream) { /* consume */ }
            } catch { /* stream may end immediately */ }

            const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0];
            expect(fetchCall[1].body).toBe('raw-string-body');
        });

        it('should send JSON stringified body in fetch request', async () => {
            const stream = createMockReadableStream([]);
            (globalThis.fetch as jest.Mock).mockResolvedValue(createMockResponse(stream));

            const task = client.request('POST', 'http://example.com/stream', { key: 'value' });
            try {
                for await (const _ of task.stream) { /* consume */ }
            } catch { /* stream may end immediately */ }

            const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0];
            expect(fetchCall[1].body).toBe('{"key":"value"}');
        });
    });

    describe('post', () => {
        it('should create POST stream request', () => {
            const task = client.post('http://example.com/stream', { data: 'test' });
            expect(task.stream).toBeDefined();
            expect(task.context).toBeDefined();
        });
    });

    describe('get', () => {
        it('should create GET stream request', () => {
            const task = client.get('http://example.com/stream');
            expect(task.stream).toBeDefined();
            expect(task.context).toBeDefined();
        });

        it('should create GET stream request with options', () => {
            const task = client.get('http://example.com/stream', {
                headers: { 'Accept': 'text/event-stream' },
            });
            expect(task.stream).toBeDefined();
        });
    });
});
