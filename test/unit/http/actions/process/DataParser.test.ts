/**
 * DataParser 处理器单元测试
 */

import { DataParserHandler } from '@/http/actions/process/DataParser';
import { RequestContextBuilder } from '@qimenjs/context';

function createContext(
    options: {
        isTransportFailure?: boolean;
        rawResponse?: any;
        isJson?: boolean;
        isBlob?: boolean;
    } = {}
) {
    const context = RequestContextBuilder.create()
        .withDomain('test')
        .withUrl('/api/test')
        .withMethod('GET')
        .build();

    if (options.isTransportFailure) context.metadata.isTransportFailure = true;
    if (options.rawResponse !== undefined) context.response.rawResponse = options.rawResponse;
    if (options.isJson) context.metadata.isJson = true;
    if (options.isBlob) context.metadata.isBlob = true;

    return context;
}

describe('DataParser', () => {
    it('should skip if transport failure', async () => {
        const context = createContext({ isTransportFailure: true });
        await DataParserHandler(context);
        expect(context.data.raw).toBeNull();
    });

    it('should skip if no rawResponse', async () => {
        const context = createContext();
        await DataParserHandler(context);
        expect(context.data.raw).toBeNull();
    });

    it('should parse JSON using .json() method', async () => {
        const mockResponse = {
            json: jest.fn().mockResolvedValue({ id: 1, name: 'test' }),
        };
        const context = createContext({
            rawResponse: mockResponse,
            isJson: true,
        });
        await DataParserHandler(context);
        expect(context.data.raw).toEqual({ id: 1, name: 'test' });
        expect(context.response.data).toEqual({ id: 1, name: 'test' });
        expect(context.data.source).toEqual({ id: 1, name: 'test' });
    });

    it('should parse JSON from string when no .json() method', async () => {
        const context = createContext({
            rawResponse: '{"id":1}',
            isJson: true,
        });
        await DataParserHandler(context);
        expect(context.data.raw).toEqual({ id: 1 });
    });

    it('should parse blob using .blob() method', async () => {
        const blob = new Blob(['test']);
        const mockResponse = {
            blob: jest.fn().mockResolvedValue(blob),
        };
        const context = createContext({
            rawResponse: mockResponse,
            isBlob: true,
        });
        await DataParserHandler(context);
        expect(context.data.raw).toBe(blob);
    });

    it('should use rawResponse directly as blob when no .blob() method', async () => {
        const blob = new Blob(['test']);
        const context = createContext({
            rawResponse: blob,
            isBlob: true,
        });
        await DataParserHandler(context);
        expect(context.data.raw).toBe(blob);
    });

    it('should parse text using .text() method', async () => {
        const mockResponse = {
            text: jest.fn().mockResolvedValue('hello world'),
        };
        const context = createContext({
            rawResponse: mockResponse,
        });
        await DataParserHandler(context);
        expect(context.data.raw).toBe('hello world');
    });

    it('should use rawResponse directly as text when no .text() method', async () => {
        const context = createContext({
            rawResponse: 'plain text',
        });
        await DataParserHandler(context);
        expect(context.data.raw).toBe('plain text');
    });

    it('should handle parse error', async () => {
        const context = createContext({
            rawResponse: 'not valid json{{{',
            isJson: true,
        });
        await DataParserHandler(context);
        expect(context.error).toBeInstanceOf(Error);
        expect(context.error.message).toBe('parse_error');
        expect(context.metadata.errorReason).toBe('parse_error');
    });
});
