/**
 * FlatRemoteQueryAbility 集成测试
 *
 * 验证远程查询能力的完整行为：
 * 1. prev/next 分页导航
 * 2. jump 跳转指定页
 * 3. changeSize 修改每页条数
 * 4. filter 过滤查询
 * 5. sort 排序查询
 * 6. reset 重置查询
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
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { SchemaRegistrar } from '@/schema';
import type { FlatSchema, RegistrSchema } from '@/schema';
import { KernelError, KernelErrorCode } from '@/error';

// ============================================
// 测试用 Schema
// ============================================

const queryTestSchema: FlatSchema = {
    name: 'QueryProduct',
    domain: 'query-test',
    idField: 'id',
    isTree: false,
    searchFields: ['name', 'category'],
    fields: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string', searchable: true },
        { name: 'category', type: 'string', searchable: true },
        { name: 'price', type: 'number' },
        { name: 'active', type: 'boolean' },
    ],
};

// ============================================
// 测试用 Manager
// ============================================

class TestQueryManager extends RemoteCrudEntityManager {
    domain = 'query-test';
    entityName = 'QueryProduct';
    url = '/api/products';
    schema: RegistrSchema = queryTestSchema;
}

// ============================================
// 辅助函数
// ============================================

function ensureQueryTestDomain(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (domainRegistrar && !domainRegistrar.get('query-test')) {
        domainRegistrar.register('query-test', {
            baseUrl: 'http://localhost:9999',
            preset: 'default',
            pageSize: 10,
            pagesizes: [5, 10, 20, 50],
        });
    }
}

function mockFetchReturn(data: { list?: any[]; total?: number; item?: any }): void {
    jest.spyOn(TestQueryManager.prototype, 'fetch').mockImplementation(async () => {
        return {
            data: { list: data.list || [], total: data.total || 0, item: data.item, ...data },
            metadata: { hasError: false },
        } as any;
    });
}

// ============================================
// 测试数据
// ============================================

function createProductData(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        category: i % 2 === 0 ? 'Electronics' : 'Books',
        price: (i + 1) * 10,
        active: i % 3 !== 0,
    }));
}

// ============================================
// 测试
// ============================================

describe('FlatRemoteQueryAbility 集成测试', () => {
    let manager: TestQueryManager;

    beforeAll(() => {
        ensureQueryTestDomain();
        const schemaRegistrar = SchemaRegistrar.getInstance();
        if (!schemaRegistrar.has('QueryProduct')) {
            schemaRegistrar.register(queryTestSchema);
        }
    });

    beforeEach(() => {
        manager = new TestQueryManager();
    });

    afterEach(() => {
        manager.dispose();
        jest.restoreAllMocks();
    });

    // ========================================
    // 1. prev/next 分页导航
    // ========================================

    describe('prev/next 分页导航', () => {
        it('next() 应该将 page 加 1 并调用 list', async () => {
            // 设置初始状态：3 页，当前第 1 页
            manager.updateData(createProductData(10), 30);

            mockFetchReturn({ list: createProductData(10), total: 30 });

            const result = await manager.next();

            expect(manager.page).toBe(2);
            expect(Array.isArray(result)).toBe(true);
        });

        it('prev() 应该将 page 减 1 并调用 list', async () => {
            // 设置初始状态：3 页，当前第 2 页
            manager.updateData(createProductData(10), 30);
            manager.page = 2;

            mockFetchReturn({ list: createProductData(10), total: 30 });

            const result = await manager.prev();

            expect(manager.page).toBe(1);
            expect(Array.isArray(result)).toBe(true);
        });

        it('next() 在最后一页应该返回空数组并打印警告', async () => {
            // 设置初始状态：3 页，当前第 3 页
            manager.updateData(createProductData(10), 30);
            manager.page = 3;

            const result = await manager.next();

            expect(manager.page).toBe(3); // page 不变
            expect(result).toEqual([]);
        });

        it('prev() 在第一页应该返回空数组并打印警告', async () => {
            // 设置初始状态：1 页，当前第 1 页
            manager.updateData(createProductData(5), 5);

            const result = await manager.prev();

            expect(manager.page).toBe(1); // page 不变
            expect(result).toEqual([]);
        });

        it('连续 next 应该正确递增 page', async () => {
            manager.updateData(createProductData(10), 50);

            mockFetchReturn({ list: createProductData(10), total: 50 });

            await manager.next();
            expect(manager.page).toBe(2);

            await manager.next();
            expect(manager.page).toBe(3);
        });
    });

    // ========================================
    // 2. jump 跳转指定页
    // ========================================

    describe('jump 跳转指定页', () => {
        it('jump() 应该跳转到指定页', async () => {
            manager.updateData(createProductData(10), 50);

            mockFetchReturn({ list: createProductData(10), total: 50 });

            const result = await manager.jump(3);

            expect(manager.page).toBe(3);
            expect(Array.isArray(result)).toBe(true);
        });

        it('jump() 无效页码应该返回空数组', async () => {
            manager.updateData(createProductData(10), 30);

            const result = await manager.jump(0);

            expect(result).toEqual([]);
        });

        it('jump() 超出总页数应该返回空数组', async () => {
            manager.updateData(createProductData(10), 30);

            const result = await manager.jump(99);

            expect(result).toEqual([]);
        });

        it('jump() 负数页码应该返回空数组', async () => {
            manager.updateData(createProductData(10), 30);

            const result = await manager.jump(-1);

            expect(result).toEqual([]);
        });

        it('jump() 到第 1 页应该正常工作', async () => {
            manager.updateData(createProductData(10), 30);
            manager.page = 3;

            mockFetchReturn({ list: createProductData(10), total: 30 });

            await manager.jump(1);

            expect(manager.page).toBe(1);
        });
    });

    // ========================================
    // 3. changeSize 修改每页条数
    // ========================================

    describe('changeSize 修改每页条数', () => {
        it('changeSize() 应该修改 pageSize 并重置 page 为 1', async () => {
            manager.updateData(createProductData(10), 50);
            manager.page = 3;

            mockFetchReturn({ list: createProductData(20), total: 50 });

            const result = await manager.changeSize(20);

            expect(manager.pageSize).toBe(20);
            expect(manager.page).toBe(1);
            expect(Array.isArray(result)).toBe(true);
        });

        it('changeSize() 无效 size 在非 development 环境应该返回空数组', async () => {
            manager.updateData(createProductData(10), 30);

            // mock systemConfig 返回非 development 环境
            jest.spyOn(manager, 'systemConfig').mockReturnValue('production');

            const result = await manager.changeSize(99);

            expect(result).toEqual([]);
        });

        it('changeSize() 无效 size 在 development 环境应该抛出 KernelError', async () => {
            manager.updateData(createProductData(10), 30);

            // mock systemConfig 返回 development 环境
            jest.spyOn(manager, 'systemConfig').mockReturnValue('development');

            await expect(manager.changeSize(99)).rejects.toThrow(KernelError);
            await expect(manager.changeSize(99)).rejects.toMatchObject({
                code: KernelErrorCode.INVALID_PAGE_SIZE,
            });
        });

        it('changeSize() 合法 size 应该更新 pages 和 hasMore', async () => {
            manager.updateData(createProductData(10), 50);

            mockFetchReturn({ list: createProductData(50), total: 50 });

            await manager.changeSize(50);

            expect(manager.pageSize).toBe(50);
            expect(manager.pages).toBe(1); // 50 / 50 = 1
            expect(manager.hasMore).toBe(false); // page 1 >= pages 1
        });
    });

    // ========================================
    // 4. filter 过滤查询
    // ========================================

    describe('filter 过滤查询', () => {
        it('filter() 应该设置 search.keyword 并重置 page 为 1', async () => {
            manager.updateData(createProductData(10), 30);
            manager.page = 2;

            mockFetchReturn({ list: createProductData(5), total: 5 });

            const result = await manager.filter('Electronics');

            expect((manager.search as any).keyword).toBe('Electronics');
            expect(manager.page).toBe(1);
            expect(Array.isArray(result)).toBe(true);
        });

        it('filter() 空字符串应该清空过滤条件', async () => {
            manager.updateData(createProductData(10), 30);
            (manager.search as any).keyword = 'Electronics';

            mockFetchReturn({ list: createProductData(10), total: 30 });

            await manager.filter('');

            expect((manager.search as any).keyword).toBe('');
            expect(manager.page).toBe(1);
        });

        it('filter() 应该调用 list(true) 强制刷新', async () => {
            manager.updateData(createProductData(10), 30);

            const fetchSpy = jest.spyOn(TestQueryManager.prototype, 'fetch').mockImplementation(async () => ({
                data: { list: createProductData(5), total: 5 },
                metadata: { hasError: false },
            } as any));

            await manager.filter('Books');

            // filter 调用 _internalList(true)，跳过缓存，内部调用 fetch
            expect(fetchSpy).toHaveBeenCalled();
        });

        it('filter() 应该跳过缓存强制请求（不使用缓存数据）', async () => {
            // 使用 _internalList 的 spy 来验证 filter 调用的是 _internalList(true)
            const internalListSpy = jest.spyOn(manager as any, '_internalList').mockImplementation(async () => []);

            await manager.filter('Books');

            expect(internalListSpy).toHaveBeenCalledWith(true);

            internalListSpy.mockRestore();
        });
    });

    // ========================================
    // 4.5 searchBy 搜索查询
    // ========================================

    describe('searchBy 搜索查询', () => {
        it('searchBy() 应该设置搜索条件并强制刷新', async () => {
            manager.updateData(createProductData(10), 30);

            mockFetchReturn({ list: createProductData(5), total: 5 });

            const result = await manager.searchBy({ keyword: 'Electronics' });

            expect(manager.search).toEqual(expect.objectContaining({ keyword: 'Electronics' }));
            expect(Array.isArray(result)).toBe(true);
        });

        it('searchBy() 应该跳过缓存强制请求', async () => {
            mockFetchReturn({ list: createProductData(10), total: 30 });
            await manager.list();

            const fetchSpy = jest.spyOn(TestQueryManager.prototype, 'fetch').mockImplementation(async () => ({
                data: { list: createProductData(5), total: 5 },
                metadata: { hasError: false },
            } as any));

            await manager.searchBy({ keyword: 'Books' });

            expect(fetchSpy).toHaveBeenCalled();
        });
    });

    // ========================================
    // 5. sort 排序查询
    // ========================================

    describe('sort 排序查询', () => {
        it('sort() 应该设置 search.sortBy 和 search.sortOrder 并重置 page 为 1', async () => {
            manager.updateData(createProductData(10), 30);
            manager.page = 2;

            mockFetchReturn({ list: createProductData(10), total: 30 });

            const result = await manager.sort('price', 'desc');

            expect((manager.search as any).sortBy).toBe('price');
            expect((manager.search as any).sortOrder).toBe('desc');
            expect(manager.page).toBe(1);
            expect(Array.isArray(result)).toBe(true);
        });

        it('sort() order 为 null 时应该清空 search.sortBy', async () => {
            manager.updateData(createProductData(10), 30);
            (manager.search as any).sortBy = 'price';
            (manager.search as any).sortOrder = 'desc';

            mockFetchReturn({ list: createProductData(10), total: 30 });

            await manager.sort('price', null);

            expect((manager.search as any).sortBy).toBe('');
            expect((manager.search as any).sortOrder).toBe('asc'); // null 时默认 'asc'
        });

        it('sort() 不传 order 时应该默认 asc', async () => {
            manager.updateData(createProductData(10), 30);

            mockFetchReturn({ list: createProductData(10), total: 30 });

            // sort(prop, null) → sortOrder = 'asc'
            await manager.sort('name', null);

            expect((manager.search as any).sortOrder).toBe('asc');
        });

        it('sort() 应该调用 list(false) 不强制刷新', async () => {
            manager.updateData(createProductData(10), 30);

            const fetchSpy = jest.spyOn(TestQueryManager.prototype, 'fetch').mockImplementation(async () => ({
                data: { list: createProductData(10), total: 30 },
                metadata: { hasError: false },
            } as any));

            await manager.sort('name', 'asc');

            expect(fetchSpy).toHaveBeenCalled();
        });
    });

    // ========================================
    // 6. reset 重置查询
    // ========================================

    describe('reset 重置查询', () => {
        it('reset() 应该重置 page 为 1 并清空 search', async () => {
            manager.updateData(createProductData(10), 30);
            manager.page = 3;
            manager.search = { keyword: 'test', sortBy: 'name', sortOrder: 'desc' } as any;

            mockFetchReturn({ list: createProductData(10), total: 30 });

            const result = await manager.reset();

            expect(manager.page).toBe(1);
            expect(manager.search).toEqual({});
            expect(Array.isArray(result)).toBe(true);
        });

        it('reset() 应该调用 list(true) 强制刷新', async () => {
            manager.updateData(createProductData(10), 30);

            const fetchSpy = jest.spyOn(TestQueryManager.prototype, 'fetch').mockImplementation(async () => ({
                data: { list: createProductData(10), total: 30 },
                metadata: { hasError: false },
            } as any));

            await manager.reset();

            expect(fetchSpy).toHaveBeenCalled();
        });

        it('reset() 后 search 应该被清空', async () => {
            manager.updateData(createProductData(10), 30);
            (manager.search as any).keyword = 'Electronics';
            (manager.search as any).sortBy = 'price';
            (manager.search as any).sortOrder = 'desc';

            mockFetchReturn({ list: createProductData(10), total: 30 });

            await manager.reset();

            // reset() 重置 page 和 search
            expect(manager.search).toEqual({});
        });
    });
});
