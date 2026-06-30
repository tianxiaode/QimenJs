/**
 * TreeSearchAbility 独立单元测试
 *
 * 验证树搜索能力的核心行为：
 * 1. matchKeyword 关键词匹配
 * 2. applySort 排序
 * 3. applySearchExpansion 搜索时自动展开祖先
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
import { ComposableRegistrar } from '@/composable/ComposableRegistrar';
import { TreeSearchAbility } from '@/entity/abilities/state/tree/TreeSearchAbility';

// ============================================
// 辅助
// ============================================

function createTreeSearchHost() {
    class TreeSearchHost extends ComposableBase {
        static readonly abilities = [TreeSearchAbility];
        nodes = new Map<string, any>();
        search: any = { keyword: '', sortBy: '', order: 'asc' };
        searchFields = ['name'];
        expandedField = 'expanded';
        parentIdField = 'parentId';
        root = null;
    }
    return new TreeSearchHost() as any;
}

// ============================================
// 测试
// ============================================

describe('TreeSearchAbility', () => {
    beforeEach(() => {
        ComposableRegistrar.getInstance().clearCaches();
    });

    describe('matchKeyword', () => {
        it('匹配搜索字段应返回 true', () => {
            const host = createTreeSearchHost();
            expect(host.matchKeyword({ name: 'John Doe' }, 'john')).toBe(true);
            host.dispose();
        });

        it('不匹配应返回 false', () => {
            const host = createTreeSearchHost();
            expect(host.matchKeyword({ name: 'Jane' }, 'john')).toBe(false);
            host.dispose();
        });

        it('空关键词应返回 false', () => {
            const host = createTreeSearchHost();
            expect(host.matchKeyword({ name: 'John' }, '')).toBe(false);
            host.dispose();
        });
    });

    describe('applySort', () => {
        it('无排序条件应返回原列表', () => {
            const host = createTreeSearchHost();
            host.search.sortBy = '';
            const list = [{ name: 'b' }, { name: 'a' }];
            expect(host.applySort(list)).toBe(list);
            host.dispose();
        });

        it('单元素列表应直接返回', () => {
            const host = createTreeSearchHost();
            host.search.sortBy = 'name';
            const list = [{ name: 'a' }];
            expect(host.applySort(list)).toBe(list);
            host.dispose();
        });

        it('应按指定字段排序', () => {
            const host = createTreeSearchHost();
            host.search.sortBy = 'name';
            host.search.order = 'asc';
            const list = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
            const sorted = host.applySort(list);
            expect(sorted.map((i: any) => i.name)).toEqual(['a', 'b', 'c']);
            host.dispose();
        });
    });

    describe('applySearchExpansion', () => {
        it('应展开命中节点的所有祖先', () => {
            const host = createTreeSearchHost();
            host.search.keyword = 'child';

            // 构建树：root -> parent -> child
            const rootNode = { id: 'root', name: 'Root', parentId: null, _depth: 0, expanded: false };
            const parentNode = { id: 'parent', name: 'Parent', parentId: 'root', _depth: 1, expanded: false };
            const childNode = { id: 'child', name: 'Child Match', parentId: 'parent', _depth: 2, expanded: false };
            host.nodes.set('root', rootNode);
            host.nodes.set('parent', parentNode);
            host.nodes.set('child', childNode);

            host.applySearchExpansion();

            // child 命中关键词，自身和祖先 parent 都应展开
            expect(childNode.expanded).toBe(true);
            expect(parentNode.expanded).toBe(true);
            host.dispose();
        });

        it('无命中节点不应展开任何节点', () => {
            const host = createTreeSearchHost();
            host.search.keyword = 'nonexistent';

            const node = { id: 'a', name: 'Alpha', parentId: null, _depth: 0, expanded: false };
            host.nodes.set('a', node);

            host.applySearchExpansion();

            expect(node.expanded).toBe(false);
            host.dispose();
        });
    });
});
