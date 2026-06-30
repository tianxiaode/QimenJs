/**
 * TreeRemoteEntityState 单元测试
 *
 * 测试树形远程数据管理功能：
 * 1. 初始化：验证树形远程状态默认值
 * 2. refreshView：验证 TreeViewAbility 覆盖后的行为
 * 3. ingest：验证数据摄入和路径构建
 * 4. 树操作：验证展开/折叠、节点移除、节点移动
 * 5. isDirty/startEdit/rollbackAll：验证脏数据追踪能力
 * 6. 资源清理：验证 dispose 正确清理
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

import { TreeRemoteEntityState } from '@/entity/state/TreeRemoteEntityState';
import type { IEntity, ITreeSearchParams } from '@/entity/types';
import type { TreeSchema } from '@/schema';

interface TreeNode extends IEntity {
    id: string;
    name: string;
    parentId: string | null;
    expanded?: boolean;
    leaf?: boolean;
    _path?: string;
    _depth?: number;
}

const mockTreeSchema: TreeSchema = {
    name: 'Department',
    domain: 'default',
    idField: 'id',
    isTree: true,
    isLazy: false,
    root: null,
    parentIdField: 'parentId',
    expandedField: 'expanded',
    leafField: 'leaf',
    useFlat: true,
    searchFields: ['name'],
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'parentId', type: 'string' },
    ],
};

/**
 * 初始化树索引结构
 *
 * TreePathAbility.ingest() 依赖 host.nodes 和 host.hierarchy，
 * 但 TreeRemoteEntityState 本身没有声明这两个属性。
 * 在 Manager 上下文中，这些由 Manager 初始化时设置；
 * 在 standalone 测试中，需要手动初始化。
 */
function initTreeIndiceses(state: any): void {
    if (!state.nodes) {
        state.nodes = new Map<string | number, any>();
    }
    if (!state.hierarchy) {
        state.hierarchy = new Map<string | number, (string | number)[]>();
    }
}

describe('TreeRemoteEntityState', () => {
    let state: TreeRemoteEntityState<ITreeSearchParams>;

    beforeEach(() => {
        state = new TreeRemoteEntityState(mockTreeSchema, 300000);
        initTreeIndiceses(state);
    });

    afterEach(() => {
        state.dispose();
    });

    describe('初始化', () => {
        it('应该正确初始化树形远程状态默认值', () => {
            expect(state.isRemote).toBe(true);
            expect(state.total).toBe(0);
            expect(state.expandedIds).toBeInstanceOf(Set);
            expect(state.expandedIds.size).toBe(0);
        });

        it('应该正确初始化基类状态', () => {
            expect(state.item).toBeNull();
            expect(state.schema).toBe(mockTreeSchema);
            expect(state.cacheTTL).toBe(300000);
            expect(state.loading).toBe(false);
            expect(state.items).toEqual([]);
        });

        it('应该正确初始化 StateSchemaAbility 提供的树属性', () => {
            expect(state.isTree).toBe(true);
            expect(state.isLazy).toBe(false);
            expect(state.root).toBe(null);
            expect(state.parentIdField).toBe('parentId');
            expect(state.expandedField).toBe('expanded');
            expect(state.leafField).toBe('leaf');
            expect(state.useFlat).toBe(true);
        });
    });

    describe('refreshView（TreeViewAbility 覆盖实现）', () => {
        it('空数据时 refreshView 应该产生空数组', () => {
            state.refreshView();
            expect(state.items).toEqual([]);
        });

        it('有数据时 refreshView 应该根据展开状态重建 items', () => {
            const nodes: TreeNode[] = [
                { id: '1', name: 'Root', parentId: null, expanded: true },
                { id: '2', name: 'Child', parentId: '1' },
            ];
            state.ingest(nodes);
            state.refreshView();

            // expanded=true 的根节点，其子节点应该出现在 items 中
            expect(state.items.length).toBeGreaterThan(0);
        });

        it('折叠节点时 refreshView 不应包含其子节点', () => {
            const nodes: TreeNode[] = [
                { id: '1', name: 'Root', parentId: null, expanded: false },
                { id: '2', name: 'Child', parentId: '1' },
            ];
            state.ingest(nodes);
            state.refreshView();

            // expanded=false 的根节点，子节点不应出现
            expect(state.items).toHaveLength(1);
            expect(state.items[0].id).toBe('1');
        });
    });

    describe('ingest（数据摄入与路径构建）', () => {
        it('应该摄入单个根节点并构建路径', () => {
            const root: TreeNode = { id: '1', name: 'Root', parentId: null };
            state.ingest(root);

            const node = (state as any).nodes.get('1');
            expect(node).toBeDefined();
            expect(node._path).toBe('1');
            expect(node._depth).toBe(0);
        });

        it('应该摄入多个节点并正确构建父子关系', () => {
            const nodes: TreeNode[] = [
                { id: '1', name: 'Root', parentId: null },
                { id: '2', name: 'Child 1', parentId: '1' },
                { id: '3', name: 'Child 2', parentId: '1' },
            ];
            state.ingest(nodes);

            const root = (state as any).nodes.get('1');
            const child1 = (state as any).nodes.get('2');
            const child2 = (state as any).nodes.get('3');

            expect(root._path).toBe('1');
            expect(root._depth).toBe(0);
            expect(child1._path).toBe('1.2');
            expect(child1._depth).toBe(1);
            expect(child2._path).toBe('1.3');
            expect(child2._depth).toBe(1);

            // 验证 hierarchy 索引
            const children = (state as any).hierarchy.get('1');
            expect(children).toEqual(['2', '3']);
        });

        it('应该支持多层嵌套的路径构建', () => {
            const nodes: TreeNode[] = [
                { id: '1', name: 'Root', parentId: null },
                { id: '2', name: 'Level 1', parentId: '1' },
                { id: '3', name: 'Level 2', parentId: '2' },
            ];
            state.ingest(nodes);

            const level2 = (state as any).nodes.get('3');
            expect(level2._path).toBe('1.2.3');
            expect(level2._depth).toBe(2);
        });

        it('应该支持手动指定 parentId', () => {
            const node: TreeNode = { id: '2', name: 'Child', parentId: null };
            state.ingest(node, '1');

            // 即使 parentId 字段为 null，手动指定了 '1' 作为父节点
            expect(node.parentId).toBe('1');
            expect((state as any).hierarchy.get('1')).toEqual(['2']);
        });
    });

    describe('toggleExpand（展开/折叠）', () => {
        it('应该切换节点的展开状态', () => {
            const node: TreeNode = { id: '1', name: 'Root', parentId: null, expanded: false };
            state.ingest(node);

            state.toggleExpand('1');
            expect(node.expanded).toBe(true);

            state.toggleExpand('1');
            expect(node.expanded).toBe(false);
        });

        it('应该支持设置指定的展开状态', () => {
            const node: TreeNode = { id: '1', name: 'Root', parentId: null, expanded: false };
            state.ingest(node);

            state.toggleExpand('1', true);
            expect(node.expanded).toBe(true);

            state.toggleExpand('1', true);
            expect(node.expanded).toBe(true);
        });

        it('应该支持通过实体对象切换展开状态', () => {
            const node: TreeNode = { id: '1', name: 'Root', parentId: null, expanded: false };
            state.ingest(node);

            state.toggleExpand(node);
            expect(node.expanded).toBe(true);
        });
    });

    describe('toggleLeaf（叶子节点切换）', () => {
        it('应该设置节点的叶子状态', () => {
            const node: TreeNode = { id: '1', name: 'Root', parentId: null, leaf: false };
            state.ingest(node);

            state.toggleLeaf('1', true);
            expect(node.leaf).toBe(true);

            state.toggleLeaf('1', false);
            expect(node.leaf).toBe(false);
        });
    });

    describe('removeNode（节点移除）', () => {
        beforeEach(() => {
            const nodes: TreeNode[] = [
                { id: '1', name: 'Root', parentId: null },
                { id: '2', name: 'Child 1', parentId: '1' },
                { id: '3', name: 'Child 2', parentId: '1' },
                { id: '4', name: 'Grandchild', parentId: '2' },
            ];
            state.ingest(nodes);
        });

        it('应该移除指定节点', () => {
            state.removeNode('3');

            expect((state as any).nodes.has('3')).toBe(false);
            expect((state as any).hierarchy.get('1')).toEqual(['2']);
        });

        it('应该级联移除所有子孙节点', () => {
            state.removeNode('2');

            expect((state as any).nodes.has('2')).toBe(false);
            expect((state as any).nodes.has('4')).toBe(false);
            expect((state as any).hierarchy.get('1')).toEqual(['3']);
        });

        it('移除不存在的节点不应报错', () => {
            expect(() => state.removeNode('999')).not.toThrow();
        });
    });

    describe('moveNode（节点移动）', () => {
        beforeEach(() => {
            const nodes: TreeNode[] = [
                { id: '1', name: 'Root A', parentId: null },
                { id: '2', name: 'Child of A', parentId: '1' },
                { id: '3', name: 'Root B', parentId: null },
            ];
            state.ingest(nodes);
        });

        it('应该将节点从一个父节点移动到另一个父节点', () => {
            state.moveNode('2', '3');

            const node = (state as any).nodes.get('2');
            expect(node.parentId).toBe('3');

            // 旧父级不再包含该节点
            expect((state as any).hierarchy.get('1')).toEqual([]);
            // 新父级包含该节点
            expect((state as any).hierarchy.get('3')).toContain('2');
        });

        it('移动后路径应该正确更新', () => {
            state.moveNode('2', '3');

            const node = (state as any).nodes.get('2');
            expect(node._path).toBe('3.2');
        });

        it('移动到相同父节点不应产生变化', () => {
            const originalPath = (state as any).nodes.get('2')._path;
            state.moveNode('2', '1');

            const node = (state as any).nodes.get('2');
            expect(node._path).toBe(originalPath);
        });
    });

    describe('getChildren（获取子节点）', () => {
        beforeEach(() => {
            const nodes: TreeNode[] = [
                { id: '1', name: 'Root', parentId: null },
                { id: '2', name: 'Child 1', parentId: '1' },
                { id: '3', name: 'Child 2', parentId: '1' },
            ];
            state.ingest(nodes);
        });

        it('应该返回指定父节点的直接子节点', () => {
            const children = state.getChildren('1');
            expect(children).toHaveLength(2);
            expect(children.map((c: any) => c.id)).toEqual(['2', '3']);
        });

        it('应该返回空数组当父节点没有子节点', () => {
            const children = state.getChildren('2');
            expect(children).toEqual([]);
        });

        it('应该支持自定义过滤', () => {
            const children = state.getChildren('1', (node: any) => node.id === '2');
            expect(children).toHaveLength(1);
            expect(children[0].id).toBe('2');
        });
    });

    describe('isDirty/startEdit/rollbackAll', () => {
        it('初始状态 isDirty 应该返回 false', () => {
            expect(state.isDirty()).toBe(false);
        });

        it('调用 startEdit 后 isDirty 应该返回 true', () => {
            const node: TreeNode = { id: '1', name: 'Root', parentId: null };
            state.startEdit(node);

            expect(state.isDirty()).toBe(true);
        });

        it('rollbackAll 应该清除脏状态', () => {
            const node: TreeNode = { id: '1', name: 'Root', parentId: null };
            state.startEdit(node);
            expect(state.isDirty()).toBe(true);

            state.rollbackAll();
            expect(state.isDirty()).toBe(false);
        });

        it('isDirty 传入已修改的实体时应返回 true', () => {
            const node: TreeNode = { id: '1', name: 'Root', parentId: null };
            state.startEdit(node);

            node.name = 'Modified Root';
            expect(state.isDirty(node)).toBe(true);
        });
    });

    describe('资源清理', () => {
        it('应该正确清理资源', () => {
            const nodes: TreeNode[] = [
                { id: '1', name: 'Root', parentId: null },
                { id: '2', name: 'Child', parentId: '1' },
            ];
            state.ingest(nodes);
            state.startEdit({ id: '1', name: 'Root', parentId: null });

            state.dispose();

            expect(state.items).toEqual([]);
            expect(state.item).toBeNull();
            expect(state.loading).toBe(false);
        });

        it('dispose 后 isDirty 无参调用应返回 false', () => {
            state.startEdit({ id: '1', name: 'Root', parentId: null });
            expect(state.isDirty()).toBe(true);

            state.dispose();

            expect(state.isDirty()).toBe(false);
        });
    });
});
