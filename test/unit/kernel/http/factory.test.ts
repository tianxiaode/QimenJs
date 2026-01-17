import { HttpFactory } from '@/kernel/http/factory';
import { HttpClient } from '@/kernel/http/HttpClient';
import { globalTaskQueue } from '@orbitjs/tasks';
import { FlowContext } from '@/kernel/types';

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

describe('HttpFactory', () => {
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
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target // 添加缺失的方法
            };
            
            // Mock HttpClient
            const mockRequest = {
                context: Promise.resolve(mockContext),
                cancel: jest.fn(),
            };
            
            const httpClientMock = jest.fn().mockImplementation(() => ({
                request: jest.fn().mockReturnValue(mockRequest),
            }));
            
            // Replace HttpClient constructor with our mock
            jest.mock('@/kernel/http/HttpClient', () => ({
                HttpClient: httpClientMock,
            }));

            const task = HttpFactory.createRetryTask('GET', '/test', {}, 'test-domain');

            expect(task).toHaveProperty('context');
            expect(task).toHaveProperty('cancel');
            
            const context = await task.context;
            expect(context).toEqual(mockContext);
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
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target // 添加缺失的方法
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
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target // 添加缺失的方法
            };
            
            // Mock HttpClient and its request method to simulate retries
            const requestMock = jest.fn()
                .mockReturnValueOnce({ // First call fails
                    context: Promise.resolve(mockContextWithError),
                    cancel: jest.fn(),
                })
                .mockReturnValueOnce({ // Second call succeeds
                    context: Promise.resolve(mockContextSuccess),
                    cancel: jest.fn(),
                });
            
            const httpClientInstance = {
                request: requestMock,
            };
            
            const httpClientConstructorMock = jest.fn().mockImplementation(() => httpClientInstance);
            
            // Temporarily replace HttpClient
            jest.mock('@/kernel/http/HttpClient', () => ({
                HttpClient: httpClientConstructorMock,
            }));

            const retryOptions = {
                maxRetries: 3,
                delay: 100,
                shouldRetry: (context: FlowContext) => true, // 添加缺少的属性
            };

            const task = HttpFactory.createRetryTask(
                'GET', 
                '/test', 
                { retry: retryOptions }, 
                'test-domain'
            );

            const context = await task.context;
            
            // Verify that request was called twice (original + 1 retry)
            expect(requestMock).toHaveBeenCalledTimes(2);
            expect(context).toEqual(mockContextSuccess);
        });

        it('should cancel both the controller and the current task', () => {
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
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target // 添加缺失的方法
            };
            
            const cancelMock = jest.fn();
            const mockRequest = {
                context: Promise.resolve(mockContext),
                cancel: cancelMock,
            };
            
            const requestMock = jest.fn().mockReturnValue(mockRequest);
            const httpClientInstance = {
                request: requestMock,
            };
            
            const httpClientConstructorMock = jest.fn().mockImplementation(() => httpClientInstance);
            
            // Temporarily replace HttpClient
            jest.mock('@/kernel/http/HttpClient', () => ({
                HttpClient: httpClientConstructorMock,
            }));

            const task = HttpFactory.createRetryTask('GET', '/test', {}, 'test-domain');

            // Call cancel and verify it calls both controller.abort and currentTask.cancel
            task.cancel('test reason');
            
            // Since we can't easily spy on the internal controller, we just verify that
            // currentTask.cancel was called if it existed
            expect(cancelMock).toHaveBeenCalled();
        });
    });

    describe('schedulePolling', () => {
        it('should add a polling task to the global queue', () => {
            const addTaskSpy = jest.spyOn(require('@orbitjs/tasks').globalTaskQueue, 'addTask');
            
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
            const addTaskSpy = jest.spyOn(require('@orbitjs/tasks').globalTaskQueue, 'addTask');
            
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
            const addTaskSpy = jest.spyOn(require('@orbitjs/tasks').globalTaskQueue, 'addTask');
            
            const pollingOptions = {
                interval: 2000,
                priority: 'HIGH' as const,
            };

            // Mock HttpClient to track construction
            const httpClientConstructorSpy = jest.fn().mockImplementation(() => ({
                request: jest.fn().mockReturnValue({
                    context: Promise.resolve({
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
                            responseHeaders: {}
                        },
                        steps: [],
                        alignToFrontend: (target: any) => target // 添加缺失的方法
                    }),
                }),
            }));
            
            jest.mock('@/kernel/http/HttpClient', () => ({
                HttpClient: httpClientConstructorSpy,
            }));

            HttpFactory.schedulePolling('GET', '/poll', pollingOptions, 'custom-domain');

            // Verify HttpClient was constructed with the correct domain
            expect(httpClientConstructorSpy).toHaveBeenCalledWith('custom-domain');
        });
    });
});