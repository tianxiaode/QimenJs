/**
 * TreeLifecycleAbility 独立单元测试
 *
 * 验证树生命周期能力的核心行为：
 * 1. removeNode 级联删除
 * 2. moveNode 跨父节点移动 + 路径更新
 * 3. syncChildren 差集同步
 * 4. getChildren 获取子节点
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
import { TreeLifecycleAbility } from '@/entity/abilities/tree/TreeLifecycleAbility';

// ============================================
// 辅助
// ============================================

function createTreeHost() {
    class TreeHost extends ComposableBase {
        static readonly abilities = [TreeLifecycleAbility];
        nodes = new Map<string | number, any>();
        hierarchy = new Map<string | number | null, (string | number)[]>();
        idField = 'id';
        parentIdField = 'parentId';
        expandedField = 'expanded';
        leafField = 'leaf';
        toggleExpand = jest.fn();
        toggleLeaf = jest.fn();
    }
    return new TreeHost() as any;
}

/** 构建一棵测试树：
 *     root
 *     ├── a (depth=0, path=a)
 *     │   ├── a1 (depth=1, path=a.a1)
 *     │   └── a2 (depth=1, path=a.a2)
 *     └── b (depth=0, path=b)
 */
function buildTestTree(host: any) {
    const nodes = [
        { id: 'a', parentId: null, _path: 'a', _depth: 0, expanded: true, leaf: false },
        { id: 'a1', parentId: 'a', _path: 'a.a1', _depth: 1, expanded: false, leaf: true },
        { id: 'a2', parentId: 'a', _path: 'a.a2', _depth: 1, expanded: false, leaf: true },
        { id: 'b', parentId: null, _path: 'b', _depth: 0, expanded: false, leaf: true },
    ];
    nodes.forEach(n => host.nodes.set(n.id, n));
    host.hierarchy.set(null, ['a', 'b']);
    host.hierarchy.set('a', ['a1', 'a2']);
}

// ============================================
// 测试
// ============================================

describe('TreeLifecycleAbility', () => {
    describe('removeNode', () => {
        it('应移除节点及其子孙', () => {
            const host = createTreeHost();
            buildTestTree(host);

            host.removeNode('a');

            expect(host.nodes.has('a')).toBe(false);
            expect(host.nodes.has('a1')).toBe(false);
            expect(host.nodes.has('a2')).toBe(false);
            expect(host.nodes.has('b')).toBe(true);
            expect(host.hierarchy.get(null)).toEqual(['b']);
            host.dispose();
        });

        it('应移除叶子节点', () => {
            const host = createTreeHost();
            buildTestTree(host);

            host.removeNode('a1');

            expect(host.nodes.has('a1')).toBe(false);
            expect(host.nodes.has('a')).toBe(true);
            expect(host.hierarchy.get('a')).toEqual(['a2']);
            host.dispose();
        });

        it('不存在的节点不应报错', () => {
            const host = createTreeHost();
            buildTestTree(host);

            expect(() => host.removeNode('nonexistent')).not.toThrow();
            expect(host.nodes.size).toBe(4);
            host.dispose();
        });
    });

    describe('moveNode', () => {
        it('应移动节点到新父级', () => {
            const host = createTreeHost();
            buildTestTree(host);

            host.moveNode('a1', 'b');

            // a1 从 a 的子节点移到 b 的子节点
            expect(host.hierarchy.get('a')).toEqual(['a2']);
            expect(host.hierarchy.get('b')).toContain('a1');
            // a1 的 parentId 和路径应更新
            const a1 = host.nodes.get('a1');
            expect(a1.parentId).toBe('b');
            expect(a1._path).toBe('b.a1');
            host.dispose();
        });

        it('相同父级不应移动', () => {
            const host = createTreeHost();
            buildTestTree(host);

            host.moveNode('a1', 'a');

            const a1 = host.nodes.get('a1');
            expect(a1._path).toBe('a.a1'); // 路径不变
            host.dispose();
        });

        it('应自动展开目标父节点并取消叶子标记', () => {
            const host = createTreeHost();
            buildTestTree(host);

            host.moveNode('a1', 'b');

            expect(host.toggleExpand).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'b' }),
                true
            );
            expect(host.toggleLeaf).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'b' }),
                false
            );
            host.dispose();
        });
    });

    describe('syncChildren', () => {
        it('应删除不再存在的子节点', () => {
            const host = createTreeHost();
            buildTestTree(host);

            // 只保留 a1，a2 应被删除
            host.syncChildren('a', [{ id: 'a1', parentId: 'a' }]);

            expect(host.nodes.has('a1')).toBe(true);
            expect(host.nodes.has('a2')).toBe(false);
            host.dispose();
        });

        it('无差集时不应删除任何节点', () => {
            const host = createTreeHost();
            buildTestTree(host);

            host.syncChildren('a', [{ id: 'a1' }, { id: 'a2' }]);

            expect(host.nodes.has('a1')).toBe(true);
            expect(host.nodes.has('a2')).toBe(true);
            host.dispose();
        });
    });

    describe('getChildren', () => {
        it('应返回指定父节点的直接子节点', () => {
            const host = createTreeHost();
            buildTestTree(host);

            const children = host.getChildren('a');
            expect(children.length).toBe(2);
            expect(children.map((c: any) => c.id)).toEqual(['a1', 'a2']);
            host.dispose();
        });

        it('无子节点应返回空数组', () => {
            const host = createTreeHost();
            buildTestTree(host);

            const children = host.getChildren('b');
            expect(children).toEqual([]);
            host.dispose();
        });

        it('应支持自定义过滤', () => {
            const host = createTreeHost();
            buildTestTree(host);

            const children = host.getChildren('a', (node: any) => node.id === 'a1');
            expect(children.length).toBe(1);
            expect(children[0].id).toBe('a1');
            host.dispose();
        });
    });
});
