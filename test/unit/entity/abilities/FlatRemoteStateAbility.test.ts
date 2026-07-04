/**
 * FlatRemoteStateAbility 单元测试
 *
 * 覆盖：
 * 1. isEmpty 计算属性
 * 2. updateData / updateItem / isValidPage / deleteFromItems
 * 3. refreshView / edit / rollback
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

import { ComposableBase } from '@/composable/ComposableBase';
import { FlatRemoteStateAbility } from '@/entity/abilities/remote/FlatRemoteStateAbility';
import { DirtyAbility } from '@/entity/abilities/core/DirtyAbility';

function createRemoteHost() {
    class RemoteHost extends ComposableBase {
        static readonly abilities = [FlatRemoteStateAbility, DirtyAbility];
        schema = { idField: 'id' };
        items: any[] = [];
        item: any = null;
        total = 0;
        page = 1;
        pageSize = 10;
        pages = 0;
        hasMore = false;
        loading = false;
    }
    return new RemoteHost() as any;
}

describe('FlatRemoteStateAbility', () => {
    describe('isEmpty', () => {
        it('items 为空时应返回 true', () => {
            const host = createRemoteHost();
            host.items = [];
            expect(host.isEmpty).toBe(true);
            host.dispose();
        });

        it('items 非空时应返回 false', () => {
            const host = createRemoteHost();
            host.items = [{ id: '1' }];
            expect(host.isEmpty).toBe(false);
            host.dispose();
        });
    });

    describe('updateData', () => {
        it('应更新 items 和 total', () => {
            const host = createRemoteHost();
            host.updateData([{ id: '1' }, { id: '2' }], 100);
            expect(host.items.length).toBe(2);
            expect(host.total).toBe(100);
            expect(host.pages).toBe(10);
            expect(host.hasMore).toBe(true);
            host.dispose();
        });

        it('未传 total 时应使用 items.length', () => {
            const host = createRemoteHost();
            host.updateData([{ id: '1' }, { id: '2' }]);
            expect(host.total).toBe(2);
            host.dispose();
        });

        it('list 为 null 时应设为空数组', () => {
            const host = createRemoteHost();
            host.updateData(null as any);
            expect(host.items).toEqual([]);
            host.dispose();
        });
    });

    describe('updateItem', () => {
        it('应更新 item 和 items 中的对应项', () => {
            const host = createRemoteHost();
            host.items = [{ id: '1', name: 'old' }];
            host.updateItem({ id: '1', name: 'new' });
            expect(host.item.name).toBe('new');
            expect(host.items[0].name).toBe('new');
            host.dispose();
        });

        it('item 为 null 时应直接返回', () => {
            const host = createRemoteHost();
            host.items = [{ id: '1' }];
            host.updateItem(null);
            expect(host.item).toBeNull();
            host.dispose();
        });

        it('items 中无匹配 id 时不应修改 items', () => {
            const host = createRemoteHost();
            host.items = [{ id: '1', name: 'old' }];
            host.updateItem({ id: '2', name: 'new' });
            expect(host.item.name).toBe('new');
            expect(host.items.length).toBe(1);
            expect(host.items[0].id).toBe('1');
            host.dispose();
        });
    });

    describe('isValidPage', () => {
        it('有效页码应返回 true', () => {
            const host = createRemoteHost();
            host.pages = 5;
            expect(host.isValidPage(1)).toBe(true);
            expect(host.isValidPage(5)).toBe(true);
            host.dispose();
        });

        it('无效页码应返回 false', () => {
            const host = createRemoteHost();
            host.pages = 5;
            expect(host.isValidPage(0)).toBe(false);
            expect(host.isValidPage(6)).toBe(false);
            host.dispose();
        });
    });

    describe('deleteFromItems', () => {
        it('单个 id 应删除对应项', () => {
            const host = createRemoteHost();
            host.items = [{ id: '1' }, { id: '2' }, { id: '3' }];
            host.total = 3;
            host.deleteFromItems('1');
            expect(host.items.length).toBe(2);
            expect(host.total).toBe(2);
            host.dispose();
        });

        it('数组 id 应删除多个项', () => {
            const host = createRemoteHost();
            host.items = [{ id: '1' }, { id: '2' }, { id: '3' }];
            host.total = 3;
            host.deleteFromItems(['1', '3']);
            expect(host.items.length).toBe(1);
            expect(host.total).toBe(1);
            host.dispose();
        });
    });

    describe('refreshView', () => {
        it('应替换 items 数组引用', () => {
            const host = createRemoteHost();
            host.items = [{ id: '1' }];
            const oldRef = host.items;
            host.refreshView();
            expect(host.items).not.toBe(oldRef);
            expect(host.items).toEqual([{ id: '1' }]);
            host.dispose();
        });
    });

    describe('edit / rollback', () => {
        it('edit 应调用 startEdit', () => {
            const host = createRemoteHost();
            const item = { id: '1', name: 'test' };
            host.edit(item);
            // startEdit 创建了快照
            expect(host.isDirty()).toBe(true);
            host.dispose();
        });

        it('rollback 应调用 rollbackAll', () => {
            const host = createRemoteHost();
            const item = { id: '1', name: 'test' };
            host.edit(item);
            item.name = 'changed';
            host.rollback();
            expect(host.isDirty()).toBe(false);
            host.dispose();
        });
    });
});
