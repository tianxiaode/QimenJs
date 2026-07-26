/**
 * LocalMutationAbility 独立单元测试
 *
 * 验证本地变更能力的核心行为：
 * 1. hasChanges / changes 状态
 * 2. addItem / updateItem / updateData
 * 3. softDelete / getDeletionPlan / confirmDelete / rollbackDelete
 * 4. clearChanges
 * 5. 多宿主隔离（abilityStates）
 * 6. dispose 后安全性
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
import { LocalMutationAbility } from '@/entity/abilities/mutation/LocalMutationAbility';
import { DebounceAbility } from '@/system-abilities/system';

// ============================================
// 辅助
// ============================================

function createMutationHost() {
    class MutationHost extends ComposableBase {
        schema = { idField: 'id', idType: 'string' };
        sourceData = new Map<string, any>();
        setCache = jest.fn().mockResolvedValue(undefined);
        refreshView = jest.fn();
    }
    withAbilities(MutationHost, [LocalMutationAbility, DebounceAbility]);
    return new MutationHost() as any;
}

// ============================================
// 测试
// ============================================

describe('LocalMutationAbility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('hasChanges / changes', () => {
        it('初始状态 hasChanges 应为 false', () => {
            const host = createMutationHost();
            expect(host.hasChanges).toBe(false);
            host.dispose();
        });

        it('初始状态 changes 应为空变更集', () => {
            const host = createMutationHost();
            const changes = host.changes;
            expect(changes.added).toEqual([]);
            expect(changes.updated.size).toBe(0);
            expect(changes.deleted).toEqual([]);
            host.dispose();
        });
    });

    describe('addItem', () => {
        it('应添加项到 changes.added', async () => {
            const host = createMutationHost();
            const item = { id: '1', name: 'test' };
            await host.addItem(item);
            expect(host.hasChanges).toBe(true);
            expect(host.changes.added).toContainEqual(
                expect.objectContaining({ id: '1', name: 'test', isNew: true })
            );
            host.dispose();
        });

        it('应设置 tempId 和 isNew', async () => {
            const host = createMutationHost();
            const item: any = { id: '1', name: 'test' };
            await host.addItem(item);
            expect(item.tempId).toBeDefined();
            expect(item.isNew).toBe(true);
            host.dispose();
        });

        it('应同步更新 sourceData', async () => {
            const host = createMutationHost();
            const item = { id: '1', name: 'test' };
            await host.addItem(item);
            expect(host.sourceData.get('1')).toBeDefined();
            host.dispose();
        });
    });

    describe('updateItem', () => {
        it('应将已存在项添加到 changes.updated', async () => {
            const host = createMutationHost();
            host.sourceData.set('1', { id: '1', name: 'old' });
            await host.updateItem({ id: '1', name: 'new' });
            expect(host.changes.updated.has('1')).toBe(true);
            expect(host.changes.updated.get('1')).toEqual({ id: '1', name: 'new' });
            host.dispose();
        });

        it('新增项的更新不应加入 changes.updated', async () => {
            const host = createMutationHost();
            const item = { id: '1', name: 'test' };
            await host.addItem(item);
            await host.updateItem({ id: '1', name: 'updated' });
            expect(host.changes.updated.has('1')).toBe(false);
            host.dispose();
        });
    });

    describe('updateData', () => {
        it('应重置 changes 并更新 sourceData', async () => {
            const host = createMutationHost();
            await host.addItem({ id: '1', name: 'a' });
            expect(host.hasChanges).toBe(true);

            await host.updateData([{ id: '2', name: 'b' }]);
            expect(host.changes.added).toEqual([]);
            expect(host.sourceData.get('2')).toEqual({ id: '2', name: 'b' });
            host.dispose();
        });
    });

    describe('softDelete / getDeletionPlan / confirmDelete / rollbackDelete', () => {
        it('getDeletionPlan 应区分本地和持久化删除', async () => {
            const host = createMutationHost();
            await host.addItem({ id: 'temp1', name: 'new item' });
            host.sourceData.set('persist1', { id: 'persist1', name: 'old item' });

            const plan = host.getDeletionPlan(['temp1', 'persist1']);
            expect(plan.localOnly).toContain('temp1');
            expect(plan.persistent).toContain('persist1');
            host.dispose();
        });

        it('softDelete 应保存快照并标记删除', async () => {
            const host = createMutationHost();
            host.sourceData.set('1', { id: '1', name: 'item' });
            await host.softDelete({ localOnly: [], persistent: [{ id: '1', name: 'item' }] });
            expect(host.changes.deleted).toContain('1');
            expect(host.sourceData.has('1')).toBe(false);
            host.dispose();
        });

        it('confirmDelete 应清除删除快照和 deleted 列表', async () => {
            const host = createMutationHost();
            host.sourceData.set('1', { id: '1', name: 'item' });
            await host.softDelete({ localOnly: [], persistent: [{ id: '1', name: 'item' }] });
            await host.confirmDelete();
            expect(host.changes.deleted).toEqual([]);
            host.dispose();
        });

        it('rollbackDelete 应恢复被删除的项', async () => {
            const host = createMutationHost();
            host.sourceData.set('1', { id: '1', name: 'item' });
            await host.softDelete({ localOnly: [], persistent: [{ id: '1', name: 'item' }] });
            expect(host.sourceData.has('1')).toBe(false);

            await host.rollbackDelete();
            expect(host.sourceData.get('1')).toEqual({ id: '1', name: 'item' });
            expect(host.changes.deleted).toEqual([]);
            host.dispose();
        });

        it('无删除时 rollbackDelete 不应报错', async () => {
            const host = createMutationHost();
            await host.rollbackDelete();
            // 不抛异常即可
            host.dispose();
        });

        it('softDelete 传入纯 ID 列表（非对象）时应正确处理', async () => {
            const host = createMutationHost();
            host.sourceData.set('1', { id: '1', name: 'local item' });
            await host.addItem({ id: '2', name: 'new item' });
            host.sourceData.set('3', { id: '3', name: 'persist item' });

            // 传入纯 ID（字符串），非对象
            await host.softDelete({ localOnly: ['2'], persistent: ['3'] });
            expect(host.changes.deleted).toContain('2');
            expect(host.changes.deleted).toContain('3');
            expect(host.sourceData.has('2')).toBe(false);
            expect(host.sourceData.has('3')).toBe(false);
            host.dispose();
        });

        it('softDelete 同时有 localOnly 和 persistent 项时', async () => {
            const host = createMutationHost();
            await host.addItem({ id: 'local1', name: 'local item' });
            host.sourceData.set('persist1', { id: 'persist1', name: 'persist item' });

            await host.softDelete({
                localOnly: [{ id: 'local1', name: 'local item' }],
                persistent: [{ id: 'persist1', name: 'persist item' }],
            });

            // localOnly 项应从 changes.added 中移除并加入 changes.deleted
            expect(host.changes.added.length).toBe(0);
            expect(host.changes.deleted).toContain('local1');
            // persistent 项直接加入 changes.deleted
            expect(host.changes.deleted).toContain('persist1');
            host.dispose();
        });

        it('rollbackDelete 无快照但有 changes.deleted 时应清空 deleted', async () => {
            const host = createMutationHost();
            // 手动设置 changes.deleted（不通过 softDelete，因此无快照）
            const changes = host._getOrCreateChanges();
            changes.deleted.push('manual1');
            expect(host.changes.deleted).toContain('manual1');

            await host.rollbackDelete();
            expect(host.changes.deleted).toEqual([]);
            host.dispose();
        });
    });

    describe('_commitChange', () => {
        it('addItem 后应调用 setCache 更新缓存', async () => {
            const host = createMutationHost();
            await host.addItem({ id: '1', name: 'test' });
            expect(host.setCache).toHaveBeenCalled();
            host.dispose();
        });

        it('addItem 后应触发 debounce 刷新视图', async () => {
            const host = createMutationHost();
            const debounceSpy = jest.spyOn(host, 'debounce');
            await host.addItem({ id: '1', name: 'test' });
            expect(debounceSpy).toHaveBeenCalledWith('refreshView', expect.any(Function), 50);
            host.dispose();
        });
    });

    describe('clearChanges', () => {
        it('应重置所有变更', async () => {
            const host = createMutationHost();
            await host.addItem({ id: '1', name: 'a' });
            expect(host.hasChanges).toBe(true);

            host.clearChanges();
            expect(host.hasChanges).toBe(false);
            host.dispose();
        });
    });

    describe('多宿主隔离', () => {
        it('两个宿主应有独立的变更状态', async () => {
            const host1 = createMutationHost();
            const host2 = createMutationHost();

            await host1.addItem({ id: '1', name: 'a' });
            expect(host1.hasChanges).toBe(true);
            expect(host2.hasChanges).toBe(false);

            host1.dispose();
            host2.dispose();
        });

        it('dispose 一个宿主不应影响另一个', async () => {
            const host1 = createMutationHost();
            const host2 = createMutationHost();

            await host1.addItem({ id: '1', name: 'a' });
            await host2.addItem({ id: '2', name: 'b' });

            host1.dispose();
            expect(host2.hasChanges).toBe(true);

            host2.dispose();
        });
    });

    describe('dispose 后安全性', () => {
        it('dispose 后 hasChanges 应返回 false', async () => {
            const host = createMutationHost();
            await host.addItem({ id: '1', name: 'a' });
            host.dispose();
            expect(host.hasChanges).toBe(false);
        });
    });
});
