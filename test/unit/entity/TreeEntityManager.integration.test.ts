/**
 * RemoteTreeEntityManager 集成测试
 *
 * 验证树形结构完整生命周期：
 * 1. Manager 基本属性（isRemote/items/expandedIds/nodes/hierarchy）
 * 2. TreePathAbility: ingest + refreshView（路径/深度计算）
 * 3. TreePathAbility: toggleExpand（展开/折叠切换）
 * 4. TreeLifecycleAbility: removeNode（节点及子孙删除）
 * 5. TreeLifecycleAbility: moveNode（节点移动/路径重建）
 * 6. TreeManagerAbility: expand/collapse（防抖展开/折叠）
 * 7. TreeManagerAbility: refresh（防抖刷新子节点）
 * 8. TreeViewAbility: flat vs tree（扁平/嵌套视图切换）
 * 9. TreeSearchAbility: applySort（排序）
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

import { RemoteTreeEntityManager } from '@/entity/manager/managers';
import { TreeManagerAbility } from '@/entity/abilities/remote/TreeManagerAbility';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { SchemaRegistrar } from '@/schema';
import type { TreeSchema, RegistrSchema } from '@/schema';

// ============================================
// 测试用 Schema（TestDepartment 树形实体）
// ============================================

const treeTestSchema: TreeSchema = {
    name: 'TestDepartment',
    domain: 'tree-test',
    idField: 'id',
    isTree: true,
    isLazy: false,
    root: null,
    parentIdField: 'parentId',
    childrenField: 'children',
    leafField: 'leaf',
    expandedField: 'expanded',
    useFlat: true,
    searchFields: ['name'],
    fields: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string', searchable: true },
        { name: 'parentId', type: 'number' },
    ],
};

// ============================================
// 测试用 TreeEntityManager
// ============================================

class TestTreeManager extends RemoteTreeEntityManager {
    // 添加 TreeManagerAbility 以支持 expand/collapse/refresh
    static readonly abilities = [
        ...RemoteTreeEntityManager.abilities,
        TreeManagerAbility,
    ];

    domain = 'tree-test';
    entityName = 'TestDepartment';
    url = '/api/departments';
    schema: RegistrSchema = treeTestSchema;

    // TreePathAbility 和 TreeLifecycleAbility 依赖 nodes/hierarchy
    // 这些在宿主构造时通过 abilityState 初始化
    nodes: Map<string | number, any> = new Map();
    hierarchy: Map<string | number | null, (string | number)[]> = new Map();

    // TreeManagerAbility 依赖 isLoaded/setLoaded
    // 用于跟踪节点是否已从远程加载
    private _loadedNodes = new Set<string | number>();

    isLoaded(id: string | number): boolean {
        return this._loadedNodes.has(id);
    }

    setLoaded(id: string | number, loaded: boolean): void {
        if (loaded) {
            this._loadedNodes.add(id);
        } else {
            this._loadedNodes.delete(id);
        }
    }
}

// ============================================
// 辅助函数
// ============================================

function ensureTreeTestDomain(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (domainRegistrar && !domainRegistrar.get('tree-test')) {
        domainRegistrar.register('tree-test', {
            baseUrl: 'http://localhost:9999',
            preset: 'default',
            pageSize: 10,
            pagesizes: [5, 10, 20, 50],
        });
    }
}

function mockFetchList(data: any[]): void {
    jest.spyOn(TestTreeManager.prototype, 'fetch').mockImplementation(async () => ({
        data: { list: data, total: data.length },
        metadata: { hasError: false },
    } as any));
}

// ============================================
// 测试数据
// ============================================

// 每次返回深拷贝，防止 ability 方法就地修改影响后续测试
function createTreeData() {
    return [
        { id: 1, name: '总公司', parentId: null, expanded: true, leaf: false },
        { id: 2, name: '研发部', parentId: 1, expanded: false, leaf: false },
        { id: 3, name: '市场部', parentId: 1, expanded: false, leaf: true },
        { id: 4, name: '前端组', parentId: 2, expanded: false, leaf: true },
        { id: 5, name: '后端组', parentId: 2, expanded: false, leaf: true },
    ];
}

// ============================================
// 测试
// ============================================

describe('RemoteTreeEntityManager 集成测试', () => {
    let manager: TestTreeManager;

    beforeAll(() => {
        ensureTreeTestDomain();
        const schemaRegistrar = SchemaRegistrar.getInstance();
        if (!schemaRegistrar.has('TestDepartment')) {
            schemaRegistrar.register(treeTestSchema);
        }
    });

    beforeEach(() => {
        manager = new TestTreeManager();
    });

    afterEach(() => {
        manager.dispose();
        jest.restoreAllMocks();
    });

    // ========================================
    // 1. Manager 基本属性
    // ========================================

    describe('Manager 基本属性', () => {
        it('isRemote 应该为 true', () => {
            expect(manager.isRemote).toBe(true);
        });

        it('items 应该是数组', () => {
            expect(Array.isArray(manager.items)).toBe(true);
            expect(manager.items.length).toBe(0);
        });

        it('expandedIds 应该是 Set', () => {
            expect(manager.expandedIds).toBeInstanceOf(Set);
        });

        it('nodes 应该是 Map', () => {
            expect(manager.nodes).toBeInstanceOf(Map);
        });

        it('hierarchy 应该是 Map', () => {
            expect(manager.hierarchy).toBeInstanceOf(Map);
        });

        it('SchemaProxyAbility getters 应该正确返回树形字段', () => {
            expect(manager.idField).toBe('id');
            expect(manager.parentIdField).toBe('parentId');
            expect(manager.childrenField).toBe('children');
            expect(manager.leafField).toBe('leaf');
            expect(manager.expandedField).toBe('expanded');
            expect(manager.root).toBeNull();
        });
    });

    // ========================================
    // 2. TreePathAbility: ingest + refreshView
    // ========================================

    describe('TreePathAbility: ingest + refreshView', () => {
        it('ingest 应该填充 nodes 和 hierarchy', () => {
            manager.ingest(createTreeData());

            expect(manager.nodes.size).toBe(5);
            expect(manager.hierarchy.size).toBeGreaterThan(0);
        });

        it('ingest 后 hierarchy 应该正确建立父子关系', () => {
            manager.ingest(createTreeData());

            // root (null) 下有 1 个子节点：总公司
            const rootChildren = manager.hierarchy.get(null) || [];
            expect(rootChildren).toContain(1);

            // 总公司(id:1) 下有 2 个子节点：研发部、市场部
            const companyChildren = manager.hierarchy.get(1) || [];
            expect(companyChildren).toEqual(expect.arrayContaining([2, 3]));

            // 研发部(id:2) 下有 2 个子节点：前端组、后端组
            const devChildren = manager.hierarchy.get(2) || [];
            expect(devChildren).toEqual(expect.arrayContaining([4, 5]));
        });

        it('ingest 应该为节点计算 _path 和 _depth', () => {
            manager.ingest(createTreeData());

            const root = manager.nodes.get(1);
            expect(root._path).toBe('1');
            expect(root._depth).toBe(0);

            const dev = manager.nodes.get(2);
            expect(dev._path).toBe('1.2');
            expect(dev._depth).toBe(1);

            const frontend = manager.nodes.get(4);
            expect(frontend._path).toBe('1.2.4');
            expect(frontend._depth).toBe(2);
        });

        it('ingest 后 _generateFlatItems 应该生成扁平列表（含 _depth）', () => {
            manager.ingest(createTreeData());

            // TreeRemoteStateAbility.refreshView 会覆盖 TreeViewAbility.refreshView
            // 直接调用 _generateFlatItems 验证 TreeViewAbility 的逻辑
            const flatItems = manager._generateFlatItems();

            // 总公司展开，研发部未展开
            // 扁平列表应包含：总公司(0), 研发部(1), 市场部(1)
            expect(flatItems.length).toBe(3);

            const rootItem = flatItems.find((i: any) => i.id === 1);
            expect(rootItem!._depth).toBe(0);

            const devItem = flatItems.find((i: any) => i.id === 2);
            expect(devItem!._depth).toBe(1);
        });

        it('ingest 单个节点应该正确添加到树中', () => {
            manager.ingest(createTreeData());

            // 添加新节点到市场部下
            manager.ingest({ id: 6, name: '市场一组', parentId: 3, leaf: true });

            expect(manager.nodes.size).toBe(6);
            const marketChildren = manager.hierarchy.get(3) || [];
            expect(marketChildren).toContain(6);
        });

        it('ingest 带 manualParentId 应该正确挂载节点', () => {
            // 先 ingest 根节点
            manager.ingest({ id: 1, name: '总公司', parentId: null, expanded: true, leaf: false });

            // 再用 manualParentId 挂载子节点
            manager.ingest([{ id: 2, name: '研发部', leaf: false }, { id: 3, name: '市场部', leaf: true }], 1);

            expect(manager.nodes.get(2).parentId).toBe(1);
            expect(manager.nodes.get(3).parentId).toBe(1);

            const children = manager.hierarchy.get(1) || [];
            expect(children).toEqual(expect.arrayContaining([2, 3]));
        });
    });

    // ========================================
    // 3. TreePathAbility: toggleExpand
    // ========================================

    describe('TreePathAbility: toggleExpand', () => {
        beforeEach(() => {
            manager.ingest(createTreeData());
        });

        it('toggleExpand(id) 应该切换展开状态', () => {
            // 研发部初始未展开
            const dev = manager.nodes.get(2);
            expect(dev.expanded).toBe(false);

            manager.toggleExpand(2);
            expect(dev.expanded).toBe(true);

            manager.toggleExpand(2);
            expect(dev.expanded).toBe(false);
        });

        it('toggleExpand(id, true) 应该强制展开', () => {
            manager.toggleExpand(2, true);
            expect(manager.nodes.get(2).expanded).toBe(true);

            // 再次调用仍然是展开
            manager.toggleExpand(2, true);
            expect(manager.nodes.get(2).expanded).toBe(true);
        });

        it('toggleExpand(id, false) 应该强制折叠', () => {
            // 先展开
            manager.toggleExpand(2, true);
            expect(manager.nodes.get(2).expanded).toBe(true);

            // 强制折叠
            manager.toggleExpand(2, false);
            expect(manager.nodes.get(2).expanded).toBe(false);
        });

        it('展开节点后 _generateFlatItems 应该显示更多层级', () => {
            // 初始：总公司展开，研发部未展开
            let flatItems = manager._generateFlatItems();
            expect(flatItems.length).toBe(3); // 总公司, 研发部, 市场部

            // 展开研发部
            manager.toggleExpand(2, true);
            flatItems = manager._generateFlatItems();
            expect(flatItems.length).toBe(5); // 总公司, 研发部, 前端组, 后端组, 市场部
        });
    });

    // ========================================
    // 4. TreeLifecycleAbility: removeNode
    // ========================================

    describe('TreeLifecycleAbility: removeNode', () => {
        beforeEach(() => {
            manager.ingest(createTreeData());
        });

        it('removeNode 应该从 nodes 中移除指定节点', () => {
            manager.removeNode(3);

            expect(manager.nodes.has(3)).toBe(false);
        });

        it('removeNode 应该从父级 hierarchy 中移除引用', () => {
            manager.removeNode(3);

            const companyChildren = manager.hierarchy.get(1) || [];
            expect(companyChildren).not.toContain(3);
        });

        it('removeNode 应该级联删除所有子孙节点', () => {
            // 删除研发部(id:2)，应该同时删除前端组(4)和后端组(5)
            manager.removeNode(2);

            expect(manager.nodes.has(2)).toBe(false);
            expect(manager.nodes.has(4)).toBe(false);
            expect(manager.nodes.has(5)).toBe(false);
        });

        it('removeNode 后 _generateFlatItems 应该反映删除结果', () => {
            manager.removeNode(2);

            const flatItems = manager._generateFlatItems();
            // 总公司(展开) + 市场部
            expect(flatItems.length).toBe(2);
            const ids = flatItems.map((i: any) => i.id);
            expect(ids).toEqual(expect.arrayContaining([1, 3]));
        });

        it('removeNode 不存在的 id 应该安全处理', () => {
            const sizeBefore = manager.nodes.size;
            manager.removeNode(999);
            expect(manager.nodes.size).toBe(sizeBefore);
        });
    });

    // ========================================
    // 5. TreeLifecycleAbility: moveNode
    // ========================================

    describe('TreeLifecycleAbility: moveNode', () => {
        beforeEach(() => {
            manager.ingest(createTreeData());
        });

        it('moveNode 应该更新节点的 parentId', () => {
            // 将市场部(3)从总公司(1)移到研发部(2)
            manager.moveNode(3, 2);

            const market = manager.nodes.get(3);
            expect(market.parentId).toBe(2);
        });

        it('moveNode 应该更新 hierarchy 索引', () => {
            manager.moveNode(3, 2);

            // 总公司(1)下不再有市场部(3)
            const companyChildren = manager.hierarchy.get(1) || [];
            expect(companyChildren).not.toContain(3);

            // 研发部(2)下新增市场部(3)
            const devChildren = manager.hierarchy.get(2) || [];
            expect(devChildren).toContain(3);
        });

        it('moveNode 应该重建路径和深度', () => {
            manager.moveNode(3, 2);

            const market = manager.nodes.get(3);
            expect(market._path).toBe('1.2.3');
            expect(market._depth).toBe(2);
        });

        it('moveNode 应该自动展开目标父节点', () => {
            // 研发部初始未展开
            expect(manager.nodes.get(2).expanded).toBe(false);

            manager.moveNode(3, 2);

            // 研发部应该被自动展开
            expect(manager.nodes.get(2).expanded).toBe(true);
        });

        it('moveNode 到 root 应该正确处理', () => {
            // 将前端组(4)移到根级别
            manager.moveNode(4, null);

            const frontend = manager.nodes.get(4);
            expect(frontend.parentId).toBeNull();
            expect(frontend._depth).toBe(0);
            expect(frontend._path).toBe('4');

            // root 下应该包含前端组
            const rootChildren = manager.hierarchy.get(null) || [];
            expect(rootChildren).toContain(4);
        });

        it('moveNode 相同目标应该不操作', () => {
            const marketBefore = { ...manager.nodes.get(3) };
            manager.moveNode(3, 1); // 市场部已经在总公司下

            // parentId 不变
            expect(manager.nodes.get(3).parentId).toBe(marketBefore.parentId);
        });
    });

    // ========================================
    // 6. TreeManagerAbility: expand/collapse
    // ========================================

    describe('TreeManagerAbility: expand/collapse', () => {
        beforeEach(() => {
            manager.ingest(createTreeData());
        });

        it('collapse 应该折叠节点', () => {
            // 先展开研发部
            manager.toggleExpand(2, true);

            // 折叠研发部
            manager.collapse(2);

            // 研发部应该被折叠
            expect(manager.nodes.get(2).expanded).toBe(false);
        });

        it('expand 使用 debounce，立即调用应该触发 _expand', () => {
            // mock isLoaded 返回 true，避免远程请求
            jest.spyOn(manager, 'isLoaded').mockReturnValue(true);

            manager.expand(2);

            // debounce immediate=true，第一次调用立即执行
            expect(manager.nodes.get(2).expanded).toBe(true);
        });

        it('expand 未加载时应该调用 _refreshChildren', async () => {
            mockFetchList([
                { id: 4, name: '前端组', parentId: 2, leaf: true },
                { id: 5, name: '后端组', parentId: 2, leaf: true },
            ]);

            // isLoaded 返回 false，触发远程刷新
            jest.spyOn(manager, 'isLoaded').mockReturnValue(false);
            jest.spyOn(manager, 'setLoaded').mockImplementation(() => {});

            await manager.expand(2);

            // 研发部应该被展开
            expect(manager.nodes.get(2).expanded).toBe(true);
        });
    });

    // ========================================
    // 7. TreeManagerAbility: refresh
    // ========================================

    describe('TreeManagerAbility: refresh', () => {
        beforeEach(() => {
            manager.ingest(createTreeData());
        });

        it('refresh 使用 debounce，立即调用应该触发 _refreshChildren', async () => {
            mockFetchList([
                { id: 4, name: '前端组', parentId: 2, leaf: true },
                { id: 5, name: '后端组', parentId: 2, leaf: true },
                { id: 6, name: '测试组', parentId: 2, leaf: true },
            ]);

            jest.spyOn(manager, 'setLoaded').mockImplementation(() => {});

            await (manager as any).refresh(2);

            // 验证 fetch 被调用
            expect(manager.fetch).toHaveBeenCalled();
        });

        it('refresh 后应该调用 setLoaded', async () => {
            mockFetchList([
                { id: 4, name: '前端组', parentId: 2, leaf: true },
                { id: 5, name: '后端组', parentId: 2, leaf: true },
            ]);

            const setLoadedSpy = jest.spyOn(manager, 'setLoaded');

            await (manager as any).refresh(2);

            expect(setLoadedSpy).toHaveBeenCalledWith(2, true);
        });
    });

    // ========================================
    // 8. TreeViewAbility: flat vs tree
    // ========================================

    describe('TreeViewAbility: flat vs tree', () => {
        it('useFlat=true（默认）应该生成扁平列表含 _depth', () => {
            manager.ingest(createTreeData());

            const flatItems = manager._generateFlatItems();

            // 扁平列表中每个 item 都有 _depth
            flatItems.forEach((item: any) => {
                expect(item).toHaveProperty('_depth');
            });

            // 总公司展开，研发部未展开
            // 扁平列表：总公司(0), 研发部(1), 市场部(1)
            expect(flatItems.length).toBe(3);
        });

        it('useFlat=false 应该生成嵌套树结构含 children', () => {
            // 修改 schema 为嵌套模式
            const treeSchema: TreeSchema = {
                ...treeTestSchema,
                useFlat: false,
            };
            (manager as any).schema = treeSchema;

            manager.ingest(createTreeData());

            const treeItems = manager._generateTreeData();

            // 嵌套模式下，根级别只有总公司
            expect(treeItems.length).toBe(1);
            expect(treeItems[0].id).toBe(1);
            expect(treeItems[0]).toHaveProperty('children');
            expect(treeItems[0].children.length).toBe(2); // 研发部、市场部
        });

        it('全部展开后扁平列表应该包含所有节点', () => {
            manager.ingest(createTreeData());

            // 展开所有非叶节点
            manager.toggleExpand(2, true);

            const flatItems = manager._generateFlatItems();

            // 总公司(0), 研发部(1), 前端组(2), 后端组(2), 市场部(1)
            expect(flatItems.length).toBe(5);
        });

        it('全部折叠后扁平列表应该只包含根节点', () => {
            manager.ingest(createTreeData());

            // 折叠总公司
            manager.toggleExpand(1, false);

            const flatItems = manager._generateFlatItems();

            expect(flatItems.length).toBe(1);
            expect(flatItems[0].id).toBe(1);
        });
    });

    // ========================================
    // 9. TreeSearchAbility: applySort
    // ========================================

    describe('TreeSearchAbility: applySort', () => {
        it('applySort 应该按指定字段降序排序', () => {
            manager.ingest(createTreeData());

            // 设置排序条件
            manager.search = { ...manager.search, sortBy: 'name', order: 'desc' };

            const children = manager.getChildren(1); // 研发部、市场部
            const sorted = manager.applySort(children);

            expect(sorted[0].name).toBe('研发部');
            expect(sorted[1].name).toBe('市场部');
        });

        it('applySort 升序排序', () => {
            manager.ingest(createTreeData());

            manager.search = { ...manager.search, sortBy: 'name', order: 'asc' };

            const children = manager.getChildren(1);
            const sorted = manager.applySort(children);

            expect(sorted[0].name).toBe('市场部');
            expect(sorted[1].name).toBe('研发部');
        });

        it('applySort 无排序条件时应该返回原列表', () => {
            manager.ingest(createTreeData());

            manager.search = { ...manager.search, sortBy: undefined, order: undefined };

            const children = manager.getChildren(1);
            const sorted = manager.applySort(children);

            // 应该返回原列表（引用相同或内容相同）
            expect(sorted).toEqual(children);
        });

        it('applySort 单元素列表应该直接返回', () => {
            manager.ingest(createTreeData());

            manager.search = { ...manager.search, sortBy: 'name', order: 'asc' };

            const children = manager.getChildren(2); // 前端组、后端组
            const single = [children[0]];
            const sorted = manager.applySort(single);

            expect(sorted.length).toBe(1);
        });
    });
});
