/**
 * HTTP 管道集成测试
 *
 * 验证 HttpClient → HttpExecutor → HttpActionRegistrar Pipeline → RequestContextBuilder
 * 的完整数据流，使用真实的 handler 串联而非 mock 隔离。
 *
 * 覆盖之前单元测试遗漏的跨 handler 数据传递：
 * 1. RequestContextBuilder.build() 从 DomainRegistrar 获取 domainConfig
 * 2. CommonParamsEnricher 从 domainConfig.commonParams 合并参数
 * 3. TokenInjector 从 domainConfig.token 注入 Authorization
 * 4. UrlBuilder 从 domainConfig.baseUrl 构建完整 URL
 * 5. FetchTransport 使用 UrlBuilder 构建的 URL 发送请求
 * 6. ResponseAnalyzer 设置 isJson 标志供 DataParser 使用
 * 7. DataParser 根据 isJson 标志选择解析方式
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

import { HttpClient } from '@/http/HttpClient';
import { HttpExecutor } from '@/http/HttpExecutor';
import { HttpActionRegistrar, HttpActionCategory } from '@/http/HttpActionRegistrar';
import { RequestContextBuilder } from '@/context/RequestContextBuilder';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import type { RequestContext } from '@/context';

// ============================================
// 辅助：注册测试域
// ============================================

const TEST_DOMAIN = 'http-integration-test';

function ensureTestDomain(overrides: Record<string, any> = {}): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (domainRegistrar) {
        if (domainRegistrar.get(TEST_DOMAIN)) {
            domainRegistrar.unregister(TEST_DOMAIN);
        }
        domainRegistrar.register(TEST_DOMAIN, {
            baseUrl: 'http://localhost:9999',
            preset: 'default',
            pageSize: 10,
            pagesizes: [10, 20, 50],
            ...overrides,
        });
    }
}

function removeTestDomain(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (domainRegistrar) {
        domainRegistrar.unregister(TEST_DOMAIN);
    }
}

// ============================================
// 辅助：mock global fetch
// ============================================

function mockFetchSuccess(responseData: any, status = 200, headers: Record<string, string> = {}): void {
    const mockHeaders = new Map(Object.entries(headers));
    (global as any).fetch = jest.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        headers: {
            forEach: (cb: (v: string, k: string) => void) => mockHeaders.forEach((v, k) => cb(v, k)),
        },
        json: async () => responseData,
        text: async () => JSON.stringify(responseData),
        blob: async () => new Blob([JSON.stringify(responseData)]),
    });
}

function mockFetchError(error: Error): void {
    (global as any).fetch = jest.fn().mockRejectedValue(error);
}

// ============================================
// 辅助：注册最小 HTTP 管道
// ============================================

function registerMinimalPipeline(): void {
    const registrar = HttpActionRegistrar.getInstance();
    registrar.clear();

    // 只注册 PREPARE + PROCESS 阶段，跳过 EXCHANGE（用 mock fetch 替代）
    // 这样可以测试 handler 间的数据传递，而不依赖真实网络

    // PREPARE: CommonParamsEnricher + TokenInjector + UrlBuilder
    const { CommonParamsEnricherHandler } = require('@/http/actions/prepare/CommonParamsEnricher');
    const { TokenInjectorHandler } = require('@/http/actions/prepare/TokenInjector');
    const { UrlBuilderHandler } = require('@/http/actions/prepare/UrlBuilder');

    registrar.registerAll([
        {
            name: 'CommonParamsEnricher',
            category: HttpActionCategory.PREPARE,
            offset: 10,
            handler: CommonParamsEnricherHandler,
        },
        {
            name: 'TokenInjector',
            category: HttpActionCategory.PREPARE,
            offset: 15,
            handler: TokenInjectorHandler,
        },
        {
            name: 'UrlBuilder',
            category: HttpActionCategory.PREPARE,
            offset: 20,
            handler: UrlBuilderHandler,
        },
    ]);

    // EXCHANGE: FetchTransport
    const { FetchTransportHandler } = require('@/http/actions/exchange/FetchTransport');
    registrar.register({
        name: 'FetchTransport',
        category: HttpActionCategory.EXCHANGE,
        offset: 10,
        handler: FetchTransportHandler,
    });

    // PROCESS: ResponseAnalyzer + DataParser
    const { ResponseAnalyzerHandler } = require('@/http/actions/process/ResponseAnalyzer');
    const { DataParserHandler } = require('@/http/actions/process/DataParser');

    registrar.registerAll([
        {
            name: 'ResponseAnalyzer',
            category: HttpActionCategory.PROCESS,
            offset: 10,
            handler: ResponseAnalyzerHandler,
        },
        {
            name: 'DataParser',
            category: HttpActionCategory.PROCESS,
            offset: 20,
            handler: DataParserHandler,
        },
    ]);
}

// ============================================
// 测试
// ============================================

describe('HTTP 管道集成测试', () => {
    beforeEach(() => {
        ensureTestDomain();
        registerMinimalPipeline();
    });

    afterEach(() => {
        removeTestDomain();
        jest.restoreAllMocks();
        (global as any).fetch?.mockClear?.();
    });

    // ========================================
    // 1. RequestContextBuilder + DomainRegistrar 集成
    // ========================================

    describe('RequestContextBuilder + DomainRegistrar', () => {
        it('build() 应该从 DomainRegistrar 获取 domainConfig 并存入 metadata', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .build();

            expect(context.metadata.domainConfig).toBeDefined();
            expect(context.metadata.domainConfig.baseUrl).toBe('http://localhost:9999');
        });

        it('build() domain 未注册时 domainConfig 应该为 undefined', () => {
            removeTestDomain();

            const context = RequestContextBuilder
                .create()
                .withDomain('nonexistent-domain')
                .withUrl('/api/test')
                .build();

            expect(context.metadata.domainConfig).toBeUndefined();
        });

        it('build() domainConfig 应该包含 token 配置', () => {
            removeTestDomain();
            ensureTestDomain({ token: 'test-jwt-token', authInjector: 'bearer' });

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .build();

            expect(context.metadata.domainConfig.token).toBe('test-jwt-token');
            expect(context.metadata.domainConfig.authInjector).toBe('bearer');
        });

        it('build() domainConfig 应该包含 commonParams', () => {
            removeTestDomain();
            ensureTestDomain({ commonParams: { appId: 'my-app', version: '1.0' } });

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .build();

            expect(context.metadata.domainConfig.commonParams).toEqual({ appId: 'my-app', version: '1.0' });
        });
    });

    // ========================================
    // 2. PREPARE 阶段 handler 间数据传递
    // ========================================

    describe('PREPARE 阶段集成', () => {
        it('CommonParamsEnricher 应该合并 domainConfig.commonParams 到 queryParams', async () => {
            removeTestDomain();
            ensureTestDomain({ commonParams: { appId: 'my-app' } });

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .withQueryParams({ page: 1 })
                .build();

            // 执行 CommonParamsEnricher
            const { CommonParamsEnricherHandler } = require('@/http/actions/prepare/CommonParamsEnricher');
            await CommonParamsEnricherHandler(context);

            expect(context.request.queryParams!.appId).toBe('my-app');
            expect(context.request.queryParams!.page).toBe(1);
        });

        it('TokenInjector 应该从 domainConfig.token 注入 Authorization header', async () => {
            removeTestDomain();
            ensureTestDomain({ token: 'my-jwt', authInjector: 'bearer' });

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .build();

            const { TokenInjectorHandler } = require('@/http/actions/prepare/TokenInjector');
            await TokenInjectorHandler(context);

            expect(context.request.headers['Authorization']).toBe('Bearer my-jwt');
        });

        it('TokenInjector 使用 basic 模式应该注入 Basic header', async () => {
            removeTestDomain();
            ensureTestDomain({ token: 'base64creds', authInjector: 'basic' });

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .build();

            const { TokenInjectorHandler } = require('@/http/actions/prepare/TokenInjector');
            await TokenInjectorHandler(context);

            expect(context.request.headers['Authorization']).toBe('Basic base64creds');
        });

        it('UrlBuilder 应该从 domainConfig.baseUrl 构建完整 URL', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/users')  // UrlBuilder 会用 baseUrl + pathParams 覆盖
                .withRequest({ pathParams: ['api', 'users'] } as any)
                .withQueryParams({ page: 1, size: 10 })
                .build();

            const { UrlBuilderHandler } = require('@/http/actions/prepare/UrlBuilder');
            await UrlBuilderHandler(context);

            expect(context.request.url).toContain('http://localhost:9999');
            expect(context.request.url).toContain('api/users');
            expect(context.request.url).toContain('page=1');
            expect(context.request.url).toContain('size=10');
        });

        it('UrlBuilder 没有 domainConfig 时应该使用相对路径', async () => {
            removeTestDomain();

            const context = RequestContextBuilder
                .create()
                .withDomain('no-config-domain')
                .withUrl('/api/users')
                .withRequest({ pathParams: ['api', 'users'] } as any)
                .withQueryParams({ page: 1 })
                .build();

            const { UrlBuilderHandler } = require('@/http/actions/prepare/UrlBuilder');
            await UrlBuilderHandler(context);

            expect(context.request.url).toContain('api/users');
            expect(context.request.url).toContain('page=1');
            expect(context.request.url).not.toContain('http://localhost');
        });

        it('完整 PREPARE 阶段：commonParams + token + url 串联', async () => {
            removeTestDomain();
            ensureTestDomain({
                baseUrl: 'http://api.example.com',
                token: 'jwt-123',
                authInjector: 'bearer',
                commonParams: { appId: 'test-app' },
            });

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/users')
                .withRequest({ pathParams: ['api', 'users'] } as any)
                .withQueryParams({ page: 1 })
                .build();

            // 按顺序执行 PREPARE handlers
            const { CommonParamsEnricherHandler } = require('@/http/actions/prepare/CommonParamsEnricher');
            const { TokenInjectorHandler } = require('@/http/actions/prepare/TokenInjector');
            const { UrlBuilderHandler } = require('@/http/actions/prepare/UrlBuilder');

            await CommonParamsEnricherHandler(context);
            await TokenInjectorHandler(context);
            await UrlBuilderHandler(context);

            // 验证 commonParams 合并
            expect(context.request.queryParams!.appId).toBe('test-app');
            expect(context.request.queryParams!.page).toBe(1);

            // 验证 token 注入
            expect(context.request.headers['Authorization']).toBe('Bearer jwt-123');

            // 验证 URL 构建（包含 commonParams 和原始 queryParams）
            expect(context.request.url).toContain('http://api.example.com');
            expect(context.request.url).toContain('api/users');
            expect(context.request.url).toContain('appId=test-app');
            expect(context.request.url).toContain('page=1');
        });
    });

    // ========================================
    // 3. EXCHANGE + PROCESS 阶段集成
    // ========================================

    describe('EXCHANGE + PROCESS 阶段集成', () => {
        it('FetchTransport + ResponseAnalyzer + DataParser 串联处理 JSON 响应', async () => {
            const responseData = { items: [{ id: 1, name: 'Test' }], totalCount: 1 };
            mockFetchSuccess(responseData, 200, { 'content-type': 'application/json' });

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('http://localhost:9999/api/users')
                .withMethod('GET')
                .build();

            // 执行 EXCHANGE
            const { FetchTransportHandler } = require('@/http/actions/exchange/FetchTransport');
            await FetchTransportHandler(context);

            // 验证 FetchTransport 填充了物理响应
            expect(context.response.status).toBe(200);
            expect(context.response.isSuccess).toBe(true);
            expect(context.response.rawResponse).toBeDefined();

            // 执行 PROCESS
            const { ResponseAnalyzerHandler } = require('@/http/actions/process/ResponseAnalyzer');
            const { DataParserHandler } = require('@/http/actions/process/DataParser');

            await ResponseAnalyzerHandler(context);

            // 验证 ResponseAnalyzer 设置了 isJson 标志
            expect(context.metadata.isJson).toBe(true);

            await DataParserHandler(context);

            // 验证 DataParser 根据 isJson 标志解析了 JSON
            expect(context.data.raw).toEqual(responseData);
            expect(context.response.data).toEqual(responseData);
            expect(context.data.source).toEqual(responseData);
        });

        it('ResponseAnalyzer 应该标记 4xx 为错误但不中断', async () => {
            mockFetchSuccess({ error: 'Not Found' }, 404, { 'content-type': 'application/json' });

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('http://localhost:9999/api/users/999')
                .withMethod('GET')
                .build();

            const { FetchTransportHandler } = require('@/http/actions/exchange/FetchTransport');
            const { ResponseAnalyzerHandler } = require('@/http/actions/process/ResponseAnalyzer');

            await FetchTransportHandler(context);
            await ResponseAnalyzerHandler(context);

            expect(context.error).toBeDefined();
            expect(context.error.message).toContain('404');
            expect(context.metadata.isJson).toBe(true);
        });

        it('FetchTransport 网络错误应该设置 isTransportFailure', async () => {
            mockFetchError(new TypeError('Failed to fetch'));

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('http://localhost:9999/api/users')
                .withMethod('GET')
                .build();

            const { FetchTransportHandler } = require('@/http/actions/exchange/FetchTransport');
            await FetchTransportHandler(context);

            expect(context.metadata.isTransportFailure).toBe(true);
            expect(context.error).toBeDefined();
        });

        it('DataParser 在 isTransportFailure 时应该跳过解析', async () => {
            mockFetchError(new TypeError('Failed to fetch'));

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('http://localhost:9999/api/users')
                .withMethod('GET')
                .build();

            const { FetchTransportHandler } = require('@/http/actions/exchange/FetchTransport');
            const { ResponseAnalyzerHandler } = require('@/http/actions/process/ResponseAnalyzer');
            const { DataParserHandler } = require('@/http/actions/process/DataParser');

            await FetchTransportHandler(context);
            await ResponseAnalyzerHandler(context);
            await DataParserHandler(context);

            // DataParser 应该跳过，data.raw 保持 null
            expect(context.data.raw).toBeNull();
        });
    });

    // ========================================
    // 4. HttpExecutor 完整管道执行
    // ========================================

    describe('HttpExecutor 完整管道', () => {
        it('execute() 应该按顺序执行所有注册的 handler', async () => {
            const responseData = { result: { items: [{ id: 1 }], totalCount: 1 } };
            mockFetchSuccess(responseData, 200, { 'content-type': 'application/json' });

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/users')
                .withQueryParams({ page: 1 })
                .build();

            const executor = new HttpExecutor();
            const result = await executor.execute(context);

            expect(result.success).toBe(true);
            expect(result.context.response.status).toBe(200);
            expect(result.context.data.raw).toEqual(responseData);
        });

        it('execute() domainConfig 缺失时应该仍然成功（使用相对 URL）', async () => {
            removeTestDomain();

            const responseData = { items: [] };
            mockFetchSuccess(responseData, 200, { 'content-type': 'application/json' });

            const context = RequestContextBuilder
                .create()
                .withDomain('no-config')
                .withUrl('/api/users')
                .build();

            const executor = new HttpExecutor();
            const result = await executor.execute(context);

            expect(result.success).toBe(true);
        });

        it('execute() 网络错误应该返回 success=false', async () => {
            mockFetchError(new TypeError('Failed to fetch'));

            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/users')
                .build();

            const executor = new HttpExecutor();
            const result = await executor.execute(context);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    // ========================================
    // 5. HttpClient 端到端
    // ========================================

    describe('HttpClient 端到端', () => {
        it('get() 应该完成完整的请求-响应周期', async () => {
            const responseData = { users: [{ id: 1, name: 'Alice' }] };
            mockFetchSuccess(responseData, 200, { 'content-type': 'application/json' });

            const client = new HttpClient(TEST_DOMAIN);
            const task = client.get('/api/users', { queryParams: { page: 1 } });
            const context = await task.context;

            expect(context.response.status).toBe(200);
            expect(context.response.isSuccess).toBe(true);
            expect(context.data.raw).toEqual(responseData);
        });

        it('post() 应该发送请求体并接收响应', async () => {
            const responseData = { id: 2, name: 'Bob' };
            mockFetchSuccess(responseData, 201, { 'content-type': 'application/json' });

            const client = new HttpClient(TEST_DOMAIN);
            const task = client.post('/api/users', { name: 'Bob' });
            const context = await task.context;

            expect(context.response.status).toBe(201);
            expect(context.data.raw).toEqual(responseData);

            // 验证 fetch 被正确调用
            expect((global as any).fetch).toHaveBeenCalledTimes(1);
            const [url, options] = (global as any).fetch.mock.calls[0];
            expect(options.method).toBe('POST');
            expect(JSON.parse(options.body)).toEqual({ name: 'Bob' });
        });
    });
});
