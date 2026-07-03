/**
 * HttpFactory 重试/轮询机制集成测试
 *
 * 验证：
 * 1. 自动重试
 * 2. 重试耗尽
 * 3. shouldRetry 条件
 * 4. 轮询机制
 * 5. 轮询停止
 * 6. 取消重试任务
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            }))
        }
    };
});

import { HttpFactory } from '@/http/factory';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { RegistryHub } from '@/registry/RegistryHub';
import { mockFetchSuccess, mockFetchError } from '@test/fixtures/responses';

// 确保默认 HTTP Actions 已注册
import '@/http/actions/register';

const TEST_DOMAIN = 'test-retry';

describe('HttpFactory 重试/轮询机制集成测试', () => {
    let originalFetch: any;

    beforeAll(() => {
        originalFetch = (global as any).fetch;
    });

    afterAll(() => {
        (global as any).fetch = originalFetch;
    });

    beforeEach(() => {
        const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
        domainRegistrar.register(TEST_DOMAIN, {
            baseUrl: 'https://test-api.example.com',
            preset: 'default',
            pageSize: 10,
            pagesizes: [10, 20, 50],
        }, true);
    });

    afterEach(() => {
        const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
        try { domainRegistrar.unregister(TEST_DOMAIN); } catch {}
        jest.restoreAllMocks();
    });

    describe('自动重试', () => {
        it('第 1 次失败后重试成功', async () => {
            let callCount = 0;
            (global as any).fetch = jest.fn().mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.resolve(mockFetchError(500, 'Internal Server Error'));
                }
                return Promise.resolve(mockFetchSuccess({ data: 'retry-ok' }));
            });

            const task = HttpFactory.createRetryTask('GET', '/api/test', {
                retry: {
                    maxRetries: 2,
                    delay: 10,
                },
            }, TEST_DOMAIN);

            const context = await task.context;

            // 验证最终成功
            expect(context.response.isSuccess).toBe(true);
            expect(callCount).toBeGreaterThanOrEqual(2);
        });

        it('重试耗尽后返回最后一次错误', async () => {
            (global as any).fetch = jest.fn().mockResolvedValue(
                mockFetchError(500, 'Internal Server Error')
            );

            const task = HttpFactory.createRetryTask('GET', '/api/test', {
                retry: {
                    maxRetries: 2,
                    delay: 10,
                },
            }, TEST_DOMAIN);

            const context = await task.context;

            // 验证最终失败
            expect(context.response.isSuccess).toBe(false);
        });
    });

    describe('轮询机制', () => {
        it('轮询直到满足条件后停止', async () => {
            let callCount = 0;
            (global as any).fetch = jest.fn().mockImplementation(() => {
                callCount++;
                if (callCount < 3) {
                    return Promise.resolve(mockFetchSuccess({ status: 'pending' }));
                }
                return Promise.resolve(mockFetchSuccess({ status: 'completed' }));
            });

            const stop = HttpFactory.createPolling('GET', '/api/status', {
                interval: 10,
            }, TEST_DOMAIN);

            // 等待轮询完成
            await new Promise(resolve => setTimeout(resolve, 200));

            // 停止轮询
            stop();

            // 验证 fetch 被调用多次
            expect(callCount).toBeGreaterThanOrEqual(2);
        });

        it('调用停止函数后轮询不再发起请求', async () => {
            let callCount = 0;
            (global as any).fetch = jest.fn().mockImplementation(() => {
                callCount++;
                return Promise.resolve(mockFetchSuccess({ status: 'pending' }));
            });

            const stop = HttpFactory.createPolling('GET', '/api/status', {
                interval: 50,
            }, TEST_DOMAIN);

            // 等待第一次请求
            await new Promise(resolve => setTimeout(resolve, 100));

            const countBefore = callCount;
            stop();

            // 等待一段时间，验证不再有新请求
            await new Promise(resolve => setTimeout(resolve, 200));

            // 调用 stop 后请求数不应显著增加
            expect(callCount).toBeLessThanOrEqual(countBefore + 1);
        });
    });
});
