/**
 * StateSearchAbility 独立单元测试
 *
 * 验证搜索能力的核心行为：
 * 1. toParams 参数转换（扁平/树形）
 * 2. filter 关键词设置
 * 3. searchBy 合并搜索条件
 * 4. matchKeyword 关键词匹配
 * 5. applySort 排序
 * 6. sort 设置排序条件
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
import { StateSearchAbility } from '@/entity/abilities/state/search/StateSearchAbility';

// ============================================
// 辅助
// ============================================

function createSearchHost(isTree = false) {
    class SearchHost extends ComposableBase {
        static readonly abilities = [StateSearchAbility];
        schema = {
            isTree,
            searchFields: ['name', 'email'],
        };
        search: any = { keyword: '', sortBy: '', sortOrder: 'asc' };
        page = 1;
        pageSize = 20;
        root = null;
    }
    return new SearchHost() as any;
}

// ============================================
// 测试
// ============================================

describe('StateSearchAbility', () => {
    beforeEach(() => {
        ComposableRegistrar.getInstance().clearCaches();
    });

    describe('toParams', () => {
        it('扁平模式应包含 page 和 pageSize', () => {
            const host = createSearchHost(false);
            host.search = { keyword: 'test', status: 'active' };
            const params = host.toParams();
            expect(params.keyword).toBe('test');
            expect(params.status).toBe('active');
            expect(params.page).toBe(1);
            expect(params.pageSize).toBe(20);
            host.dispose();
        });

        it('树形模式应包含 parentId', () => {
            const host = createSearchHost(true);
            host.search = { keyword: 'test' };
            const params = host.toParams();
            expect(params.keyword).toBe('test');
            expect(params.parentId).toBeNull();
            host.dispose();
        });

        it('应跳过 undefined/null/空字符串值', () => {
            const host = createSearchHost(false);
            host.search = { keyword: '', status: null, type: undefined, valid: 'yes' };
            const params = host.toParams();
            expect(params.keyword).toBeUndefined();
            expect(params.status).toBeUndefined();
            expect(params.type).toBeUndefined();
            expect(params.valid).toBe('yes');
            host.dispose();
        });

        it('数组值应用逗号连接', () => {
            const host = createSearchHost(false);
            host.search = { tags: ['a', 'b', 'c'] };
            const params = host.toParams();
            expect(params.tags).toBe('a,b,c');
            host.dispose();
        });

        it('树形模式自定义 parentId 应优先', () => {
            const host = createSearchHost(true);
            host.search = { keyword: 'test', parentId: 'p1' };
            const params = host.toParams();
            expect(params.parentId).toBe('p1');
            host.dispose();
        });
    });

    describe('filter', () => {
        it('应设置 search.keyword', () => {
            const host = createSearchHost(false);
            host.filter('hello');
            expect(host.search.keyword).toBe('hello');
            host.dispose();
        });
    });

    describe('searchBy', () => {
        it('应合并搜索条件', () => {
            const host = createSearchHost(false);
            host.search = { keyword: 'old', status: 'active' };
            host.searchBy({ keyword: 'new', page: 2 });
            expect(host.search.keyword).toBe('new');
            expect(host.search.status).toBe('active');
            expect(host.search.page).toBe(2);
            host.dispose();
        });
    });

    describe('matchKeyword', () => {
        it('无关键词应返回 true', () => {
            const host = createSearchHost(false);
            host.search.keyword = '';
            expect(host.matchKeyword({ name: 'test' })).toBe(true);
            host.dispose();
        });

        it('匹配搜索字段应返回 true', () => {
            const host = createSearchHost(false);
            host.search.keyword = 'John';
            expect(host.matchKeyword({ name: 'John Doe', email: 'john@test.com' })).toBe(true);
            host.dispose();
        });

        it('不匹配应返回 false', () => {
            const host = createSearchHost(false);
            host.search.keyword = 'xyz';
            expect(host.matchKeyword({ name: 'John Doe', email: 'john@test.com' })).toBe(false);
            host.dispose();
        });

        it('应大小写不敏感', () => {
            const host = createSearchHost(false);
            host.search.keyword = 'john';
            expect(host.matchKeyword({ name: 'JOHN DOE' })).toBe(true);
            host.dispose();
        });
    });

    describe('applySort', () => {
        it('无排序条件应返回原列表', () => {
            const host = createSearchHost(false);
            host.search.sortBy = '';
            const list = [{ name: 'b' }, { name: 'a' }];
            expect(host.applySort(list)).toBe(list);
            host.dispose();
        });

        it('单元素列表应直接返回', () => {
            const host = createSearchHost(false);
            host.search.sortBy = 'name';
            const list = [{ name: 'a' }];
            expect(host.applySort(list)).toBe(list);
            host.dispose();
        });

        it('应按指定字段排序', () => {
            const host = createSearchHost(false);
            host.search.sortBy = 'name';
            host.search.sortOrder = 'asc';
            const list = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
            const sorted = host.applySort(list);
            expect(sorted.map((i: any) => i.name)).toEqual(['a', 'b', 'c']);
            host.dispose();
        });
    });

    describe('sort', () => {
        it('应设置排序字段和方向', () => {
            const host = createSearchHost(false);
            host.sort('name', 'desc');
            expect(host.search.sortBy).toBe('name');
            expect(host.search.sortOrder).toBe('desc');
            host.dispose();
        });

        it('默认方向应为 asc', () => {
            const host = createSearchHost(false);
            host.sort('name');
            expect(host.search.sortOrder).toBe('asc');
            host.dispose();
        });
    });
});
