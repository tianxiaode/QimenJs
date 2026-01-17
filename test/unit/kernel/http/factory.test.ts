// Mock HttpClient class
const mockRequest = jest.fn();
const mockHttpClientConstructor = jest.fn();
const mockHttpClientClass = jest.fn().mockImplementation((domain) => {
    mockHttpClientConstructor(domain);
    return {
        request: mockRequest
    };
});

// 在模块级别mock HttpClient
jest.mock('@/kernel/http/HttpClient', () => {
    return {
        HttpClient: mockHttpClientClass
    };
});

// Mock the tasks module to prevent hash worker issues
jest.mock('@orbitjs/tasks', () => {
    return {
        globalTaskQueue: {
            addTask: jest.fn(),
        }
    };
});

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

import { HttpFactory } from '@/kernel/http/factory';
import { HttpClient } from '@/kernel/http/HttpClient';
import { globalTaskQueue } from '@orbitjs/tasks';
import { FlowContext } from '@/kernel/types';

describe('HttpFactory', () => {
    beforeEach(() => {
        // 清除所有mock的调用历史
        mockRequest.mockClear();
        mockHttpClientClass.mockClear();
        jest.clearAllMocks();
    });

    describe('createRetryTask', () => {
        it('should create a retryable task', async () => {
            const mockContext: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
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
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            // 设置mock的返回值
            const mockTask = {
                context: Promise.resolve(mockContext),
                cancel: jest.fn(),
            };
            
            mockRequest.mockReturnValue(mockTask);

            const task = HttpFactory.createRetryTask('GET', '/test', {}, 'test-domain');

            expect(task).toHaveProperty('context');
            expect(task).toHaveProperty('cancel');
            
            const context = await task.context;
            expect(context).toEqual(mockContext);
            
            // 验证HttpClient被使用正确的域实例化
            expect(mockHttpClientClass).toHaveBeenCalledWith('test-domain');
        });

        it('should retry when context has error and conditions are met', async () => {
            const mockContextWithError: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: true,
                    hasError: true,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 500,
                    isSuccess: false,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            const mockContextSuccess: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
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
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            // 设置mock的返回值
            const mockTaskError = {
                context: Promise.resolve(mockContextWithError),
                cancel: jest.fn(),
            };
            
            const mockTaskSuccess = {
                context: Promise.resolve(mockContextSuccess),
                cancel: jest.fn(),
            };
            
            mockRequest
                .mockReturnValueOnce(mockTaskError)  // 第一次调用返回错误
                .mockReturnValueOnce(mockTaskSuccess) // 第二次调用返回成功
                .mockReturnValue({ // 为可能的额外调用提供默认返回值
                    context: Promise.resolve(mockContextSuccess),
                    cancel: jest.fn(),
                });

            const retryOptions = {
                maxRetries: 3,
                delay: 100,
                shouldRetry: (context: FlowContext) => true,
            };

            const task = HttpFactory.createRetryTask(
                'GET', 
                '/test', 
                { retry: retryOptions }, 
                'test-domain'
            );

            const context = await task.context;
            
            // 验证request被调用了两次（原始+1次重试）
            expect(mockRequest).toHaveBeenCalledTimes(2);
            expect(context).toEqual(mockContextSuccess);
            
            // 验证HttpClient被使用正确的域实例化
            expect(mockHttpClientClass).toHaveBeenCalledWith('test-domain');
        });

        it('should stop retrying when max retries are reached', async () => {
            const mockContextWithError: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: true,
                    hasError: true,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 500,
                    isSuccess: false,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            // 模拟连续的错误响应
            const mockTaskError = {
                context: Promise.resolve(mockContextWithError),
                cancel: jest.fn(),
            };
            
            mockRequest
                .mockReturnValueOnce(mockTaskError)  // 第1次 - 初始请求
                .mockReturnValueOnce(mockTaskError)  // 第2次 - 第1次重试
                .mockReturnValueOnce(mockTaskError)  // 第3次 - 第2次重试，然后停止
                .mockReturnValue({ // 为可能的额外调用提供默认返回值
                    context: Promise.resolve(mockContextWithError),
                    cancel: jest.fn(),
                });

            const retryOptions = {
                maxRetries: 2,
                delay: 10,
                shouldRetry: (context: FlowContext) => true,
            };

            const task = HttpFactory.createRetryTask(
                'GET', 
                '/test', 
                { retry: retryOptions }, 
                'test-domain'
            );

            const context = await task.context;
            
            // 验证request被调用了3次（原始+2次重试）
            expect(mockRequest).toHaveBeenCalledTimes(3);
            // 最终还是返回错误的上下文
            expect(context).toEqual(mockContextWithError);
            
            // 验证HttpClient被使用正确的域实例化
            expect(mockHttpClientClass).toHaveBeenCalledWith('test-domain');
        });

        it('should not retry when context is aborted', async () => {
            const mockContextAborted: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: true, // 标记为已中止
                metadata: {
                    isTransportFailure: true,
                    hasError: true,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 500,
                    isSuccess: false,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            const mockTaskAborted = {
                context: Promise.resolve(mockContextAborted),
                cancel: jest.fn(),
            };
            
            // 只让 mockRequest 返回一次，后续调用不会发生，因为第一次就会返回
            mockRequest.mockReturnValue(mockTaskAborted);

            const retryOptions = {
                maxRetries: 5, // 设置很高的重试次数
                delay: 10,
                shouldRetry: (context: FlowContext) => true,
            };

            const task = HttpFactory.createRetryTask(
                'GET', 
                '/test', 
                { retry: retryOptions }, 
                'test-domain'
            );

            const context = await task.context;
            
            // 验证只调用了一次请求，因为请求被中止了，不应该重试
            expect(mockRequest).toHaveBeenCalledTimes(1);
            // 返回的就是那个中止的上下文
            expect(context).toEqual(mockContextAborted);
        });

        it('should respect custom shouldRetry function', async () => {
            const mockContextNonRetryable: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: true,
                    hasError: true,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 503, // Service unavailable - usually retryable
                    isSuccess: false,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            const mockTaskError = {
                context: Promise.resolve(mockContextNonRetryable),
                cancel: jest.fn(),
            };
            
            mockRequest
                .mockReturnValueOnce(mockTaskError) // 一次请求后就不会重试
                .mockReturnValue({ // 为可能的额外调用提供默认返回值
                    context: Promise.resolve(mockContextNonRetryable),
                    cancel: jest.fn(),
                });

            const retryOptions = {
                maxRetries: 5, // 设置很高的重试次数
                delay: 10,
                shouldRetry: (context: FlowContext) => context.http.status !== 503, // 503不重试
            };

            const task = HttpFactory.createRetryTask(
                'GET', 
                '/test', 
                { retry: retryOptions }, 
                'test-domain'
            );

            const context = await task.context;
            
            // 验证只调用了一次请求，因为自定义shouldRetry函数返回false
            expect(mockRequest).toHaveBeenCalledTimes(1);
            // 返回的就是那个错误的上下文
            expect(context).toEqual(mockContextNonRetryable);
        });

        it('should handle case when no retry options are provided', async () => {
            const mockContextWithError: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: true,
                    hasError: true,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 500,
                    isSuccess: false,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            const mockTaskError = {
                context: Promise.resolve(mockContextWithError),
                cancel: jest.fn(),
            };
            
            mockRequest
                .mockReturnValueOnce(mockTaskError) // 一次请求
                .mockReturnValue({ // 为可能的额外调用提供默认返回值
                    context: Promise.resolve(mockContextWithError),
                    cancel: jest.fn(),
                });

            // 不提供重试选项
            const task = HttpFactory.createRetryTask(
                'GET', 
                '/test', 
                {}, // 没有retry选项
                'test-domain'
            );

            const context = await task.context;
            
            // 验证只调用了一次请求，因为没有重试选项
            expect(mockRequest).toHaveBeenCalledTimes(1);
            // 返回错误上下文
            expect(context).toEqual(mockContextWithError);
        });

        it('should handle retry with delay value of 0', async () => {
            const mockContextWithError: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: true,
                    hasError: true,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 500,
                    isSuccess: false,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            const mockContextSuccess: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
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
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            // 模拟第一次失败，第二次成功
            const mockTaskError = {
                context: Promise.resolve(mockContextWithError),
                cancel: jest.fn(),
            };
            
            const mockTaskSuccess = {
                context: Promise.resolve(mockContextSuccess),
                cancel: jest.fn(),
            };
            
            mockRequest
                .mockReturnValueOnce(mockTaskError)  // 第一次调用返回错误
                .mockReturnValueOnce(mockTaskSuccess) // 第二次调用返回成功
                .mockReturnValue({ // 为可能的额外调用提供默认返回值
                    context: Promise.resolve(mockContextSuccess),
                    cancel: jest.fn(),
                });

            const retryOptions = {
                maxRetries: 3,
                delay: 0, // 测试delay为0的情况
                shouldRetry: (context: FlowContext) => true,
            };

            const task = HttpFactory.createRetryTask(
                'GET', 
                '/test', 
                { retry: retryOptions }, 
                'test-domain'
            );

            const context = await task.context;
            
            // 验证request被调用了两次（原始+1次重试）
            expect(mockRequest).toHaveBeenCalledTimes(2);
            expect(context).toEqual(mockContextSuccess);
            
            // 验证HttpClient被使用正确的域实例化
            expect(mockHttpClientClass).toHaveBeenCalledWith('test-domain');
        });

        it('should handle retry when delay property is not present in options', async () => {
            const mockContextWithError: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: true,
                    hasError: true,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 500,
                    isSuccess: false,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            const mockContextSuccess: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
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
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            const mockTaskError = {
                context: Promise.resolve(mockContextWithError),
                cancel: jest.fn(),
            };
            
            const mockTaskSuccess = {
                context: Promise.resolve(mockContextSuccess),
                cancel: jest.fn(),
            };
            
            mockRequest
                .mockReturnValueOnce(mockTaskError)  // 第一次调用返回错误
                .mockReturnValueOnce(mockTaskSuccess) // 第二次调用返回成功
                .mockReturnValue({ 
                    context: Promise.resolve(mockContextSuccess),
                    cancel: jest.fn(),
                });

            // 不包含 delay 属性，但包含其他重试选项
            const retryOptions = {
                maxRetries: 3,
                shouldRetry: (context: FlowContext) => true,
                // 注意这里没有 delay 属性
            };

            const task = HttpFactory.createRetryTask(
                'GET', 
                '/test', 
                { retry: retryOptions }, 
                'test-domain'
            );

            const context = await task.context;
            
            // 验证request被调用了两次（原始+1次重试）
            expect(mockRequest).toHaveBeenCalledTimes(2);
            expect(context).toEqual(mockContextSuccess);
            
            // 验证HttpClient被使用正确的域实例化
            expect(mockHttpClientClass).toHaveBeenCalledWith('test-domain');
        });

        it('should skip delay when retry.delay is undefined', async () => {
            const mockContextWithError: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: true,
                    hasError: true,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 500,
                    isSuccess: false,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            const mockContextSuccess: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
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
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            const mockTaskError = {
                context: Promise.resolve(mockContextWithError),
                cancel: jest.fn(),
            };
            
            const mockTaskSuccess = {
                context: Promise.resolve(mockContextSuccess),
                cancel: jest.fn(),
            };
            
            mockRequest
                .mockReturnValueOnce(mockTaskError)  // 第一次调用返回错误
                .mockReturnValueOnce(mockTaskSuccess) // 第二次调用返回成功
                .mockReturnValue({ 
                    context: Promise.resolve(mockContextSuccess),
                    cancel: jest.fn(),
                });

            // 明确设置 delay 为 undefined
            const retryOptions = {
                maxRetries: 3,
                delay: undefined, // 明确设置为 undefined
                shouldRetry: (context: FlowContext) => true,
            };

            const startTime = Date.now();
            const task = HttpFactory.createRetryTask(
                'GET', 
                '/test', 
                { retry: retryOptions }, 
                'test-domain'
            );

            const context = await task.context;
            const endTime = Date.now();
            
            // 验证request被调用了两次（原始+1次重试）
            expect(mockRequest).toHaveBeenCalledTimes(2);
            expect(context).toEqual(mockContextSuccess);
            // 如果没有延迟，执行时间应该很短
            expect(endTime - startTime).toBeLessThan(100); // 应该远小于100ms
            
            // 验证HttpClient被使用正确的域实例化
            expect(mockHttpClientClass).toHaveBeenCalledWith('test-domain');
        });

        it('should properly handle cancellation when currentTask is initially null', async () => {
            // 模拟一个立即成功的请求，这样currentTask在取消时可能仍然是null
            const mockContextSuccess: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
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
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            const mockTask = {
                context: Promise.resolve(mockContextSuccess),
                cancel: jest.fn(),
            };
            
            // 让请求立即返回结果
            mockRequest.mockReturnValue(mockTask);

            const task = HttpFactory.createRetryTask('GET', '/test', {}, 'test-domain');
            
            // 立即取消任务，此时内部的currentTask可能还没被赋值
            task.cancel('immediate cancel');
            
            const context = await task.context;
            expect(context).toEqual(mockContextSuccess);
            
            // 验证取消函数被调用了
            expect(mockTask.cancel).toHaveBeenCalled();
        });

        it('should cancel both the controller and the current task', async () => {
            const mockContext: FlowContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
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
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };
            
            const cancelMock = jest.fn();
            const mockTask = {
                context: Promise.resolve(mockContext),
                cancel: cancelMock,
            };
            
            mockRequest.mockReturnValue(mockTask);

            const task = HttpFactory.createRetryTask('GET', '/test', {}, 'test-domain');

            // 调用cancel并验证它调用了内部task的cancel
            task.cancel('test reason');
            
            // 等待取消操作完成
            await new Promise(resolve => setTimeout(resolve, 0)); // 使用setTimeout代替setImmediate
            
            // 验证内部任务的cancel被调用了
            expect(cancelMock).toHaveBeenCalled();
            
            // 验证HttpClient被使用正确的域实例化
            expect(mockHttpClientClass).toHaveBeenCalledWith('test-domain');
        });
    });

    describe('schedulePolling', () => {
        it('should add a polling task to the global queue', () => {
            const addTaskSpy = jest.spyOn(globalTaskQueue, 'addTask');
            
            const pollingOptions = {
                interval: 2000,
                priority: 'HIGH' as const,
                maxRetries: 2,
                retryDelay: 500,
                headers: { 'Content-Type': 'application/json' },
            };

            HttpFactory.schedulePolling('GET', '/poll', pollingOptions, 'test-domain');

            expect(addTaskSpy).toHaveBeenCalledTimes(1);
            
            // Extract the arguments passed to addTask
            const args = addTaskSpy.mock.calls[0];
            const taskFn = args[0]; // The task function
            const priority = args[1]; // Priority
            const maxRetries = args[2]; // Max retries
            const retryDelay = args[3]; // Retry delay
            const isPolling = args[4]; // Is polling flag
            const interval = args[5]; // Interval
            
            // Verify the parameters
            expect(priority).toBe('HIGH');
            expect(maxRetries).toBe(2);
            expect(retryDelay).toBe(500);
            expect(isPolling).toBe(true);
            expect(interval).toBe(2000);
            
            // Verify that taskFn is a function
            expect(typeof taskFn).toBe('function');
        });

        it('should use default values when options are not provided', () => {
            const addTaskSpy = jest.spyOn(globalTaskQueue, 'addTask');
            
            // Call with minimal options
            HttpFactory.schedulePolling('POST', '/poll', {}, 'test-domain');

            expect(addTaskSpy).toHaveBeenCalledTimes(1);
            
            const args = addTaskSpy.mock.calls[0];
            const priority = args[1];
            const maxRetries = args[2];
            const retryDelay = args[3];
            const interval = args[5];
            
            // Verify defaults
            expect(priority).toBe('NORMAL');
            expect(maxRetries).toBe(3);
            expect(retryDelay).toBe(1000);
            expect(interval).toBe(5000);
        });

        it('should create an HttpClient with the specified domain', () => {
            const addTaskSpy = jest.spyOn(globalTaskQueue, 'addTask');
            
            const pollingOptions = {
                interval: 2000,
                priority: 'HIGH' as const,
            };

            // Mock HttpClient to track construction
            const mockContext = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: undefined,
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
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };

            mockRequest.mockReturnValue({
                context: Promise.resolve(mockContext),
            });

            HttpFactory.schedulePolling('GET', '/poll', pollingOptions, 'custom-domain');

            // Verify HttpClient was constructed with the correct domain
            expect(mockHttpClientClass).toHaveBeenCalledWith('custom-domain');
        });

        it('should execute the task function and throw context when polling task has error', async () => {
            const addTaskSpy = jest.spyOn(globalTaskQueue, 'addTask');
            
            const pollingOptions = {
                interval: 2000,
                priority: 'HIGH' as const,
            };

            // Mock HttpClient to track construction
            const mockContextWithError = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: undefined,
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: true,
                    hasError: true,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 500,
                    isSuccess: false,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };

            mockRequest.mockReturnValue({
                context: Promise.resolve(mockContextWithError),
            });

            HttpFactory.schedulePolling('GET', '/poll', pollingOptions, 'test-domain');

            // 获取添加到队列的任务函数
            const args = addTaskSpy.mock.calls[0];
            const taskFn = args[0]; // The task function

            // 验证当上下文有错误时，任务函数会抛出上下文
            await expect(taskFn()).rejects.toEqual(mockContextWithError);
        });

        it('should execute the task function and return nothing when context is successful', async () => {
            const addTaskSpy = jest.spyOn(globalTaskQueue, 'addTask');
            
            const pollingOptions = {
                interval: 2000,
                priority: 'HIGH' as const,
            };

            // Mock successful context
            const mockContextSuccess = {
                domain: 'test-domain',
                config: {
                    name: 'test-domain',
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: undefined,
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
                    fileName: '',
                    isDownloadHandled: false,
                    isProcessed: false,
                    silent: false,
                    onProgress: undefined,
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
                    url: '/test',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'GET',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {},
                    withCredentials: false,
                },
                steps: [],
                alignToFrontend: (target: any) => target,
                schema: undefined,
                action: undefined,
            };

            mockRequest.mockReturnValue({
                context: Promise.resolve(mockContextSuccess),
            });

            HttpFactory.schedulePolling('GET', '/poll', pollingOptions, 'test-domain');

            // 获取添加到队列的任务函数
            const args = addTaskSpy.mock.calls[0];
            const taskFn = args[0]; // The task function

            // 验证当上下文成功时，任务函数会正常执行并不返回任何内容
            const result = await taskFn();
            expect(result).toBeUndefined();
        });

        it('should execute schedule polling with all default options when none are provided', () => {
            const addTaskSpy = jest.spyOn(globalTaskQueue, 'addTask');
            
            // 调用 schedulePolling 时不提供任何轮询特定选项
            HttpFactory.schedulePolling('GET', '/poll-defaults', {}, 'test-domain');

            expect(addTaskSpy).toHaveBeenCalledTimes(1);
            
            const args = addTaskSpy.mock.calls[0];
            const priority = args[1];
            const maxRetries = args[2];
            const retryDelay = args[3];
            const isPolling = args[4];
            const interval = args[5];
            
            // 验证默认值
            expect(priority).toBe('NORMAL'); // 默认优先级
            expect(maxRetries).toBe(3);     // 默认最大重试次数
            expect(retryDelay).toBe(1000);  // 默认重试延迟
            expect(isPolling).toBe(true);   // 标识这是一个轮询任务
            expect(interval).toBe(5000);    // 默认间隔
        });
    });
});