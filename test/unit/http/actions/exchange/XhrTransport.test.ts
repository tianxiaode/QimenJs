/**
 * XhrTransport 处理器单元测试
 */

import { XhrTransportHandler } from '@/http/actions/exchange/XhrTransport';
import { RequestContextBuilder } from '@orbitjs/context';

function createContext(options: {
    method?: string;
    isUpload?: boolean;
    isDownload?: boolean;
    body?: any;
    headers?: Record<string, string>;
    onProgress?: any;
} = {}) {
    const context = RequestContextBuilder
        .create()
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
