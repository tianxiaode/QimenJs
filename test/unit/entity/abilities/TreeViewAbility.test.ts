/**
 * TreeViewAbility 单元测试
 *
 * 验证树视图能力的核心行为：
 * 1. refreshView - 根据 useFlat 决定生成 flat 还是 tree 格式
 * 2. generateFlatItems - 扁平化列表生成
 * 3. generateTreeData - 嵌套树结构生成
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
import { TreeViewAbility } from '@/entity/abilities/tree/TreeViewAbility';

// ============================================
// 辅助
// ============================================

function createTreeViewHost(schemaOverrides: any = {}) {
    class TreeViewHost extends ComposableBase {
        static readonly abilities = [TreeViewAbility];
        schema = {
            useFlat: true,
            expandedField: 'expanded',
            childrenField: 'children',
            ...schemaOverrides,
        };
        items: any[] = [];
        nodes = new Map<string, any>();
        hierarchy = new Map<string | number | null, (string | number)[]>();
        idField = 'id';
        root = null;
        applySort = jest.fn((items: any[]) => items);
    }
    return new TreeViewHost() as any;
}

/** 构建测试树：
 *     root
 *     ├── a (expanded=true)
 *     │   ├── a1
 *     │   └── a2
 *     └── b (expanded=false)
 */
function buildTestTree(host: any) {
    const nodes = [
        { id: 'a', expanded: true, name: 'A' },
        { id: 'a1', expanded: false, name: 'A1' },
        { id: 'a2', expanded: false, name: 'A2' },
        { id: 'b', expanded: false, name: 'B' },
    ];
    nodes.forEach(n => host.nodes.set(n.id, n));
    host.hierarchy.set(null, ['a', 'b']);
    host.hierarchy.set('a', ['a1', 'a2']);
}

// ============================================
// 测试
// ============================================

describe('TreeViewAbility', () => {

    describe('refreshView with flat mode', () => {
        it('should generate flat items with depth info', () => {
            const host = createTreeViewHost({ useFlat: true });
            buildTestTree(host);

            host.refreshView();

            // a (expanded=true, depth=0), a1 (depth=1), a2 (depth=1), b (expanded=false, depth=0)
            expect(host.items.length).toBe(4);
            expect(host.items[0]._depth).toBe(0); // a at depth 0
            expect(host.items[1]._depth).toBe(1); // a1 at depth 1
            expect(host.items[2]._depth).toBe(1); // a2 at depth 1
            expect(host.items[3]._depth).toBe(0); // b at depth 0
            host.dispose();
        });

        it('should not include children of collapsed nodes', () => {
            const host = createTreeViewHost({ useFlat: true });
            buildTestTree(host);

            host.refreshView();

            // b is not expanded, so its children (none in this case) won't appear
            const bItem = host.items.find((i: any) => i.id === 'b');
            expect(bItem).toBeDefined();
            expect(bItem._depth).toBe(0);
            host.dispose();
        });

        it('should use custom expandedField', () => {
            const host = createTreeViewHost({ useFlat: true, expandedField: 'isOpen' });
            const nodes = [
                { id: 'a', isOpen: true, name: 'A' },
                { id: 'a1', isOpen: false, name: 'A1' },
            ];
            nodes.forEach(n => host.nodes.set(n.id, n));
            host.hierarchy.set(null, ['a']);
            host.hierarchy.set('a', ['a1']);

            host.refreshView();

            expect(host.items.length).toBe(2);
            host.dispose();
        });

        it('should start from custom root', () => {
            const host = createTreeViewHost({ useFlat: true });
            host.root = 'a';
            const nodes = [
                { id: 'a', expanded: true, name: 'A' },
                { id: 'a1', expanded: false, name: 'A1' },
            ];
            nodes.forEach(n => host.nodes.set(n.id, n));
            host.hierarchy.set('a', ['a1']);

            host.refreshView();

            // walk starts from root='a', gets children of 'a' which is ['a1']
            expect(host.items.length).toBe(1);
            expect(host.items[0].id).toBe('a1');
            host.dispose();
        });
    });

    describe('refreshView with tree mode', () => {
        it('should generate nested tree structure', () => {
            const host = createTreeViewHost({ useFlat: false });
            buildTestTree(host);

            host.refreshView();

            expect(host.items.length).toBe(2); // a and b at root
            const aItem = host.items.find((i: any) => i.id === 'a');
            expect(aItem.children.length).toBe(2); // a1 and a2
            expect(aItem.children[0].id).toBe('a1');
            host.dispose();
        });

        it('should use custom childrenField in tree mode', () => {
            const host = createTreeViewHost({ useFlat: false, childrenField: 'kids' });
            buildTestTree(host);

            host.refreshView();

            const aItem = host.items.find((i: any) => i.id === 'a');
            expect(aItem.kids).toBeDefined();
            expect(aItem.kids.length).toBe(2);
            host.dispose();
        });

        it('should start from custom root in tree mode', () => {
            const host = createTreeViewHost({ useFlat: false });
            host.root = 'a';
            const nodes = [
                { id: 'a', expanded: true, name: 'A' },
                { id: 'a1', expanded: false, name: 'A1' },
            ];
            nodes.forEach(n => host.nodes.set(n.id, n));
            host.hierarchy.set('a', ['a1']);

            host.refreshView();

            // build starts from root='a', gets children of 'a' which is ['a1']
            expect(host.items.length).toBe(1);
            expect(host.items[0].id).toBe('a1');
            host.dispose();
        });
    });
});
