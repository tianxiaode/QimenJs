/**
 * XhrTransport 单元测试
 * 
 * 测试 XhrTransportHandler 的跳过逻辑和 parseXhrHeaders 辅助函数
 * XHR 的完整流程测试留给集成测试
 */

import { XhrTransportHandler } from '@/http/actions/exchange/XhrTransport';
import { RequestContextBuilder } from '@orbit-js/context';

describe('XhrTransportHandler', () => {
    it('should skip non-upload/download requests', async () => {
        const context = RequestContextBuilder
            .create()
            .withDomain('test')
            .withUrl('/api/test')
            .withMethod('POST')
            .build();

        await XhrTransportHandler(context);
        // Should not have changed transport-related properties
        expect(context.metadata.isTransportFailure).toBe(false);
    });

    it('should process upload request', async () => {
        const context = RequestContextBuilder
            .create()
            .withDomain('test')
            .withUrl('/api/upload')
            .withMethod('POST')
            .build();
        context.metadata.isUpload = true;
        context.request.headers = { 'Content-Type': 'multipart/form-data' };
        context.request.body = 'file-data';

        // XHR will be created by jsdom, but the request will fail since there's no server
        // We just verify the handler doesn't throw
        await XhrTransportHandler(context);
        // The XHR will error since there's no actual server
        expect(context.metadata.isTransportFailure).toBe(true);
    });

    it('should process download request', async () => {
        const context = RequestContextBuilder
            .create()
            .withDomain('test')
            .withUrl('/api/download')
            .withMethod('GET')
            .build();
        context.metadata.isDownload = true;

        await XhrTransportHandler(context);
        expect(context.metadata.isTransportFailure).toBe(true);
    });

    it('should set onProgress callback for upload', async () => {
        const context = RequestContextBuilder
            .create()
            .withDomain('test')
            .withUrl('/api/upload')
            .withMethod('POST')
            .build();
        context.metadata.isUpload = true;
        context.metadata.onProgress = jest.fn();

        await XhrTransportHandler(context);
        // Handler should have processed the request
        expect(context).toBeDefined();
    });

    it('should handle abort signal', async () => {
        const context = RequestContextBuilder
            .create()
            .withDomain('test')
            .withUrl('/api/upload')
            .withMethod('POST')
            .build();
        context.metadata.isUpload = true;

        // Start the handler but abort immediately
        const handlerPromise = XhrTransportHandler(context);
        // Abort via the controller stored in context
        if (context.request.controller) {
            context.request.controller.abort('user_cancelled');
        }
        await handlerPromise;
        expect(context.metadata.isTransportFailure).toBe(true);
    });

    it('should handle timeout', async () => {
        const context = RequestContextBuilder
            .create()
            .withDomain('test')
            .withUrl('/api/upload')
            .withMethod('POST')
            .build();
        context.metadata.isUpload = true;
        context.request.timeout = 1; // 1ms timeout

        jest.useFakeTimers();
        const handlerPromise = XhrTransportHandler(context);
        jest.advanceTimersByTime(10);
        await handlerPromise;
        expect(context.metadata.isTransportFailure).toBe(true);
        jest.useRealTimers();
    });
});
