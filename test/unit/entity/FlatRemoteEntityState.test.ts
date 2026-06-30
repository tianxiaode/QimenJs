/**
 * FlatRemoteEntityState 单元测试
 * 
 * 测试远程平面数据管理功能：
 * 1. 初始化：验证远程状态默认值
 * 2. refreshView：验证数组引用替换
 * 3. isDirty/edit/rollback：验证脏数据追踪能力
 * 4. 资源清理：验证 dispose 正确清理
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

import { FlatRemoteEntityState } from '@/entity/state/FlatRemoteEntityState';
import type { IEntity, IFlatSearchParams } from '@/entity/types';
import type { FlatSchema } from '@/schema';

interface User extends IEntity {
    id: string;
    name: string;
    email: string;
}

const mockSchema: FlatSchema = {
    name: 'User',
    domain: 'default',
    idField: 'id',
    isTree: false,
    searchFields: ['name', 'email'],
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
    ],
};

describe('FlatRemoteEntityState', () => {
    let state: FlatRemoteEntityState<IFlatSearchParams>;

    beforeEach(() => {
        state = new FlatRemoteEntityState(mockSchema, 300000);
    });

    afterEach(() => {
        state.dispose();
    });

    describe('初始化', () => {
        it('应该正确初始化远程状态默认值', () => {
            expect(state.isRemote).toBe(true);
            expect(state.total).toBe(0);
            expect(state.page).toBe(1);
            expect(state.pageSize).toBe(20);
            expect(state.pages).toBe(0);
            expect(state.hasMore).toBe(false);
            expect(state.items).toEqual([]);
            expect(state.loading).toBe(false);
        });

        it('应该正确初始化基类状态', () => {
            expect(state.item).toBeNull();
            expect(state.schema).toBe(mockSchema);
            expect(state.cacheTTL).toBe(300000);
        });
    });

    describe('refreshView', () => {
        it('应该替换 items 数组引用以触发响应式更新', () => {
            const originalItems = state.items;
            state.refreshView();
            expect(state.items).not.toBe(originalItems);
            expect(state.items).toEqual([]);
        });

        it('应该保持 items 内容不变', () => {
            const user: User = { id: '1', name: 'John Doe', email: 'john@example.com' };
            state.items = [user];

            const originalItems = state.items;
            state.refreshView();

            expect(state.items).not.toBe(originalItems);
            expect(state.items).toHaveLength(1);
            expect(state.items[0]).toEqual(user);
        });

        it('多次 refreshView 应该每次都产生新的数组引用', () => {
            state.items = [{ id: '1', name: 'John Doe', email: 'john@example.com' }];

            const ref1 = state.items;
            state.refreshView();
            const ref2 = state.items;
            state.refreshView();
            const ref3 = state.items;

            expect(ref1).not.toBe(ref2);
            expect(ref2).not.toBe(ref3);
            expect(ref1).not.toBe(ref3);
        });
    });

    describe('isDirty/edit/rollback', () => {
        it('初始状态 isDirty 应该返回 false', () => {
            expect(state.isDirty()).toBe(false);
        });

        it('调用 edit 后 isDirty 应该返回 true', () => {
            const user: User = { id: '1', name: 'John Doe', email: 'john@example.com' };
            state.edit(user);

            expect(state.isDirty()).toBe(true);
        });

        it('对同一实体多次 edit 后 isDirty 仍为 true', () => {
            const user: User = { id: '1', name: 'John Doe', email: 'john@example.com' };
            state.edit(user);
            state.edit(user);

            expect(state.isDirty()).toBe(true);
        });

        it('对多个实体 edit 后 isDirty 应该返回 true', () => {
            state.edit({ id: '1', name: 'John Doe', email: 'john@example.com' });
            state.edit({ id: '2', name: 'Jane Doe', email: 'jane@example.com' });

            expect(state.isDirty()).toBe(true);
        });

        it('rollback 应该清除脏状态', () => {
            const user: User = { id: '1', name: 'John Doe', email: 'john@example.com' };
            state.edit(user);
            expect(state.isDirty()).toBe(true);

            state.rollback();
            expect(state.isDirty()).toBe(false);
        });

        it('rollback 后再次 edit 仍然可以标记为脏', () => {
            const user: User = { id: '1', name: 'John Doe', email: 'john@example.com' };
            state.edit(user);
            state.rollback();
            expect(state.isDirty()).toBe(false);

            state.edit(user);
            expect(state.isDirty()).toBe(true);
        });

        it('isDirty 传入特定实体时应正确判断', () => {
            const user1: User = { id: '1', name: 'John Doe', email: 'john@example.com' };
            const user2: User = { id: '2', name: 'Jane Doe', email: 'jane@example.com' };

            state.edit(user1);

            // user1 有快照，但当前值与快照相同，所以 isDirty(item) 返回 false
            expect(state.isDirty(user1)).toBe(false);
            // user2 没有快照
            expect(state.isDirty(user2)).toBe(false);
        });

        it('isDirty 传入已修改的实体时应返回 true', () => {
            const user: User = { id: '1', name: 'John Doe', email: 'john@example.com' };
            state.edit(user);

            // 修改实体属性
            user.name = 'John Smith';
            expect(state.isDirty(user)).toBe(true);
        });

        it('rollback 后 isDirty 传入任何实体都应返回 false', () => {
            const user: User = { id: '1', name: 'John Doe', email: 'john@example.com' };
            state.edit(user);
            user.name = 'John Smith';

            state.rollback();

            expect(state.isDirty()).toBe(false);
            expect(state.isDirty(user)).toBe(false);
        });
    });

    describe('资源清理', () => {
        it('应该正确清理资源', () => {
            state.edit({ id: '1', name: 'John Doe', email: 'john@example.com' });
            state.items = [{ id: '1', name: 'John Doe', email: 'john@example.com' }];

            state.dispose();

            expect(state.items).toEqual([]);
            expect(state.item).toBeNull();
            expect(state.loading).toBe(false);
        });

        it('dispose 后 isDirty 无参调用应返回 false', () => {
            state.edit({ id: '1', name: 'John Doe', email: 'john@example.com' });
            expect(state.isDirty()).toBe(true);

            state.dispose();

            // dispose 后 StateDirtyAbility.onDispose() 清除了 _snapshots，
            // isDirty() 无参调用直接返回 _snapshots.size > 0，不需要访问 schema
            expect(state.isDirty()).toBe(false);
        });
    });
});
