import { StreamClient } from '@/kernel/http/StreamClient';
import { EntityActionRegistrar } from '@/kernel/registrars';
import { DomainRegistrar } from '@orbitjs/registry';
import * as coreModule from '@/kernel/core';
import { FlowContext } from '@/kernel/types';

// Mock TextEncoder/TextDecoder for Node environment
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Create a mock Response class that matches the actual Response interface
class MockResponse {
  constructor(
    public body: any,
    public init: { status?: number; statusText?: string; headers?: any } = {}
  ) {}

  get ok() {
    return this.init.status && this.init.status >= 200 && this.init.status < 300;
  }

  get status() {
    return this.init.status || 200;
  }

  get statusText() {
    return this.init.statusText || 'OK';
  }

  get headers() {
    return this.init.headers;
  }

  static error() {
    return new MockResponse(null, { status: 0, statusText: 'Error' });
  }

  static json(data: any, init?: ResponseInit) {
    return new MockResponse(JSON.stringify(data), init);
  }

  static redirect(url: string, status?: number) {
    return new MockResponse(null, { status: status || 302, statusText: 'Found' });
  }
}

global.Response = MockResponse as any;

// Mock Logger module to prevent initialization issues during tests
jest.mock('@/logger', () => {
    return {
        Logger: {
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            }))
        }
    };
});

// Mock core module functions to prevent redefinition issues
jest.mock('@/kernel/core', () => {
    const originalModule = jest.requireActual('@/kernel/core');
    return {
        ...originalModule,
        createFlowContext: jest.fn(),
        runPipeline: jest.fn(),
    };
});

// Mock fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('StreamClient', () => {
    let streamClient: StreamClient;
    const domain = 'test-domain';

    beforeEach(() => {
        // Mock DomainRegistrar
        jest.spyOn(DomainRegistrar.getInstance(), 'get').mockReturnValue({
            name: domain,
            baseUrl: 'https://api.example.com',
            preset: 'default',
            pageSize: 10,
            pagesizes: [10, 20, 50]
        } as any);

        streamClient = new StreamClient(domain);
        
        // Reset mocks
        mockFetch.mockReset();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with the provided domain', () => {
            const client = new StreamClient(domain);
            expect((client as any).domain).toBe(domain);
        });

        it('should initialize with default domain if none provided', () => {
            const client = new StreamClient();
            expect((client as any).domain).toBe('default');
        });
    });

    describe('chatStream', () => {
        it('should return a StreamTask with stream, cancel, and context properties', () => {
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target // 添加缺失的方法
            };
            
            // Mock the modules correctly
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
                
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline')
                .mockReturnValue([]);
                
            // 修复 mockResolvedValue 的值，返回正确的 FlowContext
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const body = { message: 'test' };
            const options = {};

            const task = streamClient.chatStream('/stream', body, options);

            expect(task).toHaveProperty('stream');
            expect(task).toHaveProperty('cancel');
            expect(task).toHaveProperty('context');
            expect(task.context).toEqual(mockContext);
        });

        it('should allow cancellation of stream', () => {
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target // 添加缺失的方法
            };
            
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
                
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline')
                .mockReturnValue([]);
                
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const body = { message: 'test' };
            const options = {};

            const task = streamClient.chatStream('/stream', body, options);

            expect(typeof task.cancel).toBe('function');
            
            // Test that calling cancel doesn't throw an error
            expect(() => task.cancel()).not.toThrow();
        });

        it('should handle streaming data correctly', async () => {
            // We can't fully test the async generator in a unit test
            // But we can at least ensure the structure is correct
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target // 添加缺失的方法
            };
            
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
                
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline')
                .mockReturnValue([]);
                
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const body = { message: 'test' };
            const options = {};

            const task = streamClient.chatStream<{text: string}>('/stream', body, options);

            // Verify that the stream property is an async iterable
            expect(task.stream).toBeDefined();
            expect(typeof task.stream[Symbol.asyncIterator]).toBe('function');
        });
        
        it('should process streamed data correctly', async () => {
            // 设置模拟响应
            const mockHeaders = { 
              forEach: jest.fn((fn) => {
                fn('application/json', 'content-type');
                fn('chunked', 'transfer-encoding');
              }) 
            };
            
            // 创建一个模拟reader，用于模拟数据读取过程
            const mockReader = {
              read: jest.fn(),
              releaseLock: jest.fn(),
            };
            
            // 模拟三次读取：两次有数据，一次完成
            mockReader.read
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([...new TextEncoder().encode("data: {\"text\":\"Hello\"}\n\n")]) })
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([...new TextEncoder().encode("data: {\"text\":\"World\"}\n\n")]) })
              .mockResolvedValueOnce({ done: true, value: undefined });
            
            const mockBody = { getReader: jest.fn(() => mockReader) };
            
            const mockResponse = new MockResponse('', { status: 200, statusText: 'OK', headers: mockHeaders });
            Object.defineProperty(mockResponse, 'body', { value: mockBody });
            Object.defineProperty(mockResponse, 'ok', { value: true });
            
            mockFetch.mockResolvedValue(mockResponse);
            
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {'content-type': 'application/json'},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target
            };
            
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline').mockReturnValue([]);
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const task = streamClient.chatStream<{text: string}>('/stream', {message: 'test'}, {});
            
            const result = [];
            for await (const chunk of task.stream) {
                result.push(chunk);
            }
            
            expect(result).toEqual([{text: 'Hello'}, {text: 'World'}]);
            expect(mockReader.releaseLock).toHaveBeenCalled();
        });
        
        it('should handle non-OK response correctly', async () => {
            // 设置模拟响应
            const mockHeaders = { forEach: jest.fn() };
            const mockBody = { getReader: jest.fn(() => ({ 
              read: jest.fn(),
              releaseLock: jest.fn(),
            })) };
            
            const mockResponse = new MockResponse('', { status: 400, statusText: 'Bad Request', headers: mockHeaders });
            Object.defineProperty(mockResponse, 'body', { value: mockBody });
            Object.defineProperty(mockResponse, 'ok', { value: false }); // Not OK
            
            mockFetch.mockResolvedValue(mockResponse);
            
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 400,
                    isSuccess: false,
                    headers: {},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target
            };
            
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline').mockReturnValue([]);
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const task = streamClient.chatStream<{text: string}>('/stream', {message: 'test'}, {});
            
            await expect(async () => {
                for await (const _ of task.stream) {
                  // 消费流
                }
            }).rejects.toThrow('Stream request failed');
        });
        
        it('should handle missing response body correctly', async () => {
            // 设置模拟响应
            const mockHeaders = { forEach: jest.fn() };
            
            const mockResponse = new MockResponse('', { status: 200, statusText: 'OK', headers: mockHeaders });
            Object.defineProperty(mockResponse, 'body', { value: null }); // No body
            Object.defineProperty(mockResponse, 'ok', { value: true });
            
            mockFetch.mockResolvedValue(mockResponse);
            
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target
            };
            
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline').mockReturnValue([]);
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const task = streamClient.chatStream<{text: string}>('/stream', {message: 'test'}, {});
            
            await expect(async () => {
                for await (const _ of task.stream) {
                  // 消费流
                }
            }).rejects.toThrow('Stream request failed');
        });
        
        it('should handle non-JSON data correctly', async () => {
            // 设置模拟响应
            const mockHeaders = { 
              forEach: jest.fn((fn) => {
                fn('application/json', 'content-type');
                fn('chunked', 'transfer-encoding');
              }) 
            };
            
            // 创建一个模拟reader，用于模拟数据读取过程
            const mockReader = {
              read: jest.fn(),
              releaseLock: jest.fn(),
            };
            
            // 模拟发送非JSON格式的数据
            mockReader.read
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([...new TextEncoder().encode("data: This is not JSON\n\n")]) })
              .mockResolvedValueOnce({ done: true, value: undefined });
            
            const mockBody = { getReader: jest.fn(() => mockReader) };
            
            const mockResponse = new MockResponse('', { status: 200, statusText: 'OK', headers: mockHeaders });
            Object.defineProperty(mockResponse, 'body', { value: mockBody });
            Object.defineProperty(mockResponse, 'ok', { value: true });
            
            mockFetch.mockResolvedValue(mockResponse);
            
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {'content-type': 'application/json'},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target
            };
            
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline').mockReturnValue([]);
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const task = streamClient.chatStream<string>('/stream', {message: 'test'}, {});
            
            const result = [];
            for await (const chunk of task.stream) {
                result.push(chunk);
            }
            
            expect(result).toEqual(['This is not JSON']);
            expect(mockReader.releaseLock).toHaveBeenCalled();
        });
        
        it('should handle [DONE] signal correctly', async () => {
            // 设置模拟响应
            const mockHeaders = { 
              forEach: jest.fn((fn) => {
                fn('application/json', 'content-type');
                fn('chunked', 'transfer-encoding');
              }) 
            };
            
            // 创建一个模拟reader，用于模拟数据读取过程
            const mockReader = {
              read: jest.fn(),
              releaseLock: jest.fn(),
            };
            
            // 模拟发送普通数据后发送[DONE]信号
            mockReader.read
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([...new TextEncoder().encode("data: {\"text\":\"Hello\"}\n\n")]) })
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([...new TextEncoder().encode("data: [DONE]\n\n")]) })
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([...new TextEncoder().encode("data: {\"text\":\"This won't be processed\"}\n\n")]) })
              .mockResolvedValueOnce({ done: true, value: undefined });
            
            const mockBody = { getReader: jest.fn(() => mockReader) };
            
            const mockResponse = new MockResponse('', { status: 200, statusText: 'OK', headers: mockHeaders });
            Object.defineProperty(mockResponse, 'body', { value: mockBody });
            Object.defineProperty(mockResponse, 'ok', { value: true });
            
            mockFetch.mockResolvedValue(mockResponse);
            
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {'content-type': 'application/json'},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target
            };
            
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline').mockReturnValue([]);
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const task = streamClient.chatStream<{text: string}>('/stream', {message: 'test'}, {});
            
            const result = [];
            // 预期只会处理[DONE]前的数据
            for await (const chunk of task.stream) {
                result.push(chunk);
            }
            
            // 应该只包含"DONE"前的数据，不会包含之后的数据
            expect(result).toEqual([{text: 'Hello'}]);
            expect(mockReader.releaseLock).toHaveBeenCalled();
        });
        
        it('should use default domain when not provided', () => {
            const clientWithDefaultDomain = new StreamClient(); // 不传递参数，使用默认值 'default'
            
            const mockContext: FlowContext = {
                domain: 'default',
                config: {
                    name: 'default',
                    baseUrl: 'https://api.default.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target
            };
            
            // Mock the modules correctly
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
                
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline')
                .mockReturnValue([]);
                
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const body = { message: 'test' };
            const options = {};

            const task = clientWithDefaultDomain.chatStream('/stream', body, options);

            expect(task).toHaveProperty('stream');
            expect(task).toHaveProperty('cancel');
            expect(task).toHaveProperty('context');
            expect(task.context).toEqual(mockContext);
            // 验证 domain 是 'default'
            expect((clientWithDefaultDomain as any).domain).toBe('default');
        });
        
        it('should handle string body correctly', async () => {
            // 设置模拟响应
            const mockHeaders = { 
              forEach: jest.fn((fn) => {
                fn('application/json', 'content-type');
                fn('chunked', 'transfer-encoding');
              }) 
            };
            
            // 创建一个模拟reader，用于模拟数据读取过程
            const mockReader = {
              read: jest.fn(),
              releaseLock: jest.fn(),
            };
            
            // 模拟三次读取：两次有数据，一次完成
            mockReader.read
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([...new TextEncoder().encode("data: {\"text\":\"Response1\"}\n\n")]) })
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([...new TextEncoder().encode("data: {\"text\":\"Response2\"}\n\n")]) })
              .mockResolvedValueOnce({ done: true, value: undefined });
            
            const mockBody = { getReader: jest.fn(() => mockReader) };
            const mockResponse = new MockResponse('', { status: 200, statusText: 'OK', headers: mockHeaders });
            Object.defineProperty(mockResponse, 'body', { value: mockBody });
            Object.defineProperty(mockResponse, 'ok', { value: true });
            
            mockFetch.mockResolvedValue(mockResponse);
            
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {'content-type': 'application/json'},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target
            };
            
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline').mockReturnValue([]);
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            // 使用字符串类型的 body 来测试 typeof body === 'string' 分支
            const task = streamClient.chatStream<{text: string}>('/stream', "This is a string body", {});
            
            const result = [];
            for await (const chunk of task.stream) {
                result.push(chunk);
            }
            
            expect(result).toEqual([{text: 'Response1'}, {text: 'Response2'}]);
            expect(mockReader.releaseLock).toHaveBeenCalled();
            
            // 验证 fetch 是如何被调用的，特别是 body 部分
            expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                method: 'POST',
                body: "This is a string body"  // 字符串类型的 body 不会被 JSON.stringify
            }));
        });
    });
});