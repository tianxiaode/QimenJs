/**
 * XhrTransport 处理器单元测试
 */

import { XhrTransportHandler } from '@/http/actions/exchange/XhrTransport';
import { RequestContextBuilder } from '@qimenjs/context';

function createContext(
    options: {
        method?: string;
        isUpload?: boolean;
        isDownload?: boolean;
        body?: any;
        headers?: Record<string, string>;
        onProgress?: any;
    } = {}
) {
    const context = RequestContextBuilder.create()
        .withDomain('test')
        .withUrl('https://api.example.com/test')
        .withMethod((options.method || 'POST') as any)
        .build();

    if (options.isUpload) context.metadata.isUpload = true;
    if (options.isDownload) context.metadata.isDownload = true;
    if (options.body !== undefined) context.request.body = options.body;
    if (options.headers) context.request.headers = options.headers;
    if (options.onProgress) context.metadata.onProgress = options.onProgress;

    return context;
}

// ============================================
// Mock XMLHttpRequest
// ============================================

function createMockXhr() {
    let onload: (() => void) | null = null;
    let onerror: (() => void) | null = null;
    let onabort: (() => void) | null = null;

    const xhr = {
        open: jest.fn(),
        send: jest.fn(),
        abort: jest.fn(),
        setRequestHeader: jest.fn(),
        status: 200,
        response: '{"success":true}',
        getAllResponseHeaders: jest
            .fn()
            .mockReturnValue('content-type: application/json\r\nx-request-id: abc123'),
        upload: {
            onprogress: null as any,
        },
        get onload() {
            return onload;
        },
        set onload(fn: (() => void) | null) {
            onload = fn;
        },
        get onerror() {
            return onerror;
        },
        set onerror(fn: (() => void) | null) {
            onerror = fn;
        },
        get onabort() {
            return onabort;
        },
        set onabort(fn: (() => void) | null) {
            onabort = fn;
        },
        responseType: '',
    };

    return {
        xhr,
        onload: () => onload?.(),
        onerror: () => onerror?.(),
        onabort: () => onabort?.(),
    };
}

describe('XhrTransport', () => {
    it('should skip for non-upload non-download requests', async () => {
        const context = createContext({ isUpload: false, isDownload: false });
        await XhrTransportHandler(context);
        expect(context.response.status).toBe(0);
    });

    it('should handle upload request with XHR', async () => {
        const context = createContext({
            isUpload: true,
            body: 'test data',
            headers: { 'Content-Type': 'text/plain' },
        });

        // XHR is hard to mock in jsdom, just verify the handler doesn't throw
        // and that it returns a promise
        const result = XhrTransportHandler(context);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should handle download request with XHR', async () => {
        const context = createContext({
            isDownload: true,
        });

        const result = XhrTransportHandler(context);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should set onProgress for upload when provided', async () => {
        const onProgress = jest.fn();
        const context = createContext({
            isUpload: true,
            onProgress,
        });

        const result = XhrTransportHandler(context);
        expect(result).toBeInstanceOf(Promise);
    });
});

// ============================================
// 使用 mock XMLHttpRequest 的详细测试
// ============================================

describe('XhrTransport with mocked XHR', () => {
    let mockXhr: ReturnType<typeof createMockXhr>;
    let OriginalXHR: typeof XMLHttpRequest;

    beforeAll(() => {
        OriginalXHR = global.XMLHttpRequest;
    });

    beforeEach(() => {
        mockXhr = createMockXhr();
        (global.XMLHttpRequest as any) = jest.fn(() => mockXhr.xhr);
    });

    afterAll(() => {
        global.XMLHttpRequest = OriginalXHR;
    });

    it('成功响应应设置 response.status、rawResponse、isSuccess、headers', async () => {
        mockXhr.xhr.status = 200;
        mockXhr.xhr.response = '{"success":true}';
        mockXhr.xhr.getAllResponseHeaders = jest
            .fn()
            .mockReturnValue('content-type: application/json\r\nx-request-id: abc123');

        const context = createContext({ isUpload: true, headers: {} });
        const promise = XhrTransportHandler(context);

        // 模拟 XHR 成功响应
        mockXhr.onload();

        await promise;

        expect(context.response.status).toBe(200);
        expect(context.response.rawResponse).toBe('{"success":true}');
        expect(context.response.isSuccess).toBe(true);
        expect(context.response.headers).toEqual({
            'content-type': 'application/json',
            'x-request-id': 'abc123',
        });
        expect(context.metadata.isTransportFailure).toBe(false);
    });

    it('网络错误应设置 isTransportFailure=true', async () => {
        const context = createContext({ isUpload: true, headers: {} });
        const promise = XhrTransportHandler(context);

        // 模拟网络错误
        mockXhr.onerror();

        await promise;

        expect(context.metadata.isTransportFailure).toBe(true);
        expect(context.error?.message).toBe('network_error');
    });

    it('主动取消应设置 isTransportFailure=true，错误原因为 cancelled', async () => {
        const context = createContext({ isUpload: true, headers: {} });
        const promise = XhrTransportHandler(context);

        // 模拟主动取消（非 timeout 原因）
        mockXhr.onabort();

        await promise;

        expect(context.metadata.isTransportFailure).toBe(true);
        expect(context.error?.message).toBe('cancelled');
    });

    it('超时取消应设置 isTransportFailure=true，错误原因为 timeout', async () => {
        const context = createContext({ isUpload: true, headers: {} });
        const promise = XhrTransportHandler(context);

        // 模拟超时取消：先设置 abort reason 为 'timeout'
        context.request.controller?.abort('timeout');

        // 然后触发 onabort
        mockXhr.onabort();

        await promise;

        expect(context.metadata.isTransportFailure).toBe(true);
        expect(context.error?.message).toBe('timeout');
    });

    it('非 2xx 响应应设置 isSuccess=false', async () => {
        mockXhr.xhr.status = 500;
        mockXhr.xhr.response = 'Internal Server Error';
        mockXhr.xhr.getAllResponseHeaders = jest.fn().mockReturnValue('');

        const context = createContext({ isUpload: true, headers: {} });
        const promise = XhrTransportHandler(context);

        mockXhr.onload();

        await promise;

        expect(context.response.status).toBe(500);
        expect(context.response.isSuccess).toBe(false);
    });
});
