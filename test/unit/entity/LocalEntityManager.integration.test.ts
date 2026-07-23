/**
 * LocalCrudEntityManager 集成测试
 *
 * 验证本地 CRUD 完整生命周期：
 * 1. list() 从远程获取数据填充 sourceData
 * 2. get() 本地查询单个实体
 * 3. create() 本地新增 + 变更集追踪
 * 4. update() 本地更新 + 变更集追踪
 * 5. delete() 软删除 + 分流 + 回滚
 * 6. filter()/sort() 搜索排序
 * 7. isDirty/startEdit/cancelEdit 脏检查
 * 8. refreshView() 视图刷新
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

import { LocalCrudEntityManager } from '@/entity/manager/managers';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { ENTITY_ACTION } from '@/entity/types';
import type { FlatSchema, RegistrSchema } from '@/schema';

// ============================================
// 测试用 Schema
// ============================================

const localTestSchema: FlatSchema = {
    name: 'LocalTask',
    domain: 'local-test',
    idField: 'id',
    isTree: false,
    searchFields: ['title', 'description'],
    fields: [
        { name: 'id', type: 'number' },
        { name: 'title', type: 'string', searchable: true },
        { name: 'description', type: 'string', searchable: true },
        { name: 'completed', type: 'boolean' },
    ],
};

// ============================================
// 测试用 EntityManager
// ============================================

class TestLocalTaskManager extends LocalCrudEntityManager {
    domain = 'local-test';
    entityName = 'LocalTask';
    url = '/api/local-tasks';
    schema: RegistrSchema = localTestSchema;
}

interface TestLocalTaskManager extends LocalCrudEntityManager {}

// ============================================
// 辅助函数
// ============================================

function ensureLocalTestDomain(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (domainRegistrar && !domainRegistrar.get('local-test')) {
        domainRegistrar.register('local-test', {
            baseUrl: 'http://localhost:9999',
            preset: 'default',
            pageSize: 10,
            pagesizes: [5, 10, 20, 50],
        });
    }
}

function mockFetchList(data: any[]): void {
    jest.spyOn(TestLocalTaskManager.prototype, 'fetch').mockImplementation(
        async () =>
            ({
                data: { list: data, total: data.length },
                metadata: { hasError: false },
            }) as any
    );
}

function mockFetchReturn(data: any): void {
    jest.spyOn(TestLocalTaskManager.prototype, 'fetch').mockImplementation(
        async () =>
            ({
                data,
                metadata: { hasError: false },
            }) as any
    );
}

// ============================================
// 测试
// ============================================

describe('LocalCrudEntityManager 集成测试', () => {
    let manager: any;

    beforeAll(() => {
        ensureLocalTestDomain();
    });

    beforeEach(() => {
        manager = new TestLocalTaskManager();
    });

    afterEach(() => {
        manager.dispose();
        jest.restoreAllMocks();
    });

    describe('Manager 基本属性', () => {
        it('isRemote 应该为 false', () => {
            expect(manager.isRemote).toBe(false);
        });

        it('sourceData 应该是 Map', () => {
            expect(manager.sourceData).toBeInstanceOf(Map);
        });

        it('items 应该是数组', () => {
            expect(Array.isArray(manager.items)).toBe(true);
        });
    });

    describe('LocalListAbility: list() 从远程获取数据', () => {
        it('list() 应该填充 sourceData 和 items', async () => {
            mockFetchList([
                { id: 1, title: 'Task 1', completed: false },
                { id: 2, title: 'Task 2', completed: true },
            ]);

            await manager.list();

            expect(manager.sourceData.size).toBe(2);
            // list() 内部 updateData 使用防抖 refreshView，手动触发
            manager.refreshView();
            expect(manager.items.length).toBe(2);
        });

        it('list() 后 get() 应该能查到数据', async () => {
            mockFetchList([{ id: 1, title: 'Task 1', completed: false }]);

            await manager.list();

            const item = manager.get(1);
            expect(item).toBeDefined();
            expect(item.title).toBe('Task 1');
        });

        it('list() 返回空数据时应该安全处理', async () => {
            mockFetchList([]);

            await manager.list();

            expect(manager.sourceData.size).toBe(0);
            expect(manager.items.length).toBe(0);
        });
    });

    describe('LocalGetAbility: get() 本地查询', () => {
        it('get() 不存在的 ID 应该返回 null 或 undefined', () => {
            const result = manager.get(999);
            expect(result == null).toBe(true);
        });

        it('get() 应该设置 item', async () => {
            mockFetchList([{ id: 1, title: 'Task 1', completed: false }]);

            await manager.list();
            manager.get(1);

            expect(manager.item).toBeDefined();
            expect(manager.item!.title).toBe('Task 1');
        });
    });

    describe('FlatLocalMutationAbility: create() 本地新增', () => {
        it('create() 应该添加到 sourceData', () => {
            manager.create({ id: 1, title: 'New Task', completed: false });

            expect(manager.sourceData.size).toBe(1);
        });

        it('create() 后 items 应该包含新项', () => {
            manager.create({ id: 1, title: 'New Task', completed: false });

            // create 使用防抖 refreshView，手动触发确保 items 更新
            manager.refreshView();
            expect(manager.items.length).toBe(1);
            expect(manager.items[0].title).toBe('New Task');
        });

        it('create() 应该标记 hasChanges=true', () => {
            manager.create({ id: 1, title: 'New Task', completed: false });

            expect(manager.hasChanges).toBe(true);
        });

        it('create() 应该将新项记入 changes.added', () => {
            manager.create({ id: 1, title: 'New Task', completed: false });

            expect(manager.changes.added.length).toBe(1);
        });
    });

    describe('FlatLocalMutationAbility: update() 本地更新', () => {
        it('update() 应该更新 sourceData 中的数据', async () => {
            mockFetchList([{ id: 1, title: 'Task 1', completed: false }]);
            await manager.list();

            manager.update({ id: 1, title: 'Updated Task', completed: true });

            const item = manager.sourceData.get(1)!;
            expect(item.title).toBe('Updated Task');
            expect(item.completed).toBe(true);
        });

        it('update() 应该标记 hasChanges=true', async () => {
            mockFetchList([{ id: 1, title: 'Task 1', completed: false }]);
            await manager.list();

            manager.update({ id: 1, title: 'Updated', completed: true });

            expect(manager.hasChanges).toBe(true);
        });

        it('update() 应该将更新记入 changes.updated', async () => {
            mockFetchList([{ id: 1, title: 'Task 1', completed: false }]);
            await manager.list();

            manager.update({ id: 1, title: 'Updated', completed: true });

            expect(manager.changes.updated.size).toBe(1);
        });

        it('新增项的 update 不应该记入 changes.updated', () => {
            manager.create({ id: 1, title: 'New Task', completed: false });
            manager.update({ id: 1, title: 'Updated New Task', completed: true });

            // 新增项的更新仍然在 added 中，不应出现在 updated 中
            expect(manager.changes.updated.size).toBe(0);
            expect(manager.changes.added.length).toBe(1);
        });
    });

    describe('FlatLocalMutationAbility: toggle() 切换布尔字段', () => {
        it('toggle() 应该切换布尔字段值', async () => {
            mockFetchList([{ id: 1, title: 'Task 1', completed: false }]);
            await manager.list();

            const item = manager.get(1)!;
            manager.toggle(item, 'completed');

            const updated = manager.sourceData.get(1)!;
            expect(updated.completed).toBe(true);
        });
    });

    describe('FlatLocalDeleteAbility: delete() 软删除', () => {
        it('delete() 本地新增项应该直接删除（localOnly）', async () => {
            manager.create({ id: 1, title: 'New Task', completed: false });

            await manager.delete([1]);

            expect(manager.sourceData.has(1)).toBe(false);
        });

        it('delete() 已持久化项应该从 sourceData 移除', async () => {
            mockFetchList([{ id: 1, title: 'Task 1', completed: false }]);
            await manager.list();

            await manager.delete([1], true);

            expect(manager.sourceData.has(1)).toBe(false);
        });

        it('softDelete + rollbackDelete 应该恢复软删除的数据', async () => {
            mockFetchList([{ id: 1, title: 'Task 1', completed: false }]);
            await manager.list();

            // 手动调用 softDelete（不 confirmDelete），这样 rollbackDelete 才能恢复
            const plan = manager.getDeletionPlan([1]);
            await manager.softDelete(plan);

            expect(manager.sourceData.has(1)).toBe(false);

            await manager.rollbackDelete();

            expect(manager.sourceData.has(1)).toBe(true);
        });
    });

    describe('StateSearchAbility: filter() 和 sort()', () => {
        beforeEach(async () => {
            mockFetchList([
                { id: 1, title: 'Alpha Task', description: 'First', completed: false },
                { id: 2, title: 'Beta Task', description: 'Second', completed: true },
                { id: 3, title: 'Gamma Task', description: 'Third', completed: false },
            ]);
            await manager.list();
        });

        it('filter() + refreshView 应该按关键词过滤 items', () => {
            (manager as any).filter('Alpha');
            manager.refreshView();

            expect(manager.items.length).toBe(1);
            expect(manager.items[0].title).toBe('Alpha Task');
        });

        it('filter() 空关键词 + refreshView 应该返回全部', () => {
            (manager as any).filter('');
            manager.refreshView();

            expect(manager.items.length).toBe(3);
        });

        it('sort() + refreshView 应该按字段排序', () => {
            manager.sort('title', 'desc');
            manager.refreshView();

            expect(manager.items[0].title).toBe('Gamma Task');
            expect(manager.items[2].title).toBe('Alpha Task');
        });
    });

    describe('StateDirtyAbility: 脏检查', () => {
        it('startEdit + isDirty 应该检测到变更', async () => {
            mockFetchList([{ id: 1, title: 'Task 1', completed: false }]);
            await manager.list();

            const item = manager.get(1)!;
            manager.startEdit(item);

            // 修改
            item.title = 'Modified Task';

            expect(manager.isDirty(item)).toBe(true);
        });

        it('cancelEdit 应该恢复原始数据', async () => {
            mockFetchList([{ id: 1, title: 'Task 1', completed: false }]);
            await manager.list();

            const item = manager.get(1)!;
            manager.startEdit(item);
            item.title = 'Modified Task';

            manager.cancelEdit(item);

            expect(item.title).toBe('Task 1');
            expect(manager.isDirty(item)).toBe(false);
        });

        it('submitEdit 应该清除脏状态', async () => {
            mockFetchList([{ id: 1, title: 'Task 1', completed: false }]);
            await manager.list();

            const item = manager.get(1)!;
            manager.startEdit(item);
            item.title = 'Modified Task';

            manager.submitEdit(item);

            expect(manager.isDirty(item)).toBe(false);
            // 但数据不会恢复
            expect(item.title).toBe('Modified Task');
        });
    });

    describe('refreshView() 视图刷新', () => {
        it('直接操作 sourceData 后 refreshView 应该更新 items', () => {
            manager.sourceData.set(1, { id: 1, title: 'Task 1', completed: false });
            manager.sourceData.set(2, { id: 2, title: 'Task 2', completed: true });

            manager.refreshView();

            expect(manager.items.length).toBe(2);
        });
    });

    describe('clearChanges() 清空变更集', () => {
        it('clearChanges 后 hasChanges 应该为 false', () => {
            manager.create({ id: 1, title: 'New Task', completed: false });

            expect(manager.hasChanges).toBe(true);

            manager.clearChanges();

            expect(manager.hasChanges).toBe(false);
        });
    });
});
