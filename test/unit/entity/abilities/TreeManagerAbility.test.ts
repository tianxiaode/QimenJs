/**
 * TreeManagerAbility 单元测试
 *
 * 覆盖：
 * 1. expand / collapse
 * 2. move
 * 3. refresh / getSubTree
 * 4. isDirty / edit / rollback
 * 5. _setExpandState / _expand / _refreshChildren / _moveNode
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

import { ComposableBase } from '@/composable/ComposableBase';
import { withAbilities } from '@/composable';
import { TreeManagerAbility } from '@/entity/abilities/remote/TreeManagerAbility';
import { DirtyAbility } from '@/entity/abilities/core/DirtyAbility';

function createTreeHost() {
    const mockDebounce = jest.fn((_key: string, fn: any, _ms: number, _immediate?: boolean) => fn);

    class TreeHost extends ComposableBase {
        schema = { idField: 'id', parentIdField: 'parentId' };
        debounce = mockDebounce as any;

        // Mock methods called by TreeManagerAbility
        toggleExpand = jest.fn();
        refreshView = jest.fn();
        isLoaded = jest.fn().mockReturnValue(false);
        syncChildren = jest.fn();
        updateData = jest.fn();
        setLoaded = jest.fn();
        moveNode = jest.fn();
        getChildren = jest.fn().mockReturnValue([]);
        buildOptions = jest.fn().mockResolvedValue({});
        fetch = jest.fn().mockResolvedValue({ data: { list: [] } });
        emit = jest.fn();

        parentIdField = 'parentId';
        idField = 'id';
    }
    withAbilities(TreeHost, [TreeManagerAbility, DirtyAbility]);
    const host = new TreeHost() as any;
    return { host, mockDebounce };
}

describe('TreeManagerAbility', () => {
    describe('expand', () => {
        it('应调用 debounce 并展开节点', async () => {
            const { host, mockDebounce } = createTreeHost();
            host.isLoaded.mockReturnValue(true);

            await host.expand('node-1');

            expect(mockDebounce).toHaveBeenCalledWith('expand', expect.any(Function), 200, true);
            expect(host.toggleExpand).toHaveBeenCalledWith('node-1', true);
            expect(host.emit).toHaveBeenCalledWith('expanded', { id: 'node-1' });
            host.dispose();
        });

        it('未加载时应先刷新再展开', async () => {
            const { host } = createTreeHost();
            host.isLoaded.mockReturnValue(false);
            host.fetch.mockResolvedValue({ data: { list: [{ id: 'child-1' }] } });

            await host.expand('node-1');

            expect(host.fetch).toHaveBeenCalled();
            expect(host.toggleExpand).toHaveBeenCalledWith('node-1', true);
            expect(host.emit).toHaveBeenCalledWith('expanded', { id: 'node-1' });
            host.dispose();
        });
    });

    describe('collapse', () => {
        it('应调用 _setExpandState 设置为 false', () => {
            const { host } = createTreeHost();
            host.collapse('node-1');
            expect(host.toggleExpand).toHaveBeenCalledWith('node-1', false);
            expect(host.refreshView).toHaveBeenCalled();
            expect(host.emit).toHaveBeenCalledWith('collapsed', { id: 'node-1' });
            host.dispose();
        });
    });

    describe('move', () => {
        it('应调用 _moveNode', async () => {
            const { host } = createTreeHost();
            await host.move('node-1', 'new-parent');
            expect(host.fetch).toHaveBeenCalledWith('update', expect.anything());
            expect(host.moveNode).toHaveBeenCalledWith('node-1', 'new-parent');
            expect(host.refreshView).toHaveBeenCalled();
            expect(host.emit).toHaveBeenCalledWith('moved', {
                id: 'node-1',
                targetPid: 'new-parent',
            });
            host.dispose();
        });

        it('移动到根节点时 targetPid 为 null', async () => {
            const { host } = createTreeHost();
            await host.move('node-1', null);
            expect(host.moveNode).toHaveBeenCalledWith('node-1', null);
            expect(host.emit).toHaveBeenCalledWith('moved', { id: 'node-1', targetPid: null });
            host.dispose();
        });
    });

    describe('refresh', () => {
        it('应调用 debounce 并刷新子节点', async () => {
            const { host, mockDebounce } = createTreeHost();
            host.fetch.mockResolvedValue({ data: { list: [{ id: 'c1' }] } });

            await host.refresh('parent-1');

            expect(mockDebounce).toHaveBeenCalledWith('refresh', expect.any(Function), 300, true);
            expect(host.fetch).toHaveBeenCalled();
            host.dispose();
        });
    });

    describe('getSubTree', () => {
        it('应调用 getChildren', () => {
            const { host } = createTreeHost();
            host.getChildren.mockReturnValue([{ id: 'c1' }]);
            const result = host.getSubTree('parent-1');
            expect(host.getChildren).toHaveBeenCalledWith('parent-1');
            expect(result).toEqual([{ id: 'c1' }]);
            host.dispose();
        });
    });

    describe('edit', () => {
        it('应调用 startEdit', () => {
            const { host } = createTreeHost();
            const item = { id: '1', name: 'test' };
            host.edit(item);
            expect(host.isDirty()).toBe(true);
            host.dispose();
        });
    });

    describe('rollback', () => {
        it('应调用 rollbackAll', () => {
            const { host } = createTreeHost();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            item.name = 'changed';
            host.rollback();
            expect(host.isDirty()).toBe(false);
            host.dispose();
        });
    });

    describe('_refreshChildren', () => {
        it('pid 不为 null 时应设置 loaded', async () => {
            const { host } = createTreeHost();
            host.fetch.mockResolvedValue({ data: { list: [{ id: 'c1' }] } });

            await host._refreshChildren('parent-1');

            expect(host.setLoaded).toHaveBeenCalledWith('parent-1', true);
            expect(host.syncChildren).toHaveBeenCalled();
            expect(host.updateData).toHaveBeenCalled();
            expect(host.emit).toHaveBeenCalledWith('childrenRefreshed', {
                pid: 'parent-1',
                items: [{ id: 'c1' }],
            });
            host.dispose();
        });

        it('pid 为 null 时不应设置 loaded', async () => {
            const { host } = createTreeHost();
            host.fetch.mockResolvedValue({ data: { list: [] } });

            await host._refreshChildren(null);

            expect(host.setLoaded).not.toHaveBeenCalled();
            expect(host.emit).toHaveBeenCalledWith('childrenRefreshed', { pid: null, items: [] });
            host.dispose();
        });
    });
});
