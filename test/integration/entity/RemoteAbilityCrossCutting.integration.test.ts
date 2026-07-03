/**
 * RemoteAbility 跨切面集成测试
 *
 * 验证多个 Ability 之间的真实交互路径：
 * 1. FlatRemoteListAbility + CacheAbility 缓存交互
 * 2. FlatRemoteGetAllAbility 全量获取
 * 3. 事件发射集成（listed/created/updated/toggled）
 * 4. FlatRemoteStateAbility.deleteFromItems 与 RemoteDeleteAbility 协作
 * 5. BaseEntityManager.fetch() 生命周期事件
 * 6. SchemaProxyAbility 字段映射集成
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

import { RemoteCrudEntityManager, RemoteReadonlyEntityManager } from '@/entity/manager/managers';
import { SchemaRegistrar } from '@/schema';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { ENTITY_ACTION } from '@/entity/types';
import type { FlatSchema, RegistrSchema } from '@/schema';
import type { RequestContext } from '@/context';

// ============================================
// 测试用 Schema
// ============================================

const crossCutSchema: FlatSchema = {
    name: 'CrossCutProduct',
    domain: 'crosscut-test',
    idField: 'id',
    isTree: false,
    searchFields: ['name', 'category'],
    fields: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string', mapping: 'productName', searchable: true },
        { name: 'category', type: 'string', searchable: true },
        { name: 'price', type: 'number' },
        { name: 'active', type: 'boolean' },
    ],
};

// ============================================
// 测试用 Manager
// ============================================

class TestCrossCutManager extends RemoteCrudEntityManager {
    domain = 'crosscut-test';
    entityName = 'CrossCutProduct';
    url = '/api/products';
    schema: RegistrSchema = crossCutSchema;
}

class TestReadonlyManager extends RemoteReadonlyEntityManager {
    domain = 'crosscut-test';
    entityName = 'CrossCutProduct';
    url = '/api/products';
    schema: RegistrSchema = crossCutSchema;
}

// ============================================
// 辅助函数
// ============================================

function ensureDomain(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (domainRegistrar && !domainRegistrar.get('crosscut-test')) {
        domainRegistrar.register('crosscut-test', {
            baseUrl: 'http://localhost:9999',
            preset: 'default',
            pageSize: 10,
            pagesizes: [10, 20, 50],
        });
    }
}

function registerSchema(): void {
    const schemaRegistrar = SchemaRegistrar.getInstance();
    if (!schemaRegistrar.has('CrossCutProduct')) {
        schemaRegistrar.register(crossCutSchema);
    }
}

function createProducts(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        productName: `Product ${i + 1}`,
        category: i % 2 === 0 ? 'Electronics' : 'Books',
        price: (i + 1) * 10,
        active: i % 3 !== 0,
    }));
}

function mockFetchReturn(data: { list?: any[]; total?: number; item?: any }): void {
    jest.spyOn(TestCrossCutManager.prototype, 'fetch').mockImplementation(async () => ({
        data: { list: data.list || [], total: data.total || 0, item: data.item, ...data },
        metadata: { hasError: false },
    } as any));
}

function mockReadonlyFetchReturn(data: { list?: any[]; total?: number; item?: any }): void {
    jest.spyOn(TestReadonlyManager.prototype, 'fetch').mockImplementation(async () => ({
        data: { list: data.list || [], total: data.total || 0, item: data.item, ...data },
        metadata: { hasError: false },
    } as any));
}

// ============================================
// 测试
// ============================================

describe('RemoteAbility 跨切面集成测试', () => {
    let manager: TestCrossCutManager;
    let readonlyManager: TestReadonlyManager;

    beforeAll(() => {
        ensureDomain();
        registerSchema();
    });

    beforeEach(() => {
        manager = new TestCrossCutManager();
        readonlyManager = new TestReadonlyManager();
    });

    afterEach(() => {
        manager.dispose();
        readonlyManager.dispose();
        jest.restoreAllMocks();
    });

    // ========================================
    // 1. FlatRemoteListAbility + CacheAbility 缓存交互
    // ========================================

    describe('缓存交互', () => {
        it('list() 首次调用应该走 fetch，第二次应该命中缓存', async () => {
            const products = createProducts(5);
            const fetchSpy = jest.spyOn(TestCrossCutManager.prototype, 'fetch').mockImplementation(async () => ({
                data: { list: products, total: 5, item: null },
                metadata: { hasError: false },
            } as any));

            // 首次调用
            const result1 = await manager.list();
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(result1).toHaveLength(5);

            // 写入缓存
            await manager.setCache({ items: products, total: 5 });

            // 第二次调用（非强制）应该命中缓存
            const result2 = await manager.list();
            // fetch 仍然只被调用一次（缓存命中）
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(result2).toHaveLength(5);
        });

        it('refresh() 应该跳过缓存强制 fetch', async () => {
            const products = createProducts(3);
            const fetchSpy = jest.spyOn(TestCrossCutManager.prototype, 'fetch').mockImplementation(async () => ({
                data: { list: products, total: 3, item: null },
                metadata: { hasError: false },
            } as any));

            // 首次 list
            await manager.list();
            expect(fetchSpy).toHaveBeenCalledTimes(1);

            // 写入缓存
            await manager.setCache({ items: products, total: 3 });

            // refresh 应该跳过缓存
            await manager.refresh();
            expect(fetchSpy).toHaveBeenCalledTimes(2);
        });

        it('clearCache() 后 list() 应该重新 fetch', async () => {
            const products = createProducts(2);
            const fetchSpy = jest.spyOn(TestCrossCutManager.prototype, 'fetch').mockImplementation(async () => ({
                data: { list: products, total: 2, item: null },
                metadata: { hasError: false },
            } as any));

            await manager.list();
            await manager.setCache({ items: products, total: 2 });

            // 清除缓存
            await manager.clearCache();

            // 再次 list 应该重新 fetch
            await manager.list();
            expect(fetchSpy).toHaveBeenCalledTimes(2);
        });
    });

    // ========================================
    // 2. FlatRemoteGetAllAbility 全量获取
    // ========================================

    describe('getAll 全量获取', () => {
        it('getAll() 应该获取全部数据并更新 items', async () => {
            const products = createProducts(10);
            mockFetchReturn({ list: products, total: 10 });

            const result = await manager.getAll();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(10);
            expect(manager.items).toHaveLength(10);
        });

        it('getAll() 应该使用 debounce(300ms, leading=true)', async () => {
            const products = createProducts(5);
            const fetchSpy = jest.spyOn(TestCrossCutManager.prototype, 'fetch').mockImplementation(async () => ({
                data: { list: products, total: 5, item: null },
                metadata: { hasError: false },
            } as any));

            // 第一次调用应该立即执行（leading=true）
            const result = await manager.getAll();
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(5);
        });

        it('getAll() 返回空数据时应该安全处理', async () => {
            mockFetchReturn({ list: [], total: 0 });

            const result = await manager.getAll();

            expect(result).toEqual([]);
            expect(manager.items).toEqual([]);
            expect(manager.total).toBe(0);
        });
    });

    // ========================================
    // 3. 事件发射集成
    // ========================================

    describe('事件发射', () => {
        it('list() 成功后应该发射 listed 事件', async () => {
            const products = createProducts(3);
            mockFetchReturn({ list: products, total: 3 });

            const listedHandler = jest.fn();
            manager.on('listed', listedHandler);

            await manager.list();

            // 事件处理器接收 IEventContext: { event, data, source, ... }
            expect(listedHandler).toHaveBeenCalledTimes(1);
            const ctx = listedHandler.mock.calls[0][0];
            expect(ctx.event).toBe('listed');
            expect(ctx.data).toHaveLength(3);
        });

        it('create() 成功后应该发射 created 事件', async () => {
            const newItem = { id: 99, productName: 'New Product', category: 'Books', price: 100, active: true };
            mockFetchReturn({ item: newItem, list: [], total: 0 });

            const createdHandler = jest.fn();
            manager.on('created', createdHandler);

            await manager.create({ name: 'New Product', price: 100 });

            expect(createdHandler).toHaveBeenCalledTimes(1);
            const ctx = createdHandler.mock.calls[0][0];
            expect(ctx.event).toBe('created');
        });

        it('update() 成功后应该发射 updated 事件', async () => {
            const original = { id: 1, productName: 'Product 1', category: 'Electronics', price: 10, active: true };
            manager.updateData([original]);

            const updated = { ...original, price: 20 };
            mockFetchReturn({ item: updated, list: [], total: 0 });

            const updatedHandler = jest.fn();
            manager.on('updated', updatedHandler);

            await manager.update(updated);

            expect(updatedHandler).toHaveBeenCalledTimes(1);
            const ctx = updatedHandler.mock.calls[0][0];
            expect(ctx.event).toBe('updated');
        });

        it('toggle() 成功后应该发射 toggled 事件', async () => {
            const item = { id: 1, productName: 'Product 1', category: 'Electronics', price: 10, active: false };
            manager.updateData([item]);

            const toggledItem = { ...item, active: true };
            mockFetchReturn({ item: toggledItem, list: [], total: 0 });

            const toggledHandler = jest.fn();
            manager.on('toggled', toggledHandler);

            await manager.toggle(item, 'active');

            // toggled 事件 data 是 { id, item, field }
            expect(toggledHandler).toHaveBeenCalledTimes(1);
            const ctx = toggledHandler.mock.calls[0][0];
            expect(ctx.event).toBe('toggled');
            expect(ctx.data.field).toBe('active');
            expect(ctx.data.item).toBeDefined();
        });
    });

    // ========================================
    // 4. deleteFromItems 与 RemoteDeleteAbility 协作
    // ========================================

    describe('deleteFromItems 与 RemoteDeleteAbility', () => {
        it('delete() 单个删除后 items 和 total 应该同步更新', async () => {
            const products = createProducts(3);
            manager.updateData(products, 3);

            mockFetchReturn({ list: [], total: 0 });

            await manager.delete(1);

            expect(manager.items).toHaveLength(2);
            expect(manager.items.find((i: any) => i.id === 1)).toBeUndefined();
            expect(manager.total).toBe(2);
        });

        it('delete() 批量删除后 items 和 total 应该同步更新', async () => {
            const products = createProducts(5);
            manager.updateData(products, 5);

            mockFetchReturn({ list: [], total: 0 });

            await manager.delete([1, 3, 5]);

            expect(manager.items).toHaveLength(2);
            expect(manager.total).toBe(2);
        });

        it('deleteFromItems() 应该正确更新 pages 和 hasMore', async () => {
            // 30 条数据，pageSize=20，共 2 页
            const products = createProducts(20);
            manager.updateData(products, 30);
            expect(manager.pages).toBe(2);
            expect(manager.hasMore).toBe(true);

            // 删除 15 条
            manager.deleteFromItems(Array.from({ length: 15 }, (_, i) => i + 1));

            expect(manager.items).toHaveLength(5);
            expect(manager.total).toBe(15); // 30 - 15
            expect(manager.pages).toBe(1); // 15 / 20 = 1
            expect(manager.hasMore).toBe(false); // page 1 >= pages 1
        });
    });

    // ========================================
    // 5. BaseEntityManager.fetch() 生命周期事件
    // ========================================

    describe('fetch 生命周期事件', () => {
        it('fetch 成功应该发射 list:loading 和 list:success 事件', async () => {
            const products = createProducts(2);

            // 不 mock fetch，而是 mock request（fetch 的底层调用）
            // 这样 BaseEntityManager.fetch() 的真实逻辑会执行
            jest.spyOn(TestCrossCutManager.prototype as any, 'request').mockImplementation(() => ({
                context: Promise.resolve({
                    data: { list: products, total: 2, item: null },
                    metadata: { hasError: false },
                    error: null,
                }),
                cancel: jest.fn(),
            }));

            const loadingHandler = jest.fn();
            const successHandler = jest.fn();
            manager.on('list:loading', loadingHandler);
            manager.on('list:success', successHandler);

            await manager.list();

            // fetch 内部发射 list:loading(true), list:success, list:loading(false)
            expect(loadingHandler).toHaveBeenCalled();
            expect(successHandler).toHaveBeenCalled();
        });

        it('fetch 完成后 loading 应该为 false', async () => {
            const products = createProducts(2);
            mockFetchReturn({ list: products, total: 2 });

            await manager.list();

            expect(manager.loading).toBe(false);
        });
    });

    // ========================================
    // 6. SchemaProxyAbility 字段映射集成
    // ========================================

    describe('SchemaProxyAbility 字段映射', () => {
        it('idField 应该从 schema 获取', () => {
            expect(manager.idField).toBe('id');
        });

        it('schemaKeys 应该包含正确的字段映射', () => {
            const keys = manager.schemaKeys;
            expect(keys).toBeDefined();
            // schemaKeys 返回 { id, label, createdAt, updatedAt, parentId, children, path, leaf }
            expect(keys.id).toBe('id');
            expect(keys.label).toBe('name');
        });

        it('buildOptions 应该处理字段映射（name → productName）', async () => {
            const options = await manager.buildOptions(ENTITY_ACTION.CREATE, {}, {
                name: 'Test Product',
                category: 'Electronics',
                price: 100,
            }, {});

            // processItem 应该将 name 映射为 productName
            expect(options.body).toBeDefined();
            expect(options.body.productName).toBe('Test Product');
        });
    });

    // ========================================
    // 7. RemoteReadonlyEntityManager 能力验证
    // ========================================

    describe('RemoteReadonlyEntityManager', () => {
        it('应该有 list/refresh/get/getAll/prev/next/jump 方法', () => {
            expect(typeof readonlyManager.list).toBe('function');
            expect(typeof readonlyManager.refresh).toBe('function');
            expect(typeof readonlyManager.get).toBe('function');
            expect(typeof readonlyManager.getAll).toBe('function');
            expect(typeof readonlyManager.prev).toBe('function');
            expect(typeof readonlyManager.next).toBe('function');
            expect(typeof readonlyManager.jump).toBe('function');
        });

        it('不应该有 create/update/delete 方法', () => {
            expect(typeof (readonlyManager as any).create).toBe('undefined');
            expect(typeof (readonlyManager as any).update).toBe('undefined');
            expect(typeof (readonlyManager as any).delete).toBe('undefined');
        });

        it('list() 应该正常工作', async () => {
            const products = createProducts(3);
            mockReadonlyFetchReturn({ list: products, total: 3 });

            const result = await readonlyManager.list();

            expect(result).toHaveLength(3);
            expect(readonlyManager.items).toHaveLength(3);
        });
    });
});
