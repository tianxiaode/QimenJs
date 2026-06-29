/**
 * FlatLocalEntityState 单元测试
 * 
 * 测试本地平面数据管理功能：
 * 1. 增：本地添加，可选批量提交
 * 2. 删：本地软删除，可区分本地删除和持久删除
 * 3. 改：本地更新，可选批量提交
 * 4. 查：本地查询
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

import { FlatLocalEntityState } from '@/entity/state/FlatLocalEntityState';
import type { IEntity, ILocalSearchParams, IDeletionPlan, ILocalChangeSet } from '@/entity/types';
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

describe('FlatLocalEntityState', () => {
    let state: FlatLocalEntityState<ILocalSearchParams>;

    beforeEach(() => {
        state = new FlatLocalEntityState(mockSchema, 300000);
    });

    afterEach(() => {
        state.dispose();
    });

    describe('初始化', () => {
        it('应该正确初始化状态', () => {
            expect(state.isRemote).toBe(false);
            expect(state.loading).toBe(false);
            expect(state.items).toEqual([]);
            expect(state.item).toBeNull();
            expect(state.sourceData).toBeInstanceOf(Map);
            expect(state.hasChanges).toBe(false);
            expect(state.changes.added).toEqual([]);
            expect(state.changes.updated).toBeInstanceOf(Map);
            expect(state.changes.deleted).toEqual([]);
        });
    });

    describe('增加（本地添加）', () => {
        it('应该支持本地添加单个实体', async () => {
            const newUser: User = {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
            };

            await state.addItem(newUser);

            expect(state.hasChanges).toBe(true);
            expect(state.changes.added).toHaveLength(1);
            expect(state.changes.added[0]).toEqual(newUser);
            expect(state.sourceData.get('1')).toEqual(newUser);
        });

        it('应该支持本地添加多个实体', async () => {
            const users: User[] = [
                { id: '1', name: 'John Doe', email: 'john@example.com' },
                { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
            ];

            for (const user of users) {
                await state.addItem(user);
            }

            expect(state.changes.added).toHaveLength(2);
            expect(state.sourceData.size).toBe(2);
        });

        it('添加后应该在视图中显示', async () => {
            const newUser: User = {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
            };

            await state.addItem(newUser);
            await state.refreshView();

            expect(state.items).toHaveLength(1);
            expect(state.items[0]).toEqual(newUser);
        });
    });

    describe('删除（本地软删除）', () => {
        beforeEach(async () => {
            // 预先添加一些数据
            await state.updateData([
                { id: '1', name: 'John Doe', email: 'john@example.com' },
                { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
                { id: '3', name: 'Bob Smith', email: 'bob@example.com' },
            ]);
            await state.refreshView();
        });

        it('应该支持本地软删除', async () => {
            const plan: IDeletionPlan<User> = {
                localOnly: [
                    { id: '1', name: 'John Doe', email: 'john@example.com' },
                    { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
                ],
                persistent: [
                    { id: '3', name: 'Bob Smith', email: 'bob@example.com' },
                ],
            };

            await state.softDelete(plan);

            expect(state.hasChanges).toBe(true);
            expect(state.changes.deleted).toEqual(['1', '2', '3']);
            expect(state.sourceData.get('1')).toBeUndefined();
            expect(state.sourceData.get('2')).toBeUndefined();
            expect(state.sourceData.get('3')).toBeUndefined();
        });

        it('应该正确区分本地删除和持久删除', async () => {
            const plan: IDeletionPlan<User> = {
                localOnly: [
                    { id: '1', name: 'John Doe', email: 'john@example.com' },
                ],
                persistent: [
                    { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
                ],
            };

            await state.softDelete(plan);

            expect(state.changes.deleted).toEqual(['1', '2']);
        });

        it('删除后应该从视图中移除', async () => {
            const plan: IDeletionPlan<User> = {
                localOnly: [
                    { id: '1', name: 'John Doe', email: 'john@example.com' },
                ],
                persistent: [],
            };

            await state.softDelete(plan);
            await state.refreshView();

            expect(state.items).toHaveLength(2);
            expect(state.items.find(u => u.id === '1')).toBeUndefined();
        });

        it('应该支持获取删除计划', () => {
            const plan = state.getDeletionPlan(['1', '2']);
            
            // 1 和 2 都在 sourceData 中，所以都是 persistent
            expect(plan.localOnly).toEqual([]);
            expect(plan.persistent).toHaveLength(2);
        });

        it('应该支持确认删除', async () => {
            const plan: IDeletionPlan<User> = {
                localOnly: [
                    { id: '1', name: 'John Doe', email: 'john@example.com' },
                ],
                persistent: [
                    { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
                ],
            };

            await state.softDelete(plan);
            await state.confirmDelete();

            expect(state.changes.added).toEqual([]);
            expect(state.changes.updated).toBeInstanceOf(Map);
            expect(state.changes.deleted).toEqual([]);
        });

        it('应该支持回滚删除', async () => {
            const plan: IDeletionPlan<User> = {
                localOnly: [
                    { id: '1', name: 'John Doe', email: 'john@example.com' },
                ],
                persistent: [],
            };

            await state.softDelete(plan);
            await state.rollbackDelete();

            expect(state.changes.deleted).toEqual([]);
            expect(state.sourceData.get('1')).toBeDefined();
        });
    });

    describe('更新（本地更新）', () => {
        beforeEach(async () => {
            await state.updateData([
                { id: '1', name: 'John Doe', email: 'john@example.com' },
                { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
            ]);
            await state.refreshView();
        });

        it('应该支持本地更新单个实体', async () => {
            const updatedUser: User = {
                id: '1',
                name: 'John Smith',
                email: 'john.smith@example.com',
            };

            await state.updateItem(updatedUser);

            expect(state.hasChanges).toBe(true);
            expect(state.changes.updated).toBeInstanceOf(Map);
            expect(state.changes.updated.get('1')).toEqual(updatedUser);
        });

        it('应该支持本地更新多个实体', async () => {
            await state.updateItem({ id: '1', name: 'John Smith', email: 'john.smith@example.com' });
            await state.updateItem({ id: '2', name: 'Jane Smith', email: 'jane.smith@example.com' });

            expect(state.changes.updated.size).toBe(2);
        });

        it('更新后应该在视图中反映', async () => {
            await state.updateItem({ id: '1', name: 'John Smith', email: 'john.smith@example.com' });
            await state.refreshView();

            const updated = state.items.find(u => u.id === '1');
            expect(updated?.name).toBe('John Smith');
        });

        it('应该支持清除本地变更', async () => {
            await state.updateItem({ id: '1', name: 'John Smith', email: 'john.smith@example.com' });
            await state.clearChanges();

            expect(state.hasChanges).toBe(false);
            expect(state.changes.added).toEqual([]);
            expect(state.changes.updated).toBeInstanceOf(Map);
            expect(state.changes.deleted).toEqual([]);
        });
    });

    describe('查询（本地查询）', () => {
        beforeEach(async () => {
            await state.updateData([
                { id: '1', name: 'John Doe', email: 'john@example.com' },
                { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
                { id: '3', name: 'Bob Smith', email: 'bob@example.com' },
                { id: '4', name: 'Alice Johnson', email: 'alice@example.com' },
            ]);
        });

        it('应该支持关键词搜索', async () => {
            state.search = { keyword: 'John' } as ILocalSearchParams;
            await state.refreshView();

            expect(state.items).toHaveLength(2);
            expect(state.items.every(u => u.name.includes('John'))).toBe(true);
        });

        it('应该支持排序', async () => {
            state.search = {
                sortBy: 'name',
                sortOrder: 'desc',
            } as ILocalSearchParams;
            await state.refreshView();

            expect(state.items[0].name).toBe('John Doe');
            expect(state.items[state.items.length - 1].name).toBe('Alice Johnson');
        });

        it('应该支持关键词搜索和排序组合', async () => {
            state.search = {
                keyword: 'Doe',
                sortBy: 'name',
                sortOrder: 'asc',
            } as ILocalSearchParams;
            await state.refreshView();

            expect(state.items).toHaveLength(2);
            expect(state.items[0].name).toBe('Jane Doe');
            expect(state.items[1].name).toBe('John Doe');
        });

        it('空关键词应该返回所有数据', async () => {
            state.search = { keyword: '' } as ILocalSearchParams;
            await state.refreshView();

            expect(state.items).toHaveLength(4);
        });
    });

    describe('批量操作', () => {
        it('应该支持批量添加', async () => {
            const users: User[] = [
                { id: '1', name: 'John Doe', email: 'john@example.com' },
                { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
                { id: '3', name: 'Bob Smith', email: 'bob@example.com' },
            ];

            for (const user of users) {
                await state.addItem(user);
            }

            expect(state.changes.added).toHaveLength(3);
            await state.refreshView();
            expect(state.items).toHaveLength(3);
        });

        it('应该支持批量更新', async () => {
            await state.updateData([
                { id: '1', name: 'John Doe', email: 'john@example.com' },
                { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
            ]);

            await state.updateItem({ id: '1', name: 'John Smith', email: 'john.smith@example.com' });
            await state.updateItem({ id: '2', name: 'Jane Smith', email: 'jane.smith@example.com' });

            expect(state.changes.updated.size).toBe(2);
        });
    });

    describe('变更管理', () => {
        it('应该正确跟踪变更状态', async () => {
            expect(state.hasChanges).toBe(false);

            await state.addItem({ id: '1', name: 'John Doe', email: 'john@example.com' });
            expect(state.hasChanges).toBe(true);

            await state.clearChanges();
            expect(state.hasChanges).toBe(false);
        });

        it('应该正确区分不同类型的变更', async () => {
            await state.updateData([{ id: '1', name: 'John Doe', email: 'john@example.com' }]);

            await state.addItem({ id: '2', name: 'Jane Doe', email: 'jane@example.com' });
            await state.updateItem({ id: '1', name: 'John Smith', email: 'john.smith@example.com' });
            await state.softDelete({ localOnly: [], persistent: [{ id: '1', name: 'John Smith', email: 'john.smith@example.com' }] });

            const changes: ILocalChangeSet<User> = state.changes;
            expect(changes.added).toHaveLength(1);
            expect(changes.updated.size).toBe(1);
            expect(changes.deleted).toHaveLength(1);
        });
    });

    describe('资源清理', () => {
        it('应该正确清理资源', () => {
            state.dispose();

            expect(state.sourceData.size).toBe(0);
            expect(state.items).toEqual([]);
            expect(state.item).toBeNull();
        });
    });
});

