/**
 * CoreEntityManager 独立单元测试
 *
 * 验证核心实体管理器的行为：
 * 1. request / buildRequestContext / executeDataProcessor
 * 2. getDomainConfig / getDataProcessorPreset
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

jest.mock('@/http', () => {
    const mockExecute = jest.fn().mockResolvedValue(undefined);
    return {
        HttpExecutor: jest.fn().mockImplementation(() => ({
            execute: mockExecute,
        })),
        __mockExecute: mockExecute,
    };
});

jest.mock('@/data-processor', () => ({
    DataProcessorRegistrar: jest.fn(),
    DataProcessorRegistrarName: 'DataProcessorRegistrar',
    dataProcessorExecutor: {
        execute: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('@/registry', () => ({
    RegistryHub: {
        get: jest.fn(),
    },
}));

jest.mock('@/schema', () => ({
    SchemaRegistrar: {
        getInstance: jest.fn(() => ({
            has: jest.fn().mockReturnValue(true),
            getCompiled: jest.fn().mockReturnValue({
                schema: {
                    name: 'TestEntity',
                    idField: 'id',
                    fields: [],
                },
            }),
            register: jest.fn(),
        })),
    },
}));

import { CoreEntityManager } from '@/entity/manager/CoreEntityManager';
import { RegistryHub } from '@/registry';
import { HttpExecutor } from '@/http';
import { dataProcessorExecutor } from '@/data-processor';
import type { HttpRequestOptions } from '@/http/types/http-context';

// 获取 mock 引用
const mockHttpModule = jest.requireMock('@/http');
const mockExecute = mockHttpModule.__mockExecute as jest.Mock;

// ============================================
// 辅助
// ============================================

class TestCoreEntityManager extends CoreEntityManager {
    domain = 'test-domain';
    entityName = 'TestEntity';
    url = '/api/test';
    schema: any = { name: 'TestEntity', idField: 'id', fields: [] };
}

function createManager(): TestCoreEntityManager {
    return new TestCoreEntityManager();
}

const defaultOptions: HttpRequestOptions = {
    url: '/api/test',
    method: 'GET' as any,
    body: {},
    headers: {},
    queryParams: {},
};

// ============================================
// 测试
// ============================================

describe('CoreEntityManager', () => {
    let manager: TestCoreEntityManager;

    beforeEach(() => {
        jest.clearAllMocks();
        manager = createManager();
    });

    afterEach(() => {
        manager.dispose();
    });

    describe('request', () => {
        it('应构建请求上下文并返回包含 context 和 cancel 的任务对象', () => {
            const task = manager.request('list' as any, defaultOptions);
            expect(task).toHaveProperty('context');
            expect(task).toHaveProperty('cancel');
            expect(typeof task.cancel).toBe('function');
        });

        it('执行体应依次调用 executeDataProcessor(pre)、HttpExecutor.execute()、executeDataProcessor(post)', async () => {
            const preSpy = jest.spyOn(manager as any, 'executeDataProcessor').mockResolvedValue(undefined);

            const task = manager.request('list' as any, defaultOptions);
            await task.context;

            // executeDataProcessor 被调用两次：pre 和 post
            expect(preSpy).toHaveBeenCalledTimes(2);
            expect(preSpy).toHaveBeenNthCalledWith(1, 'pre', expect.anything());
            expect(preSpy).toHaveBeenNthCalledWith(2, 'post', expect.anything());
            expect(mockExecute).toHaveBeenCalled();
        });

        it('执行失败时应调用 logger.error 并重新抛出异常', async () => {
            const error = new Error('Network error');
            mockExecute.mockRejectedValueOnce(error);
            jest.spyOn(manager as any, 'executeDataProcessor').mockResolvedValue(undefined);

            const task = manager.request('list' as any, defaultOptions);

            await expect(task.context).rejects.toThrow('Network error');
            expect(manager.logger.error).toHaveBeenCalled();
        });

        it('cancel 应调用 context.request.controller.abort()', () => {
            const task = manager.request('list' as any, defaultOptions);
            // cancel 不应抛出异常
            expect(() => task.cancel('test_reason')).not.toThrow();
        });
    });

    describe('buildRequestContext', () => {
        it('应正确设置 identity、request、schema', () => {
            const context = (manager as any).buildRequestContext('list', defaultOptions);

            expect(context.identity.domain).toBe('test-domain');
            expect(context.identity.entityName).toBe('TestEntity');
            expect(context.identity.action).toBe('list');
            expect(context.request.url).toBe('/api/test');
            expect(context.request.method).toBe('GET');
        });

        it('应使用 options 中的 headers 和 queryParams', () => {
            const options: HttpRequestOptions = {
                url: '/api/test',
                method: 'POST' as any,
                body: { key: 'value' },
                headers: { 'X-Custom': 'test' },
                queryParams: { page: 1 },
                pathParams: ['a', 'b'],
                timeout: 10000,
                responseType: 'text',
            };

            const context = (manager as any).buildRequestContext('create', options);

            expect(context.request.headers).toEqual({ 'X-Custom': 'test' });
            expect(context.request.queryParams).toEqual({ page: 1 });
            expect(context.request.pathParams).toEqual(['a', 'b']);
            expect(context.request.timeout).toBe(10000);
            expect(context.request.responseType).toBe('text');
        });

        it('未指定 timeout 和 responseType 时应使用默认值', () => {
            const context = (manager as any).buildRequestContext('list', defaultOptions);
            expect(context.request.timeout).toBe(30000);
            expect(context.request.responseType).toBe('json');
        });
    });

    describe('executeDataProcessor', () => {
        it('有 registrar 时应调用 dataProcessorExecutor.execute()', async () => {
            const mockRegistrar = {
                getPipeline: jest.fn().mockReturnValue([]),
            };
            (RegistryHub.get as jest.Mock).mockReturnValue(mockRegistrar);
            jest.spyOn(manager as any, 'getDataProcessorPreset').mockReturnValue('default');

            const context = (manager as any).buildRequestContext('list', defaultOptions);
            await (manager as any).executeDataProcessor('pre', context);

            expect(dataProcessorExecutor.execute).toHaveBeenCalledWith(context, [], 'pre');
        });

        it('无 registrar 时不应抛出异常', async () => {
            (RegistryHub.get as jest.Mock).mockReturnValue(undefined);
            jest.spyOn(manager as any, 'getDataProcessorPreset').mockReturnValue('default');

            const context = (manager as any).buildRequestContext('list', defaultOptions);
            await expect((manager as any).executeDataProcessor('pre', context)).resolves.not.toThrow();
            expect(dataProcessorExecutor.execute).not.toHaveBeenCalled();
        });
    });

    describe('getDomainConfig', () => {
        it('应从 RegistryHub 获取域配置', () => {
            const mockConfig = { baseUrl: 'http://localhost', preset: 'custom' };
            const mockDomainRegistrar = {
                get: jest.fn().mockReturnValue(mockConfig),
            };
            (RegistryHub.get as jest.Mock).mockReturnValue(mockDomainRegistrar);

            const config = (manager as any).getDomainConfig();
            expect(config).toEqual(mockConfig);
            expect(mockDomainRegistrar.get).toHaveBeenCalledWith('test-domain');
        });

        it('域注册器不存在时应返回 undefined', () => {
            (RegistryHub.get as jest.Mock).mockReturnValue(undefined);
            const config = (manager as any).getDomainConfig();
            expect(config).toBeUndefined();
        });
    });

    describe('compiledSchema', () => {
        it('Schema 未注册时应自动注册', () => {
            const { SchemaRegistrar } = jest.requireMock('@/schema');
            const mockRegister = jest.fn();
            SchemaRegistrar.getInstance.mockReturnValueOnce({
                has: jest.fn().mockReturnValue(false),
                getCompiled: jest.fn().mockReturnValue({
                    schema: { name: 'TestEntity', idField: 'id', fields: [] },
                }),
                register: mockRegister,
            });

            const schema = manager.compiledSchema;
            expect(mockRegister).toHaveBeenCalledWith(manager.schema);
        });

        it('Schema 已注册时不应重复注册', () => {
            const { SchemaRegistrar } = jest.requireMock('@/schema');
            const mockRegister = jest.fn();
            SchemaRegistrar.getInstance.mockReturnValueOnce({
                has: jest.fn().mockReturnValue(true),
                getCompiled: jest.fn().mockReturnValue({
                    schema: { name: 'TestEntity', idField: 'id', fields: [] },
                }),
                register: mockRegister,
            });

            const schema = manager.compiledSchema;
            expect(mockRegister).not.toHaveBeenCalled();
        });
    });

    describe('cancelAll', () => {
        it('应调用 logger.warn', () => {
            manager.cancelAll();
            expect(manager.logger.warn).toHaveBeenCalledWith(
                expect.stringContaining('Cancelling all requests')
            );
        });
    });

    describe('getDataProcessorPreset', () => {
        it('有域配置时返回 preset', () => {
            jest.spyOn(manager as any, 'getDomainConfig').mockReturnValue({ preset: 'custom' });
            expect((manager as any).getDataProcessorPreset()).toBe('custom');
        });

        it('无域配置时返回 default', () => {
            jest.spyOn(manager as any, 'getDomainConfig').mockReturnValue(undefined);
            expect((manager as any).getDataProcessorPreset()).toBe('default');
        });

        it('域配置无 preset 时返回 default', () => {
            jest.spyOn(manager as any, 'getDomainConfig').mockReturnValue({ baseUrl: 'http://localhost' });
            expect((manager as any).getDataProcessorPreset()).toBe('default');
        });
    });
});
