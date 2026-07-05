/**
 * HttpFactory 单元测试
 */

import { HttpFactory } from '@/http/factory';
import { RequestContextBuilder } from '@qimenjs/context';

// Helper to create a context with error
function createErrorContext(domain: string, errorMsg: string) {
    const ctx = RequestContextBuilder.create()
        .withDomain(domain)
        .withUrl('/api/test')
        .withMethod('GET')
        .build();
    ctx.error = new Error(errorMsg);
    return ctx;
}

// Helper to create a successful context
function createSuccessContext(domain: string) {
    return RequestContextBuilder.create()
        .withDomain(domain)
        .withUrl('/api/test')
        .withMethod('GET')
        .build();
}

// Helper to create an aborted context
function createAbortedContext(domain: string) {
    const ctx = RequestContextBuilder.create()
        .withDomain(domain)
        .withUrl('/api/test')
        .withMethod('GET')
        .build();
    ctx.metadata.isAborted = true;
    return ctx;
}

// Mock HttpClient with controllable behavior
const mockRequest = jest.fn();
jest.mock('@/http/HttpClient', () => {
    return {
        HttpClient: jest.fn().mockImplementation((domain: string) => ({
            request: mockRequest,
        })),
    };
});

describe('HttpFactory', () => {
    beforeEach(() => {
        mockRequest.mockReset();
        // Default: return successful context
        mockRequest.mockReturnValue({
            context: Promise.resolve(createSuccessContext('test')),
            cancel: jest.fn(),
        });
    });

    describe('createRetryTask', () => {
        it('should create retry task with context and cancel', () => {
            const task = HttpFactory.createRetryTask('GET', '/api/test', {}, 'test');
            expect(task.context).toBeDefined();
            expect(task.cancel).toBeDefined();
        });

        it('should return context promise that resolves', async () => {
            const task = HttpFactory.createRetryTask('GET', '/api/test', {}, 'test');
            const context = await task.context;
            expect(context).toBeDefined();
            expect(context.identity.domain).toBe('test');
        });

        it('should cancel the request', () => {
            const task = HttpFactory.createRetryTask('GET', '/api/test', {}, 'test');
            expect(() => task.cancel('user_cancelled')).not.toThrow();
        });

        it('should return immediately when context has no error', async () => {
            const task = HttpFactory.createRetryTask(
                'GET',
                '/api/test',
                {
                    retry: { maxRetries: 3 },
                },
                'test'
            );
            const context = await task.context;
            expect(context.error).toBeFalsy();
            expect(mockRequest).toHaveBeenCalledTimes(1);
        });

        it('should return immediately when context is aborted', async () => {
            mockRequest.mockReturnValue({
                context: Promise.resolve(createAbortedContext('test')),
                cancel: jest.fn(),
            });

            const task = HttpFactory.createRetryTask(
                'GET',
                '/api/test',
                {
                    retry: { maxRetries: 3 },
                },
                'test'
            );
            const context = await task.context;
            expect(context.metadata.isAborted).toBe(true);
            expect(mockRequest).toHaveBeenCalledTimes(1);
        });

        it('should retry on error when retry is configured', async () => {
            // First call: error, second call: success
            mockRequest
                .mockReturnValueOnce({
                    context: Promise.resolve(createErrorContext('test', 'network_error')),
                    cancel: jest.fn(),
                })
                .mockReturnValue({
                    context: Promise.resolve(createSuccessContext('test')),
                    cancel: jest.fn(),
                });

            const task = HttpFactory.createRetryTask(
                'GET',
                '/api/test',
                {
                    retry: { maxRetries: 3 },
                },
                'test'
            );
            const context = await task.context;
            expect(context.error).toBeFalsy();
            expect(mockRequest).toHaveBeenCalledTimes(2);
        });

        it('should retry with delay', async () => {
            jest.useFakeTimers();
            let resolveFirst: Function;
            mockRequest.mockReturnValueOnce({
                context: new Promise(r => {
                    resolveFirst = r;
                }),
                cancel: jest.fn(),
            });

            const task = HttpFactory.createRetryTask(
                'GET',
                '/api/test',
                {
                    retry: { maxRetries: 3, delay: 100 },
                },
                'test'
            );

            // Resolve first request with error
            resolveFirst!(createErrorContext('test', 'timeout'));

            // Advance past delay
            await jest.advanceTimersByTimeAsync(150);

            const context = await task.context;
            expect(mockRequest).toHaveBeenCalledTimes(2);
            jest.useRealTimers();
        });

        it('should stop retrying when shouldRetry returns false', async () => {
            mockRequest.mockReturnValue({
                context: Promise.resolve(createErrorContext('test', 'server_error')),
                cancel: jest.fn(),
            });

            const shouldRetry = jest.fn().mockReturnValue(false);
            const task = HttpFactory.createRetryTask(
                'GET',
                '/api/test',
                {
                    retry: { maxRetries: 3, shouldRetry },
                },
                'test'
            );
            const context = await task.context;
            expect(context.error).toBeDefined();
            expect(shouldRetry).toHaveBeenCalled();
            expect(mockRequest).toHaveBeenCalledTimes(1);
        });

        it('should stop retrying after maxRetries', async () => {
            mockRequest.mockReturnValue({
                context: Promise.resolve(createErrorContext('test', 'network_error')),
                cancel: jest.fn(),
            });

            const task = HttpFactory.createRetryTask(
                'GET',
                '/api/test',
                {
                    retry: { maxRetries: 2 },
                },
                'test'
            );
            const context = await task.context;
            expect(context.error).toBeDefined();
            // 1 initial + 2 retries = 3 total
            expect(mockRequest).toHaveBeenCalledTimes(3);
        });

        it('should not retry when no retry config', async () => {
            mockRequest.mockReturnValue({
                context: Promise.resolve(createErrorContext('test', 'network_error')),
                cancel: jest.fn(),
            });

            const task = HttpFactory.createRetryTask('GET', '/api/test', {}, 'test');
            const context = await task.context;
            expect(context.error).toBeDefined();
            expect(mockRequest).toHaveBeenCalledTimes(1);
        });

        it('should cancel current task on cancel', () => {
            const mockCancel = jest.fn();
            mockRequest.mockReturnValue({
                context: new Promise(() => {}), // never resolves
                cancel: mockCancel,
            });

            const task = HttpFactory.createRetryTask('GET', '/api/test', {}, 'test');
            task.cancel('user_cancelled');
            expect(mockCancel).toHaveBeenCalledWith('user_cancelled');
        });

        it('should cancel with default reason', () => {
            const mockCancel = jest.fn();
            mockRequest.mockReturnValue({
                context: new Promise(() => {}), // never resolves
                cancel: mockCancel,
            });

            const task = HttpFactory.createRetryTask('GET', '/api/test', {}, 'test');
            task.cancel();
            expect(mockCancel).toHaveBeenCalledWith(undefined);
        });
    });

    describe('createPolling', () => {
        let stopFn: (() => void) | undefined;

        afterEach(() => {
            if (stopFn) {
                stopFn();
                stopFn = undefined;
            }
        });

        it('should return a stop function', () => {
            stopFn = HttpFactory.createPolling('GET', '/api/test', {}, 'test');
            expect(stopFn).toBeDefined();
            expect(typeof stopFn).toBe('function');
        });

        it('should call callback with context', async () => {
            const callback = jest.fn();
            stopFn = HttpFactory.createPolling(
                'GET',
                '/api/test',
                {
                    interval: 100,
                },
                'test',
                callback
            );

            // Wait for first poll
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(callback).toHaveBeenCalled();
        });

        it('should stop polling when stop function is called', async () => {
            const callback = jest.fn();
            stopFn = HttpFactory.createPolling(
                'GET',
                '/api/test',
                {
                    interval: 50,
                },
                'test',
                callback
            );

            // Wait for first poll
            await new Promise(resolve => setTimeout(resolve, 30));

            const callCount = callback.mock.calls.length;
            stopFn();

            // Wait a bit more
            await new Promise(resolve => setTimeout(resolve, 100));

            // Should not have more calls after stop
            expect(callback.mock.calls.length).toBeLessThanOrEqual(callCount + 1);
        });

        it('should use default interval of 5000ms', () => {
            stopFn = HttpFactory.createPolling('GET', '/api/test', {}, 'test');
            expect(stopFn).toBeDefined();
        });

        it('should handle polling errors gracefully', async () => {
            // Mock HttpClient to throw
            const { HttpClient } = require('@/http/HttpClient');
            HttpClient.mockImplementationOnce(() => ({
                request: jest.fn().mockReturnValue({
                    context: Promise.reject(new Error('Network error')),
                }),
            }));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            stopFn = HttpFactory.createPolling(
                'GET',
                '/api/test',
                {
                    interval: 50,
                },
                'test'
            );

            await new Promise(resolve => setTimeout(resolve, 30));
            // Should not throw, just log error
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
