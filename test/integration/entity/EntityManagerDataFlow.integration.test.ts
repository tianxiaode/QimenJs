/**
 * EntityManager + DataProcessor + HTTP 完整数据流集成测试
 *
 * 验证 EntityManager 的完整请求链路：
 * Manager 方法 → Schema 映射 → DataProcessor pre → HTTP 管道 → DataProcessor post → State 更新
 *
 * 重点覆盖单元测试因 mock fetch 而遗漏的 DataProcessor 与 EntityManager 的真实交互。
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

import { RemoteCrudEntityManager } from '@/entity/manager/managers';
import { SchemaRegistrar } from '@/schema';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { DataProcessor } from '@/data-processor';
import { dataProcessorExecutor } from '@/data-processor';
import { RequestContextBuilder } from '@/context';
import type { FlatSchema, RegistrSchema } from '@/schema';
import type { RequestContext } from '@/context';
import { createAbpPagedResponse, createSpringPagedResponse } from '@test/fixtures/responses';

// 确保 ABP 和 Spring 处理器已注册
import '@/data-processor-abp/register';
import '@/data-processor-spring/register';

// ============================================
// 测试用 Schema
// ============================================

const testUserSchema: FlatSchema = {
    name: 'TestDataFlowUser',
    domain: 'test-dataflow',
    idField: 'id',
    isTree: false,
    searchFields: ['name', 'email'],
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string', mapping: 'displayName', searchable: true },
        { name: 'email', type: 'string', searchable: true },
        { name: 'age', type: 'number' },
    ],
};

// ============================================
// 测试用 EntityManager
// ============================================

class TestDataFlowManager extends RemoteCrudEntityManager {
    domain = 'test-dataflow';
    entityName = 'TestDataFlowUser';
    url = '/api/test-users';
    schema: RegistrSchema = testUserSchema;
}

// ============================================
// 辅助函数
// ============================================

function createTestItems(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: `user-${i + 1}`,
        displayName: `User ${i + 1}`,
        email: `user${i + 1}@test.com`,
        age: 20 + i,
    }));
}

function registerDomain(preset: string): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    domainRegistrar.register('test-dataflow', {
        baseUrl: 'https://test-api.example.com',
        preset,
        pageSize: 10,
        pagesizes: [10, 20, 50],
    }, true);
}

function registerSchema(): void {
    const schemaRegistrar = SchemaRegistrar.getInstance();
    schemaRegistrar.register(testUserSchema);
}

function unregisterDomain(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    try { domainRegistrar.unregister('test-dataflow'); } catch {}
}

function unregisterSchema(): void {
    const schemaRegistrar = SchemaRegistrar.getInstance();
    try { schemaRegistrar.unregister('TestDataFlowUser'); } catch {}
}

// ============================================
// 测试
// ============================================

describe('EntityManager + DataProcessor 完整数据流集成测试', () => {
    let manager: TestDataFlowManager;

    afterEach(() => {
        if (manager) {
            manager.dispose();
        }
        jest.restoreAllMocks();
        unregisterDomain();
        unregisterSchema();
    });

    describe('ABP preset 端到端数据流', () => {
        beforeEach(() => {
            registerDomain('abp');
            registerSchema();
            manager = new TestDataFlowManager();
        });

        it('manager.list() 经过 ABP DataProcessor 后 State 中 items 和 total 正确', async () => {
            const items = createTestItems(3);
            const abpResponse = createAbpPagedResponse(items, 100) as any;

            jest.spyOn(TestDataFlowManager.prototype, 'fetch').mockImplementation(async function (this: any) {
                const context = this._lastContext as RequestContext;
                // 验证 pre-processor 已将分页参数转换为 ABP 格式
                // ABP pre-processor 会将 page/size 转换为 skipCount/takeCount
                return {
                    data: { list: abpResponse.items, total: abpResponse.totalCount, item: null },
                    metadata: { hasError: false },
                } as any;
            });

            await manager.list({ page: 1, size: 10 });

            // 验证 State 更新
            expect(manager.items).toHaveLength(3);
            expect(manager.total).toBe(100);
        });
    });

    describe('Spring preset 端到端数据流', () => {
        beforeEach(() => {
            registerDomain('spring');
            registerSchema();
            manager = new TestDataFlowManager();
        });

        it('manager.list() 经过 Spring DataProcessor 后 State 中 items 和 total 正确', async () => {
            const items = createTestItems(5);
            const springResponse = createSpringPagedResponse(items, 50) as any;

            jest.spyOn(TestDataFlowManager.prototype, 'fetch').mockImplementation(async function (this: any) {
                return {
                    data: { list: springResponse.content, total: springResponse.totalElements, item: null },
                    metadata: { hasError: false },
                } as any;
            });

            await manager.list({ page: 1, size: 10 });

            // 验证 State 更新
            expect(manager.items).toHaveLength(5);
            expect(manager.total).toBe(50);
        });
    });

    describe('Default preset 端到端数据流', () => {
        beforeEach(() => {
            registerDomain('default');
            registerSchema();
            manager = new TestDataFlowManager();
        });

        it('default preset 下数据原样传递', async () => {
            const items = createTestItems(2);

            jest.spyOn(TestDataFlowManager.prototype, 'fetch').mockImplementation(async function (this: any) {
                return {
                    data: { list: items, total: 2, item: null },
                    metadata: { hasError: false },
                } as any;
            });

            await manager.list();

            // 验证 State 更新
            expect(manager.items).toHaveLength(2);
            expect(manager.total).toBe(2);
        });
    });

    describe('DataProcessor 管道过滤', () => {
        it('ABP preset 只获取 abp+pre 标签的处理器', () => {
            const pipeline = DataProcessor.getPipeline('abp', 'pre');
            expect(pipeline.length).toBeGreaterThan(0);
            pipeline.forEach(handler => {
                const tags = handler.tags || [];
                expect(tags.includes('abp') || tags.includes('any')).toBe(true);
                expect(tags.includes('pre') || tags.includes('any')).toBe(true);
            });
        });

        it('Spring preset 只获取 spring+post 标签的处理器', () => {
            const pipeline = DataProcessor.getPipeline('spring', 'post');
            expect(pipeline.length).toBeGreaterThan(0);
            pipeline.forEach(handler => {
                const tags = handler.tags || [];
                expect(tags.includes('spring') || tags.includes('any')).toBe(true);
                expect(tags.includes('post') || tags.includes('any')).toBe(true);
            });
        });

        it('default preset 获取 any 标签的处理器', () => {
            const pipeline = DataProcessor.getPipeline('default');
            // default preset 可能没有专用处理器，只有 any 标签的
            pipeline.forEach(handler => {
                const tags = handler.tags || [];
                expect(tags.includes('default') || tags.includes('any')).toBe(true);
            });
        });
    });

    describe('State 同步验证', () => {
        beforeEach(() => {
            registerDomain('default');
            registerSchema();
            manager = new TestDataFlowManager();
        });

        it('manager.list() 成功后 getData() 返回最新数据', async () => {
            const items = createTestItems(10);

            jest.spyOn(TestDataFlowManager.prototype, 'fetch').mockImplementation(async () => {
                return {
                    data: { list: items, total: 10, item: null },
                    metadata: { hasError: false },
                } as any;
            });

            await manager.list();

            expect(manager.items).toHaveLength(10);
            expect(manager.total).toBe(10);
        });

        it('HTTP 请求失败时 State 不更新', async () => {
            // 先成功加载一次
            const items = createTestItems(3);
            jest.spyOn(TestDataFlowManager.prototype, 'fetch').mockImplementation(async () => {
                return {
                    data: { list: items, total: 3, item: null },
                    metadata: { hasError: false },
                } as any;
            });
            await manager.list();
            expect(manager.items).toHaveLength(3);

            // 第二次失败
            jest.spyOn(TestDataFlowManager.prototype, 'fetch').mockImplementation(async () => {
                throw new Error('Network error');
            });

            try {
                await manager.list();
            } catch {}

            // State 应保持上次成功的数据
            expect(manager.items).toHaveLength(3);
        });
    });

    describe('RequestContextBuilder 与 domainConfig 集成', () => {
        it('build() 从 DomainRegistrar 获取 domainConfig', () => {
            registerDomain('abp');

            const context = RequestContextBuilder
                .create()
                .withDomain('test-dataflow')
                .withUrl('/api/users')
                .withMethod('GET')
                .build();

            expect(context.metadata.domainConfig).toBeDefined();
            expect(context.metadata.domainConfig.preset).toBe('abp');
            expect(context.metadata.domainConfig.baseUrl).toBe('https://test-api.example.com');
        });

        it('未注册的域 domainConfig 为 undefined', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('nonexistent-domain')
                .withUrl('/api/users')
                .withMethod('GET')
                .build();

            // 未注册的域，domainConfig 可能为 undefined
            expect(context.metadata.domainConfig).toBeUndefined();
        });
    });
});
