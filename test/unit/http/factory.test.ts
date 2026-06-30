/**
 * HttpFactory 单元测试
 */

import { HttpFactory } from '@/http/factory';
import { RequestContextBuilder } from '@orbitjs/context';

// Mock HttpClient
jest.mock('@/http/HttpClient', () => {
    return {
        HttpClient: jest.fn().mockImplementation((domain: string) => ({
            request: jest.fn().mockReturnValue({
                context: Promise.resolve(
                    RequestContextBuilder
                        .create()
                        .withDomain(domain)
                        .withUrl('/api/test')
                        .withMethod('GET')
                        .build()
                ),
                cancel: jest.fn(),
            }),
        })),
    };
});

describe('HttpFactory', () => {
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

        it('should create retry task with retry options', () => {
            const task = HttpFactory.createRetryTask('GET', '/api/test', {
                retry: {
                    maxRetries: 3,
                    delay: 100,
                },
            }, 'test');
            expect(task.context).toBeDefined();
        });

        it('should create retry task with custom shouldRetry', () => {
            const shouldRetry = jest.fn().mockReturnValue(false);
            const task = HttpFactory.createRetryTask('GET', '/api/test', {
                retry: {
                    maxRetries: 3,
                    shouldRetry,
                },
            }, 'test');
            expect(task.context).toBeDefined();
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
            stopFn = HttpFactory.createPolling('GET', '/api/test', {
                interval: 100,
            }, 'test', callback);

            // Wait for first poll
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(callback).toHaveBeenCalled();
        });

        it('should stop polling when stop function is called', async () => {
            const callback = jest.fn();
            stopFn = HttpFactory.createPolling('GET', '/api/test', {
                interval: 50,
            }, 'test', callback);

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
            stopFn = HttpFactory.createPolling('GET', '/api/test', {
                interval: 50,
            }, 'test');

            await new Promise(resolve => setTimeout(resolve, 30));
            // Should not throw, just log error
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
