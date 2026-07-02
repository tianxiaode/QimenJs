/**
 * EntityManager 集成测试
 *
 * 用真实组件实例验证完整调用链路，而非 mock 隔离。
 * 覆盖之前单元测试遗漏的跨组件集成问题：
 * 1. FlatRemoteEntityState 缺少 updateData/toParams/updateItem/isValidPage
 * 2. FlatRemoteListAbility 防抖不返回异步结果
 * 3. RequestContextBuilder.withRequest 传 undefined 覆盖默认值
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
import { FlatRemoteEntityState } from '@/entity/state/FlatRemoteEntityState';
import { SchemaRegistrar } from '@/schema';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { ENTITY_ACTION } from '@/entity/types';
import type { FlatSchema, RegistrSchema } from '@/schema';
import type { RequestContext } from '@/context';

// ============================================
// 测试用 Schema
// ============================================

const testSchema: FlatSchema = {
    name: 'TestUser',
    domain: 'test-integration',
    idField: 'id',
    isTree: false,
    searchFields: ['name', 'email'],
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string', searchable: true },
        { name: 'email', type: 'string', searchable: true },
    ],
};

// ============================================
// 测试用 EntityManager（真实子类）
// ============================================

class TestUserManager extends RemoteCrudEntityManager {
    domain = 'test-integration';
    entityName = 'TestUser';
    url = '/api/test-users';
    schema: RegistrSchema = testSchema;
    state!: FlatRemoteEntityState;

    constructor() {
        super();
        this.state = new FlatRemoteEntityState(this.compiledSchema, 300000);
    }
}

// ============================================
// 辅助：注册测试域
// ============================================

function ensureTestDomain(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (domainRegistrar && !domainRegistrar.get('test-integration')) {
        domainRegistrar.register('test-integration', {
            baseUrl: 'http://localhost:9999',
            preset: 'default',
            pageSize: 10,
            pagesizes: [10, 20, 50],
        });
    }
}

// ============================================
// 辅助：mock fetch 返回数据
// ============================================

function mockFetchReturn(data: { list: any[]; total: number }): void {
    jest.spyOn(TestUserManager.prototype, 'fetch').mockImplementation(async () => {
        return {
            data: { list: data.list, total: data.total },
            metadata: { hasError: false },
        } as any;
    });
}

function mockFetchError(error: any): void {
    jest.spyOn(TestUserManager.prototype, 'fetch').mockImplementation(async () => {
        throw error;
    });
}

// ============================================
// 测试
// ============================================

describe('EntityManager 集成测试', () => {
    let manager: TestUserManager;

    beforeEach(() => {
        ensureTestDomain();
        // 注册 schema
        const schemaRegistrar = SchemaRegistrar.getInstance();
        if (!schemaRegistrar.has('TestUser')) {
            schemaRegistrar.register(testSchema);
        }
        manager = new TestUserManager();
    });

    afterEach(() => {
        manager.dispose();
        jest.restoreAllMocks();
    });

    // ========================================
    // 1. FlatRemoteEntityState 方法集成
    // ========================================

    describe('FlatRemoteEntityState 方法可用性', () => {
        it('state 应该有 updateData 方法', () => {
            expect(typeof manager.state.updateData).toBe('function');
        });

        it('state 应该有 toParams 方法', () => {
            expect(typeof manager.state.toParams).toBe('function');
        });

        it('state 应该有 updateItem 方法', () => {
            expect(typeof manager.state.updateItem).toBe('function');
        });

        it('state 应该有 isValidPage 方法', () => {
            expect(typeof manager.state.isValidPage).toBe('function');
        });

        it('updateData 应该正确更新 items 和分页信息', () => {
            const users = [
                { id: '1', name: 'Alice', email: 'alice@test.com' },
                { id: '2', name: 'Bob', email: 'bob@test.com' },
            ];

            manager.state.updateData(users, 100);

            expect(manager.state.items).toEqual(users);
            expect(manager.state.total).toBe(100);
            expect(manager.state.pages).toBe(5); // 100 / 20
            expect(manager.state.hasMore).toBe(true); // page 1 < pages 5
        });

        it('updateData 不传 total 时应该用 items 长度', () => {
            const users = [
                { id: '1', name: 'Alice', email: 'alice@test.com' },
            ];

            manager.state.updateData(users);

            expect(manager.state.total).toBe(1);
        });

        it('updateData 传空 list 时应该安全处理', () => {
            manager.state.updateData(null as any, 0);

            expect(manager.state.items).toEqual([]);
            expect(manager.state.total).toBe(0);
        });

        it('updateItem 应该更新当前 item 并同步到 items', () => {
            const users = [
                { id: '1', name: 'Alice', email: 'alice@test.com' },
            ];
            manager.state.updateData(users);

            const updated = { id: '1', name: 'Alice Smith', email: 'alice.smith@test.com' };
            manager.state.updateItem(updated);

            expect(manager.state.item).toEqual(updated);
            expect(manager.state.items[0]).toEqual(updated);
        });

        it('updateItem 传 null 时应该安全处理', () => {
            manager.state.updateItem(null);
            expect(manager.state.item).toBeNull();
        });

        it('isValidPage 应该正确验证页码', () => {
            manager.state.updateData([], 100); // 5 pages

            expect(manager.state.isValidPage(1)).toBe(true);
            expect(manager.state.isValidPage(5)).toBe(true);
            expect(manager.state.isValidPage(0)).toBe(false);
            expect(manager.state.isValidPage(6)).toBe(false);
        });

        it('toParams 应该返回包含 page 和 pageSize 的参数', () => {
            const params = manager.state.toParams();

            expect(params.page).toBe(1);
            expect(params.pageSize).toBe(20);
        });
    });

    // ========================================
    // 2. FlatRemoteListAbility 集成
    // ========================================

    describe('FlatRemoteListAbility 集成', () => {
        it('list() 应该返回数组而非 undefined', async () => {
            const users = [
                { id: '1', name: 'Alice', email: 'alice@test.com' },
                { id: '2', name: 'Bob', email: 'bob@test.com' },
            ];
            mockFetchReturn({ list: users, total: 2 });

            const result = await manager.list();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });

        it('list() 返回的数据应该同步到 state.items', async () => {
            const users = [
                { id: '1', name: 'Alice', email: 'alice@test.com' },
            ];
            mockFetchReturn({ list: users, total: 1 });

            await manager.list();

            expect(manager.state.items).toEqual(users);
            expect(manager.state.total).toBe(1);
        });

        it('list() 返回空数据时应该安全处理', async () => {
            mockFetchReturn({ list: [], total: 0 });

            const result = await manager.list();

            expect(result).toEqual([]);
            expect(manager.state.items).toEqual([]);
            expect(manager.state.total).toBe(0);
        });

        it('refresh() 应该返回数组而非 undefined', async () => {
            const users = [
                { id: '1', name: 'Alice', email: 'alice@test.com' },
            ];
            mockFetchReturn({ list: users, total: 1 });

            const result = await manager.refresh();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
        });
    });

    // ========================================
    // 3. RequestContextBuilder 集成
    // ========================================

    describe('buildRequestContext 集成', () => {
        it('buildOptions 传 undefined headers 时 context.request.headers 应该是对象', async () => {
            // buildOptions 中 extra.headers 是 undefined
            const options = await manager.buildOptions(ENTITY_ACTION.LIST, { page: 1, pageSize: 20 }, null, {});

            // options.headers 可能是 undefined，但 buildRequestContext 应该处理
            const context = manager['buildRequestContext'](ENTITY_ACTION.LIST, options);

            expect(context.request.headers).toBeDefined();
            expect(typeof context.request.headers).toBe('object');
        });

        it('buildOptions 传 undefined queryParams 时 context.request.queryParams 应该安全', async () => {
            const options = await manager.buildOptions(ENTITY_ACTION.LIST, {}, null, {});
            const context = manager['buildRequestContext'](ENTITY_ACTION.LIST, options);

            // queryParams 可能为空对象或 undefined，但不应导致运行时错误
            expect(context.request).toBeDefined();
        });
    });

    // ========================================
    // 4. RemoteCreateAbility 集成
    // ========================================

    describe('RemoteCreateAbility 集成', () => {
        it('create() 应该调用 state.updateItem', async () => {
            const newUser = { id: '3', name: 'Charlie', email: 'charlie@test.com' };
            jest.spyOn(TestUserManager.prototype, 'fetch').mockImplementation(async () => {
                return {
                    data: { item: newUser, list: [], total: 0 },
                    metadata: { hasError: false },
                } as any;
            });
            jest.spyOn(manager.state, 'updateItem');

            await manager.create({ name: 'Charlie', email: 'charlie@test.com' });

            expect(manager.state.updateItem).toHaveBeenCalledWith(newUser);
            expect(manager.state.item).toEqual(newUser);
        });
    });
});
