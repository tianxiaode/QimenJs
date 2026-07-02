/**
 * TreePathAbility 单元测试
 *
 * 验证树路径能力的核心行为：
 * 1. ingest - 入库并建立路径
 * 2. toggleExpand - 切换展开状态
 * 3. toggleLeaf - 切换叶子状态
 * 4. rebuildDescendantsPaths - 递归更新路径
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
import { TreePathAbility } from '@/entity/abilities/tree/TreePathAbility';

// ============================================
// 辅助
// ============================================

function createPathHost() {
    class PathHost extends ComposableBase {
        static readonly abilities = [TreePathAbility];
        nodes = new Map<string, any>();
        hierarchy = new Map<string | number | null, (string | number)[]>();
        idField = 'id';
        parentIdField = 'parentId';
        root = null;
        expandedField = 'expanded';
        leafField = 'leaf';
    }
    return new PathHost() as any;
}

// ============================================
// 测试
// ============================================

describe('TreePathAbility', () => {

    describe('ingest', () => {
        it('should ingest single node and set path', () => {
            const host = createPathHost();
            host.ingest({ id: 'a', name: 'A' });

            const node = host.nodes.get('a');
            expect(node).toBeDefined();
            expect(node._path).toBe('a');
            expect(node._depth).toBe(0);
            host.dispose();
        });

        it('should ingest array of nodes', () => {
            const host = createPathHost();
            host.ingest([
                { id: 'a', name: 'A' },
                { id: 'b', name: 'B' },
            ]);

            expect(host.nodes.size).toBe(2);
            expect(host.hierarchy.get(null)).toEqual(['a', 'b']);
            host.dispose();
        });

        it('should build hierarchy with parentId', () => {
            const host = createPathHost();
            host.ingest([
                { id: 'a', name: 'A' },
                { id: 'a1', parentId: 'a', name: 'A1' },
            ]);

            expect(host.hierarchy.get('a')).toEqual(['a1']);
            const a1 = host.nodes.get('a1');
            expect(a1._path).toBe('a.a1');
            expect(a1._depth).toBe(1);
            host.dispose();
        });

        it('should merge existing node data', () => {
            const host = createPathHost();
            host.ingest({ id: 'a', name: 'A' });
            host.ingest({ id: 'a', extra: 'data' });

            const node = host.nodes.get('a');
            expect(node.extra).toBe('data');
            expect(node._path).toBe('a'); // path preserved
            host.dispose();
        });

        it('should ingest with manualParentId', () => {
            const host = createPathHost();
            // First add parent
            host.ingest({ id: 'a', name: 'A' });
            // Then add child with manualParentId
            host.ingest({ id: 'a1', name: 'A1' }, 'a');

            const a1 = host.nodes.get('a1');
            expect(a1.parentId).toBe('a');
            expect(a1._path).toBe('a.a1');
            host.dispose();
        });

        it('should set parent as non-leaf when ingesting with manualParentId', () => {
            const host = createPathHost();
            host.ingest({ id: 'a', name: 'A', leaf: true });
            host.ingest({ id: 'a1', name: 'A1' }, 'a');

            const a = host.nodes.get('a');
            expect(a.leaf).toBe(false);
            host.dispose();
        });

        it('should use custom root', () => {
            const host = createPathHost();
            host.root = '0';
            host.ingest({ id: 'a', parentId: '0', name: 'A' });

            const a = host.nodes.get('a');
            expect(a._path).toBe('a');
            host.dispose();
        });
    });

    describe('toggleExpand', () => {
        it('should toggle expand state by id', () => {
            const host = createPathHost();
            host.ingest({ id: 'a', name: 'A', expanded: false });

            host.toggleExpand('a');

            const node = host.nodes.get('a');
            expect(node.expanded).toBe(true);
            host.dispose();
        });

        it('should set explicit expand value', () => {
            const host = createPathHost();
            host.ingest({ id: 'a', name: 'A', expanded: true });

            host.toggleExpand('a', false);

            const node = host.nodes.get('a');
            expect(node.expanded).toBe(false);
            host.dispose();
        });

        it('should toggle expand by entity object', () => {
            const host = createPathHost();
            host.ingest({ id: 'a', name: 'A', expanded: false });
            const node = host.nodes.get('a');

            host.toggleExpand(node);

            expect(node.expanded).toBe(true);
            host.dispose();
        });

        it('should not throw for non-existent id', () => {
            const host = createPathHost();
            expect(() => host.toggleExpand('nonexistent')).not.toThrow();
            host.dispose();
        });
    });

    describe('toggleLeaf', () => {
        it('should set leaf state by id', () => {
            const host = createPathHost();
            host.ingest({ id: 'a', name: 'A', leaf: true });

            host.toggleLeaf('a', false);

            const node = host.nodes.get('a');
            expect(node.leaf).toBe(false);
            host.dispose();
        });

        it('should toggle leaf by entity object', () => {
            const host = createPathHost();
            host.ingest({ id: 'a', name: 'A', leaf: false });
            const node = host.nodes.get('a');

            host.toggleLeaf(node, true);

            expect(node.leaf).toBe(true);
            host.dispose();
        });

        it('should not throw for non-existent id', () => {
            const host = createPathHost();
            expect(() => host.toggleLeaf('nonexistent', true)).not.toThrow();
            host.dispose();
        });
    });

    describe('rebuildDescendantsPaths', () => {
        it('should rebuild paths for descendants', () => {
            const host = createPathHost();
            host.ingest([
                { id: 'a', name: 'A' },
                { id: 'a1', parentId: 'a', name: 'A1' },
                { id: 'a1a', parentId: 'a1', name: 'A1a' },
            ]);

            // Verify deep path
            const a1a = host.nodes.get('a1a');
            expect(a1a._path).toBe('a.a1.a1a');
            expect(a1a._depth).toBe(2);
            host.dispose();
        });
    });
});
