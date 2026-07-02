import { OAuth2Manager } from '@/oauth2/OAuth2Manager';
import { MemoryTokenStorage, LocalStorageTokenStorage, SessionStorageTokenStorage, createTokenStorage } from '@/oauth2/TokenStorage';
import type { OAuth2TokenEntry } from '@/oauth2/types';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock DomainRegistrar
jest.mock('@/registry/registrars/DomainRegistrar', () => {
    const instance = {
        updateToken: jest.fn(),
        clearToken: jest.fn(),
    };
    return {
        DomainRegistrar: {
            getInstance: () => instance,
        },
    };
});

// Mock HttpActionRegistrar
jest.mock('@/http', () => ({
    HttpActionRegistrar: {
        getInstance: () => ({
            register: jest.fn(),
        }),
    },
    HttpActionCategory: { PREPARE: 100, EXCHANGE: 200, PROCESS: 300, ALIGN: 400 },
}));

function createManager(): OAuth2Manager {
    return new OAuth2Manager();
}

function tokenResponse(overrides: Partial<any> = {}): any {
    return {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        scope: 'openid profile',
        ...overrides,
    };
}

describe('OAuth2Manager', () => {
    let manager: OAuth2Manager;

    beforeEach(() => {
        manager = createManager();
        mockFetch.mockReset();
    });

    describe('configure', () => {
        test('应该保存配置', () => {
            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
            });
            expect(manager.isAuthenticated()).toBe(false);
        });
    });

    describe('loginWithPassword', () => {
        test('应该成功登录', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(tokenResponse()),
            });

            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
            });

            const result = await manager.loginWithPassword({
                username: 'admin',
                password: '123456',
            });

            expect(result.success).toBe(true);
            expect(result.accessToken).toBe('test-access-token');
            expect(manager.isAuthenticated()).toBe(true);
        });

        test('应该处理登录失败', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({
                    error: 'invalid_grant',
                    error_description: 'Invalid username or password',
                }),
            });

            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
            });

            const result = await manager.loginWithPassword({
                username: 'admin',
                password: 'wrong',
            });

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('invalid_grant');
        });

        test('未配置时应该返回错误', async () => {
            const result = await manager.loginWithPassword({
                username: 'admin',
                password: '123456',
            });

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('not configured');
        });
    });

    describe('loginWithCode', () => {
        test('应该用授权码换 token', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(tokenResponse()),
            });

            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                redirectUri: 'https://app.example.com/callback',
                domain: 'api',
            });

            const result = await manager.loginWithCode('auth-code-123');

            expect(result.success).toBe(true);

            // 验证请求参数
            const callBody = mockFetch.mock.calls[0][1].body;
            expect(callBody).toContain('grant_type=authorization_code');
            expect(callBody).toContain('code=auth-code-123');
        });

        test('没有 redirectUri 时应该返回错误', async () => {
            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
            });

            const result = await manager.loginWithCode('code');

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('redirectUri');
        });
    });

    describe('loginWithClientCredentials', () => {
        test('应该用客户端凭证获取 token', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(tokenResponse({ refresh_token: undefined })),
            });

            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                clientSecret: 'secret',
                domain: 'api',
            });

            const result = await manager.loginWithClientCredentials();

            expect(result.success).toBe(true);

            const callBody = mockFetch.mock.calls[0][1].body;
            expect(callBody).toContain('grant_type=client_credentials');
            expect(callBody).toContain('client_secret=secret');
        });
    });

    describe('refreshToken', () => {
        test('应该成功刷新 token', async () => {
            // 先登录
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(tokenResponse()),
            });

            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
            });

            await manager.loginWithPassword({ username: 'admin', password: '123' });

            // 刷新
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(tokenResponse({
                    access_token: 'new-access-token',
                    refresh_token: 'new-refresh-token',
                })),
            });

            const result = await manager.refreshToken();

            expect(result).toBe(true);
            expect(manager.getToken()).toBe('new-access-token');
        });

        test('没有 refresh token 时应该返回 false', async () => {
            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
            });

            const result = await manager.refreshToken();

            expect(result).toBe(false);
        });

        test('并发刷新应该去重', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(tokenResponse()),
            });

            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
            });

            await manager.loginWithPassword({ username: 'admin', password: '123' });

            // 登录已经调用了一次 fetch，重置计数
            mockFetch.mockReset();

            // 模拟慢速刷新
            let resolveRefresh: (value: any) => void;
            const slowPromise = new Promise(resolve => { resolveRefresh = resolve; });

            mockFetch.mockImplementationOnce(() => slowPromise);

            // 同时发起两次刷新
            const p1 = manager.refreshToken();
            const p2 = manager.refreshToken();

            // 只调用了一次 fetch（去重）
            expect(mockFetch).toHaveBeenCalledTimes(1);

            // 解除阻塞
            resolveRefresh!({
                ok: true,
                json: () => Promise.resolve(tokenResponse({ access_token: 'refreshed' })),
            });

            const [r1, r2] = await Promise.all([p1, p2]);
            expect(r1).toBe(true);
            expect(r2).toBe(true);
        });
    });

    describe('logout', () => {
        test('应该清除 token', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(tokenResponse()),
            });

            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
            });

            await manager.loginWithPassword({ username: 'admin', password: '123' });
            expect(manager.isAuthenticated()).toBe(true);

            await manager.logout();
            expect(manager.isAuthenticated()).toBe(false);
        });
    });

    describe('getToken', () => {
        test('过期 token 应该返回 null', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(tokenResponse({ expires_in: 1 })),
            });

            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
                refreshBuffer: 0,
            });

            await manager.loginWithPassword({ username: 'admin', password: '123' });

            // 模拟时间流逝
            const entry = (manager as any).storage.get();
            entry.acquiredAt = Date.now() - 2000; // 2 秒前获取，1 秒过期

            expect(manager.getToken()).toBeNull();
        });
    });

    describe('getAuthorizationUrl', () => {
        test('应该生成正确的授权 URL', () => {
            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                authorizationEndpoint: 'https://auth.example.com/authorize',
                clientId: 'test-client',
                redirectUri: 'https://app.example.com/callback',
                scopes: ['openid', 'profile'],
                domain: 'api',
            });

            const url = manager.getAuthorizationUrl('random-state');

            expect(url).toContain('https://auth.example.com/authorize?');
            expect(url).toContain('response_type=code');
            expect(url).toContain('client_id=test-client');
            expect(url).toContain('redirect_uri=');
            expect(url).toContain('scope=openid+profile');
            expect(url).toContain('state=random-state');
        });
    });

    describe('events', () => {
        test('应该触发 token-acquired 事件', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(tokenResponse()),
            });

            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
            });

            const handler = jest.fn();
            manager.on('oauth2:token-acquired', handler);

            await manager.loginWithPassword({ username: 'admin', password: '123' });

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({ accessToken: 'test-access-token' }),
            );
        });

        test('应该触发 refresh-failed 事件', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(tokenResponse()),
            });

            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
            });

            await manager.loginWithPassword({ username: 'admin', password: '123' });

            // 刷新失败
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: 'invalid_grant' }),
            });

            const handler = jest.fn();
            manager.on('oauth2:refresh-failed', handler);

            await manager.refreshToken();

            expect(handler).toHaveBeenCalled();
        });

        test('取消监听后不应该再触发', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(tokenResponse()),
            });

            manager.configure({
                tokenEndpoint: 'https://auth.example.com/token',
                clientId: 'test-client',
                domain: 'api',
            });

            const handler = jest.fn();
            const off = manager.on('oauth2:token-acquired', handler);
            off();

            await manager.loginWithPassword({ username: 'admin', password: '123' });

            expect(handler).not.toHaveBeenCalled();
        });
    });
});

describe('TokenStorage', () => {
    describe('MemoryTokenStorage', () => {
        test('应该存取 token', () => {
            const storage = new MemoryTokenStorage();
            const entry: OAuth2TokenEntry = {
                accessToken: 'test-token',
                acquiredAt: Date.now(),
            };

            storage.set(entry);
            expect(storage.get()?.accessToken).toBe('test-token');
        });

        test('应该清除 token', () => {
            const storage = new MemoryTokenStorage();
            storage.set({ accessToken: 'test', acquiredAt: Date.now() });
            storage.clear();
            expect(storage.get()).toBeNull();
        });

        test('空存储应该返回 null', () => {
            const storage = new MemoryTokenStorage();
            expect(storage.get()).toBeNull();
        });
    });

    describe('createTokenStorage', () => {
        test('默认创建 MemoryTokenStorage', () => {
            const storage = createTokenStorage();
            expect(storage).toBeInstanceOf(MemoryTokenStorage);
        });

        test('localStorage 类型创建 LocalStorageTokenStorage', () => {
            const storage = createTokenStorage('localStorage');
            expect(storage).toBeInstanceOf(LocalStorageTokenStorage);
        });

        test('sessionStorage 类型创建 SessionStorageTokenStorage', () => {
            const storage = createTokenStorage('sessionStorage');
            expect(storage).toBeInstanceOf(SessionStorageTokenStorage);
        });
    });
});
