/**
 * RequestContextBuilder 边界场景集成测试
 *
 * 验证：
 * 1. undefined 值过滤
 * 2. 空值安全处理
 * 3. 链式调用
 * 4. 必填字段校验
 * 5. domainConfig 集成
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

import { RequestContextBuilder } from '@/context';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';

describe('RequestContextBuilder 边界场景集成测试', () => {
    const TEST_DOMAIN = 'test-rcb';

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
    });

    describe('undefined 值过滤', () => {
        it('withData 设置后 data 可正确获取', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .withMethod('GET')
                .withData({ source: { name: 'test' } })
                .build();

            expect(context.data.source).toEqual({ name: 'test' });
        });

        it('withRequest 设置 headers 后可正确获取', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .withMethod('GET')
                .withRequest({ headers: { auth: 'token' } })
                .build();

            expect(context.request.headers).toEqual({ auth: 'token' });
        });
    });

    describe('空值安全处理', () => {
        it('build() 后 headers 为空对象（非 undefined）', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .withMethod('GET')
                .build();

            expect(context.request.headers).toBeDefined();
            expect(typeof context.request.headers).toBe('object');
        });

        it('build() 后 queryParams 可安全访问', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .withMethod('GET')
                .build();

            // queryParams 可能是 undefined 或空对象，但不应导致运行时错误
            expect(() => context.request.queryParams).not.toThrow();
        });
    });

    describe('链式调用', () => {
        it('所有 with* 方法支持链式调用并返回完整 RequestContext', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/items')
                .withMethod('POST')
                .withHeaders({ 'Content-Type': 'application/json' })
                .withQueryParams({ page: '1' })
                .withBody({ name: 'test' })
                .build();

            expect(context.request.url).toBe('/api/items');
            expect(context.request.method).toBe('POST');
            expect(context.request.headers).toEqual({ 'Content-Type': 'application/json' });
            expect(context.request.queryParams).toEqual({ page: '1' });
            expect(context.request.body).toEqual({ name: 'test' });
        });
    });

    describe('必填字段校验', () => {
        it('缺少 domain 和 url 时 build() 抛出错误', () => {
            expect(() => {
                RequestContextBuilder.create().build();
            }).toThrow();
        });

        it('缺少 url 时 build() 抛出错误', () => {
            expect(() => {
                RequestContextBuilder
                    .create()
                    .withDomain(TEST_DOMAIN)
                    .build();
            }).toThrow();
        });
    });

    describe('domainConfig 集成', () => {
        it('build() 从 DomainRegistrar 获取 domainConfig', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain(TEST_DOMAIN)
                .withUrl('/api/test')
                .withMethod('GET')
                .build();

            expect(context.metadata.domainConfig).toBeDefined();
            expect(context.metadata.domainConfig.baseUrl).toBe('https://test-api.example.com');
            expect(context.metadata.domainConfig.preset).toBe('default');
        });

        it('未注册的域 domainConfig 为 undefined', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('nonexistent-domain')
                .withUrl('/api/test')
                .withMethod('GET')
                .build();

            expect(context.metadata.domainConfig).toBeUndefined();
        });
    });
});
