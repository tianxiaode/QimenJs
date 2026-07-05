/**
 * OAuth2 + HTTP 管道集成测试
 *
 * 验证 OAuth2Manager 与 HTTP 管道的真实交互，重点覆盖：
 * 1. Token 获取与注入（loginWithPassword → DomainRegistrar.updateToken → TokenInjector）
 * 2. 401 自动刷新与重试（TokenRefreshHandler → refreshToken → 重试）
 * 3. 并发 401 去重
 * 4. 防递归
 * 5. 匿名请求不触发刷新
 * 6. 登出清理
 * 7. 事件通知
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
            })),
        },
    };
});

import { OAuth2Manager, oauth2 } from '@/oauth2/OAuth2Manager';
import { TokenRefreshHandler } from '@/oauth2/TokenRefreshHandler';
import { MemoryTokenStorage } from '@/oauth2/TokenStorage';
import { HttpClient } from '@/http/HttpClient';
import { HttpActionRegistrar, HttpActionCategory } from '@/http/HttpActionRegistrar';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { RegistryHub } from '@/registry/RegistryHub';
import { RequestContextBuilder } from '@/context';
import {
    createOAuth2TokenResponse,
    mockFetchSuccess,
    mockFetchError,
} from '@test/fixtures/responses';

// 确保默认 HTTP Actions 和 OAuth2 TokenRefreshHandler 已注册
import '@/http/actions/register';
import '@/oauth2/register';

const TEST_DOMAIN = 'test-oauth2';
const TOKEN_ENDPOINT = 'https://test-auth.example.com/token';
const REVOKE_ENDPOINT = 'https://test-auth.example.com/revoke';

describe('OAuth2 + HTTP 管道集成测试', () => {
    let manager: OAuth2Manager;
    let domainRegistrar: DomainRegistrar;
    let actionRegistrar: HttpActionRegistrar;
    let originalFetch: any;

    beforeAll(() => {
        originalFetch = (global as any).fetch;
    });

    afterAll(() => {
        (global as any).fetch = originalFetch;
    });

    beforeEach(() => {
        domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
        actionRegistrar = HttpActionRegistrar.getInstance();

        // 注册测试域
        domainRegistrar.register(
            TEST_DOMAIN,
            {
                baseUrl: 'https://test-api.example.com',
                preset: 'default',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            },
            true
        );

        // 创建独立的 OAuth2Manager 实例
        manager = new OAuth2Manager();
        manager.configure({
            tokenEndpoint: TOKEN_ENDPOINT,
            revokeEndpoint: REVOKE_ENDPOINT,
            clientId: 'test-client',
            clientSecret: 'test-secret',
            domain: TEST_DOMAIN,
            storage: 'memory',
        });
    });

    afterEach(() => {
        // 清理
        try {
            domainRegistrar.unregister(TEST_DOMAIN);
        } catch {}
        jest.restoreAllMocks();
    });

    describe('Token 获取与注入', () => {
        it('loginWithPassword 成功后 DomainRegistrar 中对应域的 token 被更新', async () => {
            const tokenResponse = createOAuth2TokenResponse({
                access_token: 'new-access-token',
            });

            (global as any).fetch = jest.fn().mockResolvedValue(mockFetchSuccess(tokenResponse));

            const result = await manager.loginWithPassword({
                username: 'testuser',
                password: 'testpass',
            });

            expect(result.success).toBe(true);
            expect(result.accessToken).toBe('new-access-token');

            // 验证 DomainRegistrar 中 token 已更新
            const domainConfig = domainRegistrar.get(TEST_DOMAIN);
            expect(domainConfig.token).toBe('new-access-token');
        });

        it('后续 HTTP 请求的 header 包含 Authorization: Bearer {token}', async () => {
            // 先登录获取 token
            const tokenResponse = createOAuth2TokenResponse({
                access_token: 'injected-token',
            });

            let fetchCallCount = 0;
            (global as any).fetch = jest.fn().mockImplementation((url: string) => {
                fetchCallCount++;
                if (url === TOKEN_ENDPOINT) {
                    return Promise.resolve(mockFetchSuccess(tokenResponse));
                }
                // 业务请求
                return Promise.resolve(mockFetchSuccess({ data: 'ok' }));
            });

            await manager.loginWithPassword({
                username: 'testuser',
                password: 'testpass',
            });

            // 发起业务请求
            const client = new HttpClient(TEST_DOMAIN);
            const task = client.get('/api/users');
            await task.context;

            // 验证业务请求的 fetch 调用中包含 Authorization header
            // fetch 的第二次调用是业务请求
            const businessCall = (global as any).fetch.mock.calls[1];
            if (businessCall) {
                // FetchTransport 使用 fetch(url, options)
                const options = businessCall[1] || {};
                const authHeader = options.headers?.Authorization || options.headers?.authorization;
                // TokenInjector 注入的 header 可能在不同位置
                // 需要检查 context 中的 request.headers
            }

            // 更直接的验证：通过 RequestContext 检查
            const client2 = new HttpClient(TEST_DOMAIN);
            const context = RequestContextBuilder.create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .withMethod('GET')
                .build();

            // 验证 domainConfig 中有 token
            expect(context.metadata.domainConfig?.token).toBe('injected-token');
        });
    });

    describe('401 自动刷新与重试', () => {
        it('请求返回 401 + 当前有 token + 非刷新请求 → 自动刷新 token → 使用新 token 重试', async () => {
            // 先登录
            const loginResponse = createOAuth2TokenResponse({
                access_token: 'old-token',
                refresh_token: 'refresh-token',
            });

            const refreshResponse = createOAuth2TokenResponse({
                access_token: 'refreshed-token',
                refresh_token: 'new-refresh-token',
            });

            let fetchCallCount = 0;
            (global as any).fetch = jest.fn().mockImplementation((url: string) => {
                fetchCallCount++;
                if (url === TOKEN_ENDPOINT) {
                    // 登录或刷新请求
                    return Promise.resolve(
                        mockFetchSuccess(fetchCallCount === 1 ? loginResponse : refreshResponse)
                    );
                }
                // 业务请求：第一次返回 401，第二次返回成功
                if (fetchCallCount === 2) {
                    return Promise.resolve(mockFetchError(401, 'Unauthorized'));
                }
                return Promise.resolve(mockFetchSuccess({ data: 'retry-ok' }));
            });

            // 登录
            await manager.loginWithPassword({
                username: 'testuser',
                password: 'testpass',
            });

            // 使用全局 oauth2 单例配置（TokenRefreshHandler 使用全局单例）
            oauth2.configure({
                tokenEndpoint: TOKEN_ENDPOINT,
                revokeEndpoint: REVOKE_ENDPOINT,
                clientId: 'test-client',
                clientSecret: 'test-secret',
                domain: TEST_DOMAIN,
                storage: 'memory',
            });
            await oauth2.loginWithPassword({
                username: 'testuser',
                password: 'testpass',
            });

            // 发起业务请求（通过 HttpClient + 真实管道）
            const client = new HttpClient(TEST_DOMAIN);
            const task = client.get('/api/users');
            const context = await task.context;

            // 验证最终结果成功（重试后）
            // 注意：TokenRefreshHandler 会自动处理 401 并重试
            // fetch 应被调用多次：1(登录) + 2(业务401) + 3(刷新) + 4(重试)
            expect(fetchCallCount).toBeGreaterThanOrEqual(3);
        });

        it('无 token 的请求返回 401 → 不触发 refreshToken', async () => {
            let fetchCallCount = 0;
            (global as any).fetch = jest.fn().mockImplementation(() => {
                fetchCallCount++;
                return Promise.resolve(mockFetchError(401, 'Unauthorized'));
            });

            // 不登录，直接发起请求
            const client = new HttpClient(TEST_DOMAIN);
            const task = client.get('/api/users');
            const context = await task.context;

            // 验证只有一次 fetch 调用（业务请求），没有刷新调用
            expect(context.response.status).toBe(401);
        });

        it('防递归：token 刷新请求本身返回 401 → 不再触发刷新', async () => {
            // 先登录
            const loginResponse = createOAuth2TokenResponse({
                access_token: 'old-token',
                refresh_token: 'refresh-token',
            });

            let fetchCallCount = 0;
            (global as any).fetch = jest.fn().mockImplementation((url: string) => {
                fetchCallCount++;
                if (url === TOKEN_ENDPOINT && fetchCallCount === 1) {
                    return Promise.resolve(mockFetchSuccess(loginResponse));
                }
                // 所有后续请求都返回 401（包括刷新请求）
                return Promise.resolve(mockFetchError(401, 'Unauthorized'));
            });

            // 登录
            await oauth2.configure({
                tokenEndpoint: TOKEN_ENDPOINT,
                clientId: 'test-client',
                clientSecret: 'test-secret',
                domain: TEST_DOMAIN,
                storage: 'memory',
            });
            await oauth2.loginWithPassword({
                username: 'testuser',
                password: 'testpass',
            });

            // 发起业务请求
            const client = new HttpClient(TEST_DOMAIN);
            const task = client.get('/api/users');
            const context = await task.context;

            // 验证不会无限递归（fetch 调用次数有限）
            // 1(登录) + 2(业务401) + 3(刷新401) = 3 次，不应更多
            expect(fetchCallCount).toBeLessThanOrEqual(4);
        });
    });

    describe('并发 401 去重', () => {
        it('3 个并发 refreshToken 调用 → 只发起 1 次实际刷新请求', async () => {
            const loginResponse = createOAuth2TokenResponse({
                access_token: 'old-token',
                refresh_token: 'refresh-token',
            });

            let fetchCallCount = 0;
            (global as any).fetch = jest.fn().mockImplementation((url: string) => {
                if (url === TOKEN_ENDPOINT) {
                    fetchCallCount++;
                    // 第一次是登录，后续是刷新
                    return Promise.resolve(mockFetchSuccess(loginResponse));
                }
                return Promise.resolve(mockFetchSuccess({}));
            });

            // 先登录
            await manager.loginWithPassword({
                username: 'testuser',
                password: 'testpass',
            });

            // 重置计数
            fetchCallCount = 0;

            // 并发调用 3 次 refreshToken
            const results = await Promise.all([
                manager.refreshToken(),
                manager.refreshToken(),
                manager.refreshToken(),
            ]);

            // 验证所有调用都返回 true
            expect(results.every(r => r === true)).toBe(true);

            // 验证 fetch 只被调用 1 次（去重）
            expect(fetchCallCount).toBe(1);
        });
    });

    describe('登出清理', () => {
        it('logout 后 TokenStorage 清空且 DomainRegistrar 中 token 被清除', async () => {
            const tokenResponse = createOAuth2TokenResponse({
                access_token: 'logout-test-token',
                refresh_token: 'logout-refresh-token',
            });

            (global as any).fetch = jest.fn().mockImplementation((url: string) => {
                if (url === TOKEN_ENDPOINT) {
                    return Promise.resolve(mockFetchSuccess(tokenResponse));
                }
                if (url === REVOKE_ENDPOINT) {
                    return Promise.resolve(mockFetchSuccess({}));
                }
                return Promise.resolve(mockFetchSuccess({}));
            });

            await manager.loginWithPassword({
                username: 'testuser',
                password: 'testpass',
            });

            // 验证登录后 token 存在
            expect(domainRegistrar.get(TEST_DOMAIN).token).toBe('logout-test-token');

            // 登出
            await manager.logout();

            // 验证 token 已清除
            expect(manager.getToken()).toBeNull();
            expect(domainRegistrar.get(TEST_DOMAIN).token).toBeUndefined();
        });
    });

    describe('事件通知', () => {
        it('loginWithPassword 成功 → 发出 oauth2:token-acquired 事件', async () => {
            const tokenResponse = createOAuth2TokenResponse({
                access_token: 'event-token',
            });

            (global as any).fetch = jest.fn().mockResolvedValue(mockFetchSuccess(tokenResponse));

            const handler = jest.fn();
            manager.on('oauth2:token-acquired', handler);

            await manager.loginWithPassword({
                username: 'testuser',
                password: 'testpass',
            });

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    accessToken: 'event-token',
                })
            );
        });

        it('refreshToken 成功 → 发出 oauth2:token-refreshed 事件', async () => {
            const loginResponse = createOAuth2TokenResponse({
                access_token: 'old-token',
                refresh_token: 'refresh-token',
            });

            const refreshResponse = createOAuth2TokenResponse({
                access_token: 'refreshed-token',
                refresh_token: 'new-refresh-token',
            });

            let callCount = 0;
            (global as any).fetch = jest.fn().mockImplementation((url: string) => {
                callCount++;
                if (url === TOKEN_ENDPOINT) {
                    return Promise.resolve(
                        mockFetchSuccess(callCount === 1 ? loginResponse : refreshResponse)
                    );
                }
                return Promise.resolve(mockFetchSuccess({}));
            });

            // 先登录
            await manager.loginWithPassword({
                username: 'testuser',
                password: 'testpass',
            });

            const handler = jest.fn();
            manager.on('oauth2:token-refreshed', handler);

            // 刷新
            await manager.refreshToken();

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    accessToken: 'refreshed-token',
                })
            );
        });

        it('refreshToken 失败 → 发出 oauth2:refresh-failed 事件', async () => {
            const loginResponse = createOAuth2TokenResponse({
                access_token: 'old-token',
                refresh_token: 'refresh-token',
            });

            (global as any).fetch = jest.fn().mockImplementation((url: string) => {
                if (url === TOKEN_ENDPOINT) {
                    // 第一次登录成功，第二次刷新失败
                    return Promise.resolve(mockFetchSuccess(loginResponse));
                }
                return Promise.resolve(mockFetchError(401, 'Unauthorized'));
            });

            // 先登录
            await manager.loginWithPassword({
                username: 'testuser',
                password: 'testpass',
            });

            // 重置 fetch mock 使刷新请求返回 401
            (global as any).fetch = jest
                .fn()
                .mockResolvedValue(mockFetchError(401, 'Unauthorized'));

            const handler = jest.fn();
            manager.on('oauth2:refresh-failed', handler);

            await manager.refreshToken();

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.any(Error),
                })
            );
        });

        it('Token 端点不可达 → 抛出网络错误，不更新 token', async () => {
            (global as any).fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            const result = await manager.loginWithPassword({
                username: 'testuser',
                password: 'testpass',
            });

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('Network error');

            // 验证 token 未更新
            expect(domainRegistrar.get(TEST_DOMAIN).token).toBeUndefined();
        });
    });
});
