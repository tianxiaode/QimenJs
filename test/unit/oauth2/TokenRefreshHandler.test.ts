/**
 * TokenRefreshHandler 单元测试
 *
 * 覆盖：
 * 1. 非 401 响应直接跳过
 * 2. 刷新请求自身不触发
 * 3. 无 token 的匿名请求不触发
 * 4. 已尝试刷新不递归
 * 5. 刷新失败保持错误状态
 * 6. 刷新成功重新执行请求并写回 context
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

jest.mock('@/oauth2/OAuth2Manager', () => ({
    oauth2: {
        refreshToken: jest.fn(),
        emit: jest.fn(),
    },
}));

jest.mock('@/http/HttpExecutor', () => ({
    HttpExecutor: jest.fn().mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue({
            context: {
                response: { status: 200, isSuccess: true, headers: {}, data: { result: 'ok' } },
                error: null,
                data: { result: 'ok' },
                metadata: { _refreshAttempted: true },
            },
            success: true,
        }),
    })),
}));

import { TokenRefreshHandler } from '@/oauth2/TokenRefreshHandler';
import { oauth2 } from '@/oauth2/OAuth2Manager';
import { HttpExecutor } from '@/http/HttpExecutor';

function createContext(overrides: Record<string, any> = {}): any {
    return {
        response: { status: 401 },
        metadata: {
            domainConfig: { token: 'test-token' },
            _refreshAttempted: false,
            ...overrides.metadata,
        },
        identity: { domain: 'test-domain' },
        error: null,
        data: null,
        ...overrides,
    };
}

describe('TokenRefreshHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('非 401 响应应直接跳过', async () => {
        const context = createContext({ response: { status: 200 } });
        await TokenRefreshHandler(context);
        expect(oauth2.emit).not.toHaveBeenCalled();
    });

    it('刷新请求自身（isTokenRefresh）不应触发', async () => {
        const context = createContext({
            metadata: { isTokenRefresh: true, domainConfig: { token: 'test' } },
        });
        await TokenRefreshHandler(context);
        expect(oauth2.emit).not.toHaveBeenCalled();
    });

    it('无 token 的匿名请求不应触发', async () => {
        const context = createContext({ metadata: { domainConfig: {} } });
        await TokenRefreshHandler(context);
        expect(oauth2.emit).not.toHaveBeenCalled();
    });

    it('已尝试刷新（_refreshAttempted）不应递归', async () => {
        const context = createContext({
            metadata: { _refreshAttempted: true, domainConfig: { token: 'test' } },
        });
        await TokenRefreshHandler(context);
        expect(oauth2.emit).not.toHaveBeenCalled();
    });

    it('应发出 token-expired 事件', async () => {
        (oauth2.refreshToken as jest.Mock).mockResolvedValueOnce(false);
        const context = createContext();
        await TokenRefreshHandler(context);
        expect(oauth2.emit).toHaveBeenCalledWith('oauth2:token-expired', { domain: 'test-domain' });
    });

    it('刷新失败应保持错误状态', async () => {
        (oauth2.refreshToken as jest.Mock).mockResolvedValueOnce(false);
        const context = createContext();
        await TokenRefreshHandler(context);
        // context 不应被修改
        expect(context.response.status).toBe(401);
    });

    it('刷新成功应重新执行请求并写回 context', async () => {
        (oauth2.refreshToken as jest.Mock).mockResolvedValueOnce(true);

        const mockExecute = jest.fn().mockResolvedValue({
            context: {
                response: { status: 200, isSuccess: true, headers: {}, data: { result: 'ok' } },
                error: null,
                data: { result: 'ok' },
                metadata: { _refreshAttempted: true, isErrorHandled: false },
            },
            success: true,
        });
        (HttpExecutor as jest.Mock).mockImplementationOnce(() => ({
            execute: mockExecute,
        }));

        const context = createContext();
        await TokenRefreshHandler(context);

        expect(mockExecute).toHaveBeenCalled();
        expect(context.response.status).toBe(200);
        expect(context.data).toEqual({ result: 'ok' });
        expect(context.error).toBeNull();
    });
});
