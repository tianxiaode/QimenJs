/**
 * ResponseAnalyzer 处理器单元测试
 */

import { ResponseAnalyzerHandler } from '@/http/actions/process/ResponseAnalyzer';
import { RequestContextBuilder } from '@qimenjs/context';

function createContext(options: {
    status?: number;
    headers?: Record<string, string>;
    isTransportFailure?: boolean;
    rawResponse?: any;
} = {}) {
    const context = RequestContextBuilder
        .create()
        .withDomain('test')
        .withUrl('/api/test')
        .withMethod('GET')
        .build();

    if (options.status !== undefined) context.response.status = options.status;
    if (options.headers) context.response.headers = options.headers;
    if (options.isTransportFailure) context.metadata.isTransportFailure = true;
    if (options.rawResponse !== undefined) context.response.rawResponse = options.rawResponse;

    return context;
}

describe('ResponseAnalyzer', () => {
    it('should skip if transport failure', async () => {
        const context = createContext({ isTransportFailure: true });
        await ResponseAnalyzerHandler(context);
        expect(context.error).toBeNull();
    });

    it('should skip if no rawResponse', async () => {
        const context = createContext();
        await ResponseAnalyzerHandler(context);
        expect(context.error).toBeNull();
    });

    it('should set error for 4xx status', async () => {
        const context = createContext({
            status: 404,
            rawResponse: {},
        });
        await ResponseAnalyzerHandler(context);
        expect(context.error).toBeInstanceOf(Error);
        expect(context.error.message).toBe('HTTP 404');
    });

    it('should set error for 5xx status', async () => {
        const context = createContext({
            status: 500,
            rawResponse: {},
        });
        await ResponseAnalyzerHandler(context);
        expect(context.error).toBeInstanceOf(Error);
        expect(context.error.message).toBe('HTTP 500');
    });

    it('should not set error for 2xx status', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
        });
        await ResponseAnalyzerHandler(context);
        expect(context.error).toBeNull();
    });

    it('should detect download from content-disposition attachment', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
            headers: { 'content-disposition': 'attachment; filename="report.pdf"' },
        });
        await ResponseAnalyzerHandler(context);
        expect(context.metadata.isDownload).toBe(true);
    });

    it('should detect download from application/octet-stream', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
            headers: { 'content-type': 'application/octet-stream' },
        });
        await ResponseAnalyzerHandler(context);
        expect(context.metadata.isDownload).toBe(true);
    });

    it('should extract fileName from content-disposition', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
            headers: { 'content-disposition': 'attachment; filename="report.pdf"' },
        });
        await ResponseAnalyzerHandler(context);
        expect(context.metadata.fileName).toBe('report.pdf');
    });

    it('should extract fileName with UTF-8 encoding', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
            headers: { 'content-disposition': "attachment; filename*=UTF-8''%E6%8A%A5%E5%91%8A.pdf" },
        });
        await ResponseAnalyzerHandler(context);
        expect(context.metadata.fileName).toBe('报告.pdf');
    });

    it('should detect JSON content type', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
            headers: { 'content-type': 'application/json; charset=utf-8' },
        });
        await ResponseAnalyzerHandler(context);
        expect(context.metadata.isJson).toBe(true);
    });

    it('should detect blob content type for image', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
            headers: { 'content-type': 'image/png' },
        });
        await ResponseAnalyzerHandler(context);
        expect(context.metadata.isBlob).toBe(true);
    });

    it('should detect text content type', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
            headers: { 'content-type': 'text/html' },
        });
        await ResponseAnalyzerHandler(context);
        expect(context.metadata.isText).toBe(true);
    });

    it('should detect xml content type as text', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
            headers: { 'content-type': 'application/xml' },
        });
        await ResponseAnalyzerHandler(context);
        expect(context.metadata.isText).toBe(true);
    });

    it('should store contentType in metadata', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
            headers: { 'content-type': 'application/json' },
        });
        await ResponseAnalyzerHandler(context);
        expect(context.metadata.contentType).toBe('application/json');
    });

    it('should handle empty headers', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
            headers: {},
        });
        await ResponseAnalyzerHandler(context);
        expect(context.metadata.isJson).toBe(false);
        expect(context.metadata.isDownload).toBe(false);
        expect(context.metadata.isBlob).toBe(false);
        expect(context.metadata.isText).toBe(false);
    });

    it('should handle content-disposition without filename', async () => {
        const context = createContext({
            status: 200,
            rawResponse: {},
            headers: { 'content-disposition': 'attachment' },
        });
        await ResponseAnalyzerHandler(context);
        expect(context.metadata.isDownload).toBe(true);
        expect(context.metadata.fileName).toBeUndefined();
    });
});
