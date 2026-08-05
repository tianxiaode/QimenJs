/**
 * FlatLocalStateAbility 综合单元测试
 *
 * 覆盖 FlatLocalStateAbility 中未被其他单独测试覆盖的方法：
 * 1. schemaGetters（树形分支）
 * 2. cacheMethods（tryGetCache/setCache/clearCache/_getCacheKey 远程分支）
 * 3. searchMethods（toParams/filter/searchBy/matchKeyword/applySort/sort）
 * 4. refreshView/edit/rollback/isEmpty/total/adds/updates
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

jest.mock('@/cache', () => ({
    CacheFactory: {
        create: jest.fn().mockResolvedValue({
            id: 'test-provider',
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            remove: jest.fn().mockResolvedValue(undefined),
        }),
        release: jest.fn(),
    },
}));

import { ComposableBase } from '@/composable/ComposableBase';
import { withAbilities } from '@/composable';
import { FlatLocalStateAbility } from '@/entity/abilities/local/FlatLocalStateAbility';

// ============================================
// 辅助
// ============================================

function createFlatHost(options: { isTree?: boolean; isRemote?: boolean } = {}) {
    class FlatHost extends ComposableBase {
        schema: any = {
            idField: 'id',
            idType: 'string',
            nameField: 'name',
            domain: 'test-domain',
            name: 'TestEntity',
            isTree: options.isTree ?? false,
            searchFields: ['name', 'category'],
            ...(options.isTree
                ? {
                      isLazy: true,
                      root: 'root-id',
                      parentIdField: 'parentId',
                      childrenField: 'children',
                      pathField: 'path',
                      leafField: 'isLeaf',
                      expandedField: 'expanded',
                      useFlat: true,
                  }
                : {}),
        };
        sourceData = new Map<string, any>();
        isRemote = options.isRemote ?? false;
        items: any[] = [];
        item: any = null;
        search: any = {};
        loading = false;
        page = 1;
        pageSize = 20;
        cacheTTL = 300000;
        debounce = jest.fn((_key: string, fn: any, _ms: number) => fn) as any;
        emitEvent = jest.fn();
    }
    withAbilities(FlatHost, [FlatLocalStateAbility]);
    return new FlatHost() as any;
}

// ============================================
// 测试
// ============================================

describe('FlatLocalStateAbility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================
    // 1. schemaGetters
    // ========================================

    describe('schemaGetters - 非树形', () => {
        it('idField 应返回 schema.idField', () => {
            const host = createFlatHost();
            expect(host.idField).toBe('id');
            host.dispose();
        });

        it('idType 应返回 schema.idType', () => {
            const host = createFlatHost();
            expect(host.idType).toBe('string');
            host.dispose();
        });

        it('nameField 应返回 schema.nameField', () => {
            const host = createFlatHost();
            expect(host.nameField).toBe('name');
            host.dispose();
        });

        it('searchFields 应返回 schema.searchFields', () => {
            const host = createFlatHost();
            expect(host.searchFields).toEqual(['name', 'category']);
            host.dispose();
        });

        it('isTree 应返回 false', () => {
            const host = createFlatHost();
            expect(host.isTree).toBe(false);
            host.dispose();
        });

        it('isLazy 非树形时应返回 false', () => {
            const host = createFlatHost();
            expect(host.isLazy).toBe(false);
            host.dispose();
        });

        it('root 非树形时应返回空字符串', () => {
            const host = createFlatHost();
            expect(host.root).toBe('');
            host.dispose();
        });
    });

    describe('schemaGetters - 树形', () => {
        it('isTree 应返回 true', () => {
            const host = createFlatHost({ isTree: true });
            expect(host.isTree).toBe(true);
            host.dispose();
        });

        it('isLazy 应返回 schema.isLazy', () => {
            const host = createFlatHost({ isTree: true });
            expect(host.isLazy).toBe(true);
            host.dispose();
        });

        it('root 应返回 schema.root', () => {
            const host = createFlatHost({ isTree: true });
            expect(host.root).toBe('root-id');
            host.dispose();
        });

        it('parentIdField 应返回 schema.parentIdField', () => {
            const host = createFlatHost({ isTree: true });
            expect(host.parentIdField).toBe('parentId');
            host.dispose();
        });

        it('childrenField 应返回 schema.childrenField', () => {
            const host = createFlatHost({ isTree: true });
            expect(host.childrenField).toBe('children');
            host.dispose();
        });

        it('pathField 应返回 schema.pathField', () => {
            const host = createFlatHost({ isTree: true });
            expect(host.pathField).toBe('path');
            host.dispose();
        });

        it('leafField 应返回 schema.leafField', () => {
            const host = createFlatHost({ isTree: true });
            expect(host.leafField).toBe('isLeaf');
            host.dispose();
        });

        it('expandedField 应返回 schema.expandedField', () => {
            const host = createFlatHost({ isTree: true });
            expect(host.expandedField).toBe('expanded');
            host.dispose();
        });

        it('useFlat 应返回 schema.useFlat', () => {
            const host = createFlatHost({ isTree: true });
            expect(host.useFlat).toBe(true);
            host.dispose();
        });
    });

    // ========================================
    // 2. cacheMethods
    // ========================================

    describe('cacheMethods', () => {
        it('tryGetCache 应返回缓存数据', async () => {
            const { CacheFactory } = jest.requireMock('@/cache');
            CacheFactory.create.mockResolvedValueOnce({
                id: 'test-provider',
                get: jest.fn().mockResolvedValue({ data: 'cached' }),
                set: jest.fn(),
                remove: jest.fn(),
            });

            const host = createFlatHost();
            const result = await host.tryGetCache();
            expect(result).toEqual({ data: 'cached' });
            host.dispose();
        });

        it('setCache 应调用 provider.set', async () => {
            const mockSet = jest.fn().mockResolvedValue(undefined);
            const { CacheFactory } = jest.requireMock('@/cache');
            CacheFactory.create.mockResolvedValueOnce({
                id: 'test-provider',
                get: jest.fn(),
                set: mockSet,
                remove: jest.fn(),
            });

            const host = createFlatHost();
            await host.setCache({ data: 'test' });
            expect(mockSet).toHaveBeenCalled();
            host.dispose();
        });

        it('clearCache 应调用 provider.remove', async () => {
            const mockRemove = jest.fn().mockResolvedValue(undefined);
            const { CacheFactory } = jest.requireMock('@/cache');
            CacheFactory.create.mockResolvedValueOnce({
                id: 'test-provider',
                get: jest.fn(),
                set: jest.fn(),
                remove: mockRemove,
            });

            const host = createFlatHost();
            await host.clearCache();
            expect(mockRemove).toHaveBeenCalled();
            host.dispose();
        });

        it('_getCacheKey 非远程时应返回 domain:name', () => {
            const host = createFlatHost({ isRemote: false });
            const key = host._getCacheKey();
            expect(key).toBe('test-domain:TestEntity');
            host.dispose();
        });

        it('_getCacheKey 远程无参数时应返回 domain:name:root', () => {
            const host = createFlatHost({ isRemote: true });
            host.search = {};
            // toParams 返回空时走 :root 分支，但 toParams 会添加 page/pageSize
            // 所以需要让 toParams 返回空对象（通过 mock）
            jest.spyOn(host, 'toParams').mockReturnValue({});
            const key = host._getCacheKey();
            expect(key).toContain(':root');
            host.dispose();
        });

        it('_getCacheKey 远程有参数时应返回带哈希的 key', () => {
            const host = createFlatHost({ isRemote: true });
            host.search = { keyword: 'test' };
            const key = host._getCacheKey();
            expect(key).toContain(':q:');
            host.dispose();
        });

        it('updateSourceData 应清空并重新填充 sourceData', () => {
            const host = createFlatHost();
            host.sourceData.set('old', { id: 'old' });
            host.updateSourceData([
                { id: '1', name: 'a' },
                { id: '2', name: 'b' },
            ]);
            expect(host.sourceData.has('old')).toBe(false);
            expect(host.sourceData.get('1')).toEqual({ id: '1', name: 'a' });
            expect(host.sourceData.get('2')).toEqual({ id: '2', name: 'b' });
            host.dispose();
        });
    });

    // ========================================
    // 3. searchMethods
    // ========================================

    describe('searchMethods', () => {
        it('toParams 非树形应包含 page 和 pageSize', () => {
            const host = createFlatHost();
            host.search = { keyword: 'test' };
            const params = host.toParams();
            expect(params.keyword).toBe('test');
            expect(params.page).toBe(1);
            expect(params.pageSize).toBe(20);
            host.dispose();
        });

        it('toParams 树形应包含 parentId', () => {
            const host = createFlatHost({ isTree: true });
            host.search = {};
            const params = host.toParams();
            expect(params.parentId).toBe('root-id');
            host.dispose();
        });

        it('toParams 应跳过 undefined/null/空字符串值', () => {
            const host = createFlatHost();
            host.search = { keyword: '', name: null, age: undefined, valid: 'yes' };
            const params = host.toParams();
            expect(params.keyword).toBeUndefined();
            expect(params.name).toBeUndefined();
            expect(params.age).toBeUndefined();
            expect(params.valid).toBe('yes');
            host.dispose();
        });

        it('toParams 数组值应 join 为逗号分隔', () => {
            const host = createFlatHost();
            host.search = { tags: ['a', 'b', 'c'] };
            const params = host.toParams();
            expect(params.tags).toBe('a,b,c');
            host.dispose();
        });

        it('filter 应设置 search.keyword', () => {
            const host = createFlatHost();
            host.search = {};
            host.filter('Electronics');
            expect(host.search.keyword).toBe('Electronics');
            host.dispose();
        });

        it('searchBy 应合并搜索参数', () => {
            const host = createFlatHost();
            host.search = { keyword: 'old' };
            host.searchBy({ category: 'books' });
            expect(host.search).toEqual({ keyword: 'old', category: 'books' });
            host.dispose();
        });

        it('matchKeyword 无 keyword 时应返回 true', () => {
            const host = createFlatHost();
            host.search = {};
            expect(host.matchKeyword({ name: 'test' })).toBe(true);
            host.dispose();
        });

        it('matchKeyword 有 keyword 时应匹配 searchFields', () => {
            const host = createFlatHost();
            host.search = { keyword: 'elec' };
            expect(host.matchKeyword({ name: 'Electronics' })).toBe(true);
            expect(host.matchKeyword({ name: 'Books' })).toBe(false);
            host.dispose();
        });

        it('applySort 无 sortBy 时应返回原列表', () => {
            const host = createFlatHost();
            host.search = {};
            const list = [{ name: 'b' }, { name: 'a' }];
            expect(host.applySort(list)).toBe(list);
            host.dispose();
        });

        it('applySort 有 sortBy 时应排序', () => {
            const host = createFlatHost();
            host.search = { sortBy: 'name', sortOrder: 'asc' };
            const list = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
            const sorted = host.applySort(list);
            expect(sorted[0].name).toBe('a');
            expect(sorted[2].name).toBe('c');
            host.dispose();
        });

        it('sort 应设置 search.sortBy 和 search.sortOrder', () => {
            const host = createFlatHost();
            host.search = {};
            host.sort('price', 'desc');
            expect(host.search.sortBy).toBe('price');
            expect(host.search.sortOrder).toBe('desc');
            host.dispose();
        });
    });

    // ========================================
    // 4. 计算属性和 refreshView/edit/rollback
    // ========================================

    describe('计算属性', () => {
        it('isEmpty 在 items 为空时应返回 true', () => {
            const host = createFlatHost();
            host.items = [];
            expect(host.isEmpty).toBe(true);
            host.dispose();
        });

        it('isEmpty 在 items 非空时应返回 false', () => {
            const host = createFlatHost();
            host.items = [{ id: '1' }];
            expect(host.isEmpty).toBe(false);
            host.dispose();
        });

        it('total 应返回 items 长度', () => {
            const host = createFlatHost();
            host.items = [{ id: '1' }, { id: '2' }];
            expect(host.total).toBe(2);
            host.dispose();
        });

        it('adds 应返回 changes.added', async () => {
            const host = createFlatHost();
            await host.addItem({ id: '1', name: 'test' });
            expect(host.adds.length).toBe(1);
            host.dispose();
        });

        it('updates 应返回 changes.updated', async () => {
            const host = createFlatHost();
            host.sourceData.set('1', { id: '1', name: 'old' });
            await host.updateItem({ id: '1', name: 'new' });
            expect(host.updates.has('1')).toBe(true);
            host.dispose();
        });
    });

    describe('refreshView', () => {
        it('应过滤和排序数据并设置 items', async () => {
            const host = createFlatHost();
            host.sourceData.set('1', { id: '1', name: 'Banana' });
            host.sourceData.set('2', { id: '2', name: 'Apple' });
            host.sourceData.set('3', { id: '3', name: 'Cherry' });
            host.search = { sortBy: 'name', sortOrder: 'asc' };

            await host.refreshView();

            expect(host.items.length).toBe(3);
            expect(host.items[0].name).toBe('Apple');
            expect(host.items[2].name).toBe('Cherry');
            expect(host.loading).toBe(false);
            host.dispose();
        });

        it('应按 keyword 过滤', async () => {
            const host = createFlatHost();
            host.sourceData.set('1', { id: '1', name: 'Electronics' });
            host.sourceData.set('2', { id: '2', name: 'Books' });
            host.search = { keyword: 'elec' };

            await host.refreshView();

            expect(host.items.length).toBe(1);
            expect(host.items[0].name).toBe('Electronics');
            host.dispose();
        });
    });

    describe('edit/rollback', () => {
        it('edit 应调用 startEdit', () => {
            const host = createFlatHost();
            const item = { id: '1', name: 'test' };
            host.edit(item);
            expect(host.isDirty(item)).toBe(false); // 未修改
            expect(host.isDirty()).toBe(true); // 有快照
            host.dispose();
        });

        it('rollback 应调用 rollbackAll', () => {
            const host = createFlatHost();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            item.name = 'changed';
            host.rollback();
            expect(host.isDirty()).toBe(false);
            host.dispose();
        });
    });

    // ========================================
    // 5. schemaGetters 默认值分支
    // ========================================

    describe('schemaGetters - 默认值', () => {
        function createNoSchemaHost() {
            class FlatHost extends ComposableBase {
                schema: any = {};
                sourceData = new Map<string, any>();
                isRemote = false;
                items: any[] = [];
                item: any = null;
                search: any = {};
                loading = false;
                page = 1;
                pageSize = 20;
                cacheTTL = 300000;
                debounce = jest.fn((_key: string, fn: any, _ms: number) => fn) as any;
                emitEvent = jest.fn();
            }
            withAbilities(FlatHost, [FlatLocalStateAbility]);
            return new FlatHost() as any;
        }

        it('defaultSort 无 schema.defaultSort 时应返回空字符串', () => {
            const host = createNoSchemaHost();
            expect(host.defaultSort).toBe('');
            host.dispose();
        });

        it('defaultOrder 无 schema.defaultOrder 时应返回 asc', () => {
            const host = createNoSchemaHost();
            expect(host.defaultOrder).toBe('asc');
            host.dispose();
        });

        it('idField 无 schema.idField 时应返回 id', () => {
            const host = createNoSchemaHost();
            expect(host.idField).toBe('id');
            host.dispose();
        });

        it('idType 无 schema.idType 时应返回 number', () => {
            const host = createNoSchemaHost();
            expect(host.idType).toBe('number');
            host.dispose();
        });

        it('nameField 无 schema.nameField 时应返回 name', () => {
            const host = createNoSchemaHost();
            expect(host.nameField).toBe('name');
            host.dispose();
        });

        it('searchFields 无 schema.searchFields 时应返回空数组', () => {
            const host = createNoSchemaHost();
            expect(host.searchFields).toEqual([]);
            host.dispose();
        });
    });

    // ========================================
    // 6. cacheKey getter
    // ========================================

    describe('cacheKey getter', () => {
        it('应通过 _getCacheKey 返回缓存键', () => {
            const host = createFlatHost({ isRemote: false });
            expect(host.cacheKey).toBe('test-domain:TestEntity');
            host.dispose();
        });
    });

    // ========================================
    // 7. dirtyMethods - submitEdit / cancelEdit / isDirty 深比较
    // ========================================

    describe('dirtyMethods - submitEdit / cancelEdit / 深比较', () => {
        it('isDirty 对象值深比较相等时应返回 false', () => {
            const host = createFlatHost();
            const item = { id: '1', name: 'test', meta: { key: 'val' } };
            host.startEdit(item);
            item.meta = { key: 'val' };
            expect(host.isDirty(item)).toBe(false);
            host.dispose();
        });

        it('isDirty 对象值深比较不等时应返回 true', () => {
            const host = createFlatHost();
            const item = { id: '1', name: 'test', meta: { key: 'val' } };
            host.startEdit(item);
            item.meta = { key: 'changed' };
            expect(host.isDirty(item)).toBe(true);
            host.dispose();
        });

        it('submitEdit 应移除快照', () => {
            const host = createFlatHost();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            item.name = 'changed';
            host.submitEdit(item);
            expect(host.isDirty(item)).toBe(false);
            expect(host.isDirty()).toBe(false);
            host.dispose();
        });

        it('cancelEdit 应恢复原始值并移除快照', () => {
            const host = createFlatHost();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            item.name = 'changed';
            host.cancelEdit(item);
            expect(item.name).toBe('test');
            expect(host.isDirty()).toBe(false);
            host.dispose();
        });

        it('cancelEdit 无快照时不应报错', () => {
            const host = createFlatHost();
            const item = { id: '1', name: 'test' };
            host.cancelEdit(item);
            expect(item.name).toBe('test');
            host.dispose();
        });
    });

    // ========================================
    // 8. mutationMethods
    // ========================================

    describe('mutationMethods - updateData', () => {
        it('应重置 changes 并更新 sourceData', async () => {
            const host = createFlatHost();
            await host.addItem({ id: '1', name: 'a' });
            expect(host.hasChanges).toBe(true);

            await host.updateData([{ id: '2', name: 'b' }]);
            expect(host.changes.added).toEqual([]);
            expect(host.sourceData.get('2')).toEqual({ id: '2', name: 'b' });
            host.dispose();
        });

        it('应清理 tempId 项', async () => {
            const host = createFlatHost();
            const item: any = { id: '1', name: 'temp' };
            await host.addItem(item);
            const tempId = item.tempId;
            expect(host.sourceData.has('1')).toBe(true);
            expect(item.tempId).toBeDefined();

            await host.updateData([{ id: '1', name: 'updated' }]);
            expect(host.sourceData.has('1')).toBe(true);
            host.dispose();
        });
    });

    describe('mutationMethods - softDelete', () => {
        it('应保存快照并从 sourceData 删除', async () => {
            const host = createFlatHost();
            host.sourceData.set('1', { id: '1', name: 'item' });
            await host.softDelete({ localOnly: [], persistent: [{ id: '1', name: 'item' }] });
            expect(host.changes.deleted).toContain('1');
            expect(host.sourceData.has('1')).toBe(false);
            host.dispose();
        });

        it('localOnly 项应从 added 移除并加入 deleted', async () => {
            const host = createFlatHost();
            await host.addItem({ id: 'local1', name: 'local item' });
            await host.softDelete({
                localOnly: [{ id: 'local1', name: 'local item' }],
                persistent: [],
            });
            expect(host.changes.added.length).toBe(0);
            expect(host.changes.deleted).toContain('local1');
            host.dispose();
        });

        it('传入纯 ID（非对象）时应正确处理', async () => {
            const host = createFlatHost();
            host.sourceData.set('1', { id: '1', name: 'item' });
            await host.softDelete({ localOnly: [], persistent: ['1'] });
            expect(host.changes.deleted).toContain('1');
            expect(host.sourceData.has('1')).toBe(false);
            host.dispose();
        });

        it('同时有 localOnly 和 persistent 项时', async () => {
            const host = createFlatHost();
            await host.addItem({ id: 'local1', name: 'local item' });
            host.sourceData.set('persist1', { id: 'persist1', name: 'persist item' });
            await host.softDelete({
                localOnly: [{ id: 'local1', name: 'local item' }],
                persistent: [{ id: 'persist1', name: 'persist item' }],
            });
            expect(host.changes.added.length).toBe(0);
            expect(host.changes.deleted).toContain('local1');
            expect(host.changes.deleted).toContain('persist1');
            host.dispose();
        });
    });

    describe('mutationMethods - getDeletionPlan', () => {
        it('应区分本地和持久化删除', async () => {
            const host = createFlatHost();
            await host.addItem({ id: 'temp1', name: 'new item' });
            host.sourceData.set('persist1', { id: 'persist1', name: 'old item' });
            const plan = host.getDeletionPlan(['temp1', 'persist1']);
            expect(plan.localOnly).toContain('temp1');
            expect(plan.persistent).toContain('persist1');
            host.dispose();
        });

        it('无 changes 时所有 ID 应归入 persistent', () => {
            const host = createFlatHost();
            host.sourceData.set('1', { id: '1', name: 'item' });
            const plan = host.getDeletionPlan(['1']);
            expect(plan.localOnly).toEqual([]);
            expect(plan.persistent).toContain('1');
            host.dispose();
        });
    });

    describe('mutationMethods - confirmDelete', () => {
        it('应清除删除快照和 deleted 列表', async () => {
            const host = createFlatHost();
            host.sourceData.set('1', { id: '1', name: 'item' });
            await host.softDelete({ localOnly: [], persistent: [{ id: '1', name: 'item' }] });
            await host.confirmDelete();
            expect(host.changes.deleted).toEqual([]);
            host.dispose();
        });
    });

    describe('mutationMethods - rollbackDelete', () => {
        it('应恢复被删除的项', async () => {
            const host = createFlatHost();
            host.sourceData.set('1', { id: '1', name: 'item' });
            await host.softDelete({ localOnly: [], persistent: [{ id: '1', name: 'item' }] });
            expect(host.sourceData.has('1')).toBe(false);
            await host.rollbackDelete();
            expect(host.sourceData.get('1')).toEqual({ id: '1', name: 'item' });
            expect(host.changes.deleted).toEqual([]);
            host.dispose();
        });

        it('无删除时不应报错', async () => {
            const host = createFlatHost();
            await host.rollbackDelete();
            host.dispose();
        });

        it('无快照但有 changes.deleted 时应清空 deleted', async () => {
            const host = createFlatHost();
            const changes = host._getOrCreateChanges();
            changes.deleted.push('manual1');
            await host.rollbackDelete();
            expect(host.changes.deleted).toEqual([]);
            host.dispose();
        });
    });

    describe('mutationMethods - clearChanges', () => {
        it('应重置所有变更', async () => {
            const host = createFlatHost();
            await host.addItem({ id: '1', name: 'a' });
            expect(host.hasChanges).toBe(true);
            host.clearChanges();
            expect(host.hasChanges).toBe(false);
            host.dispose();
        });
    });

    describe('mutationMethods - _getOrCreateDeleteSnapshots', () => {
        it('首次调用应创建新 Map', () => {
            const host = createFlatHost();
            const snapshots = host._getOrCreateDeleteSnapshots();
            expect(snapshots).toBeInstanceOf(Map);
            expect(snapshots.size).toBe(0);
            host.dispose();
        });

        it('重复调用应返回同一实例', () => {
            const host = createFlatHost();
            const s1 = host._getOrCreateDeleteSnapshots();
            s1.set('1', { id: '1' });
            const s2 = host._getOrCreateDeleteSnapshots();
            expect(s2).toBe(s1);
            expect(s2.size).toBe(1);
            host.dispose();
        });
    });

    describe('mutationMethods - _deleteFromSource', () => {
        it('应从 sourceData 删除指定 ID', async () => {
            const host = createFlatHost();
            host.sourceData.set('1', { id: '1', name: 'a' });
            host.sourceData.set('2', { id: '2', name: 'b' });
            await host._deleteFromSource(['1']);
            expect(host.sourceData.has('1')).toBe(false);
            expect(host.sourceData.has('2')).toBe(true);
            host.dispose();
        });
    });
});
