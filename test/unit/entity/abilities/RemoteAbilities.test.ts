import { ENTITY_LIST_EVENTS, ENTITY_CRUD_EVENTS, ENTITY_TREE_EVENTS } from '@/events/entity-events';

function createBaseHost(overrides: Record<string, any> = {}) {
    return {
        fetch: jest.fn().mockResolvedValue({ data: { list: [], total: 0 } }),
        buildOptions: jest.fn().mockResolvedValue({ url: '/api', method: 'GET', queryParams: {} }),
        tryGetCache: jest.fn().mockResolvedValue(null),
        updateData: jest.fn(),
        updateItem: jest.fn(),
        deleteFromItems: jest.fn(),
        emit: jest.fn(),
        emitEvent: jest.fn(),
        toParams: jest.fn().mockReturnValue({}),
        debounce: jest.fn((_key: string, fn: Function, _ms?: number, _leading?: boolean) => fn),
        items: [],
        total: 0,
        search: {},
        loading: false,
        item: null,
        page: 1,
        pageSize: 10,
        pageSizes: [10, 20, 50],
        idField: 'id',
        schemaKeys: { idField: 'id' },
        schema: {},
        isValidPage: jest.fn().mockReturnValue(true),
        logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
        systemConfig: jest.fn().mockReturnValue('production'),
        refreshView: jest.fn(),
        toggleExpand: jest.fn(),
        isLoaded: jest.fn().mockReturnValue(true),
        syncChildren: jest.fn(),
        setLoaded: jest.fn(),
        moveNode: jest.fn(),
        getChildren: jest.fn().mockReturnValue([]),
        startEdit: jest.fn(),
        rollbackAll: jest.fn(),
        parentIdField: 'parentId',
        ...overrides,
    };
}

function bindAbility(host: any, abilityObj: Record<string, any>) {
    Object.keys(abilityObj).forEach(key => {
        const desc = Object.getOwnPropertyDescriptor(abilityObj, key);
        if (!desc) return;
        if (typeof desc.value === 'function') {
            const origFn = desc.value;
            host[key] = jest.fn((...args: any[]) => origFn.call(host, ...args));
        } else if (desc.get) {
            Object.defineProperty(host, key, { get: desc.get.bind(host), configurable: true });
        }
    });
}

describe('FlatRemoteListAbility', () => {
    let host: any;

    beforeEach(() => {
        host = createBaseHost();
        const ability = jest.requireActual(
            '@/entity/abilities/remote/FlatRemoteListAbility'
        ).FlatRemoteListAbility;
        bindAbility(host, ability);
    });

    test('list 无缓存时应 fetch 并 updateData', async () => {
        host.fetch.mockResolvedValue({ data: { list: [{ id: 1 }], total: 1 } });
        await host.list();
        expect(host.fetch).toHaveBeenCalledWith('list', expect.any(Object));
        expect(host.updateData).toHaveBeenCalledWith([{ id: 1 }], 1);
        expect(host.emitEvent).toHaveBeenCalledWith(ENTITY_LIST_EVENTS.LISTED, host.items);
    });

    test('list 有缓存时应使用缓存不 fetch', async () => {
        host.tryGetCache.mockResolvedValue({ items: [{ id: 2 }], total: 1 });
        await host.list();
        expect(host.fetch).not.toHaveBeenCalled();
        expect(host.updateData).toHaveBeenCalled();
    });

    test('refresh 应跳过缓存直接 fetch', async () => {
        host.tryGetCache.mockResolvedValue({ items: [{ id: 2 }], total: 1 });
        await host.refresh();
        expect(host.fetch).toHaveBeenCalled();
    });
});

describe('FlatRemoteGetAllAbility', () => {
    let host: any;

    beforeEach(() => {
        host = createBaseHost();
        const ability = jest.requireActual(
            '@/entity/abilities/remote/FlatRemoteGetAllAbility'
        ).FlatRemoteGetAllAbility;
        bindAbility(host, ability);
    });

    test('getAll 应 fetch 并返回全部数据', async () => {
        host.fetch.mockResolvedValue({ data: { list: [{ id: 1 }, { id: 2 }], total: 2 } });
        const result = await host.getAll();
        expect(host.fetch).toHaveBeenCalledWith('get-all', expect.any(Object));
        expect(host.updateData).toHaveBeenCalled();
        expect(result).toBeDefined();
    });
});

describe('RemoteGetAbility', () => {
    let host: any;

    beforeEach(() => {
        host = createBaseHost();
        const ability = jest.requireActual(
            '@/entity/abilities/remote/RemoteGetAbility'
        ).RemoteGetAbility;
        bindAbility(host, ability);
    });

    test('get 应 fetch 单条数据并 updateItem', async () => {
        host.fetch.mockResolvedValue({ data: { item: { id: 1, name: 'test' } } });
        await host.get(1);
        expect(host.fetch).toHaveBeenCalledWith('get', expect.any(Object));
        expect(host.updateItem).toHaveBeenCalledWith({ id: 1, name: 'test' });
    });
});

describe('RemoteCreateAbility', () => {
    let host: any;

    beforeEach(() => {
        host = createBaseHost();
        const ability = jest.requireActual(
            '@/entity/abilities/remote/RemoteCreateAbility'
        ).RemoteCreateAbility;
        bindAbility(host, ability);
    });

    test('create 应 fetch 并 emitEvent created', async () => {
        host.fetch.mockResolvedValue({ data: { item: { id: 1, name: 'new' } } });
        await host.create({ name: 'new' });
        expect(host.fetch).toHaveBeenCalledWith('create', expect.any(Object));
        expect(host.updateItem).toHaveBeenCalledWith({ id: 1, name: 'new' });
        expect(host.emitEvent).toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.CREATED, {
            id: 1,
            name: 'new',
        });
    });

    test('create loading 中应抛出错误', async () => {
        host.loading = true;
        await expect(host.create({ name: 'new' })).rejects.toThrow();
    });
});

describe('RemoteUpdateAbility', () => {
    let host: any;

    beforeEach(() => {
        host = createBaseHost();
        const ability = jest.requireActual(
            '@/entity/abilities/remote/RemoteUpdateAbility'
        ).RemoteUpdateAbility;
        bindAbility(host, ability);
    });

    test('update 应 fetch 并 emitEvent updated', async () => {
        host.fetch.mockResolvedValue({ data: { item: { id: 1, name: 'updated' } } });
        await host.update({ id: 1, name: 'updated' });
        expect(host.fetch).toHaveBeenCalledWith('update', expect.any(Object));
        expect(host.updateItem).toHaveBeenCalledWith({ id: 1, name: 'updated' });
        expect(host.emitEvent).toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.UPDATED, {
            id: 1,
            name: 'updated',
        });
    });

    test('update loading 中应抛出错误', async () => {
        host.loading = true;
        await expect(host.update({ id: 1 })).rejects.toThrow();
    });
});

describe('RemoteDeleteAbility', () => {
    let host: any;

    beforeEach(() => {
        host = createBaseHost();
        const ability = jest.requireActual(
            '@/entity/abilities/remote/RemoteDeleteAbility'
        ).RemoteDeleteAbility;
        bindAbility(host, ability);
    });

    test('delete 单个 id 应 fetch 并 deleteFromItems', async () => {
        host.fetch.mockResolvedValue({ data: {} });
        await host.delete(1);
        expect(host.fetch).toHaveBeenCalledWith('delete', expect.any(Object));
        expect(host.deleteFromItems).toHaveBeenCalledWith(1);
    });

    test('delete 数组 id 应 fetch batch-delete', async () => {
        host.fetch.mockResolvedValue({ data: {} });
        await host.delete([1, 2]);
        expect(host.fetch).toHaveBeenCalledWith('batch-delete', expect.any(Object));
        expect(host.deleteFromItems).toHaveBeenCalledWith([1, 2]);
    });

    test('delete loading 中应抛出错误', async () => {
        host.loading = true;
        await expect(host.delete(1)).rejects.toThrow();
    });
});

describe('RemoteToggleAbility', () => {
    let host: any;

    beforeEach(() => {
        host = createBaseHost();
        const ability = jest.requireActual(
            '@/entity/abilities/remote/RemoteToggleAbility'
        ).RemoteToggleAbility;
        bindAbility(host, ability);
    });

    test('toggle 应 fetch 并 emitEvent toggled', async () => {
        const item = { id: 1, active: false };
        host.fetch.mockResolvedValue({ data: { item: { id: 1, active: true } } });
        await host.toggle(item, 'active');
        expect(host.fetch).toHaveBeenCalledWith('toggle', expect.any(Object));
        expect(host.emitEvent).toHaveBeenCalledWith(
            ENTITY_CRUD_EVENTS.TOGGLED,
            expect.objectContaining({ id: 1 })
        );
    });

    test('toggle 失败应回滚', async () => {
        const item = { id: 1, active: false };
        host.fetch.mockRejectedValue(new Error('network'));
        await host.toggle(item, 'active');
        expect(item.active).toBe(false);
        expect(host.updateItem).toHaveBeenCalled();
    });
});

describe('FlatRemoteQueryAbility', () => {
    let host: any;

    beforeEach(() => {
        host = createBaseHost({ schema: {} });
        const listAbility = jest.requireActual(
            '@/entity/abilities/remote/FlatRemoteListAbility'
        ).FlatRemoteListAbility;
        const queryAbility = jest.requireActual(
            '@/entity/abilities/remote/FlatRemoteQueryAbility'
        ).FlatRemoteQueryAbility;
        bindAbility(host, listAbility);
        bindAbility(host, queryAbility);
    });

    test('filter 应设置 keyword 并调用 _internalList', async () => {
        host.search = {};
        await host.filter('test');
        expect(host.search.keyword).toBe('test');
        expect(host._internalList).toHaveBeenCalled();
    });

    test('searchBy 应合并搜索条件并调用 _internalList', async () => {
        host.search = {};
        await host.searchBy({ status: 'active' });
        expect(host.search.status).toBe('active');
        expect(host._internalList).toHaveBeenCalled();
    });

    test('sort 应设置排序条件并调用 _internalList', async () => {
        host.search = {};
        await host.sort('name', 'desc');
        expect(host.search.sortBy).toBe('name');
        expect(host.search.sortOrder).toBe('desc');
        expect(host._internalList).toHaveBeenCalled();
    });

    test('sort null order 应清空 sortBy', async () => {
        host.search = {};
        await host.sort('name', null);
        expect(host.search.sortBy).toBe('');
        expect(host.search.sortOrder).toBe('asc');
    });

    test('reset 应清空搜索条件并调用 _internalList', async () => {
        host.search = { keyword: 'old', sortBy: 'name' };
        await host.reset();
        expect(host.search).toEqual({});
        expect(host.page).toBe(1);
        expect(host._internalList).toHaveBeenCalled();
    });

    test('toParams 非 tree 应包含 page 和 pageSize', () => {
        host.search = { keyword: 'test' };
        host.page = 2;
        host.pageSize = 20;
        const params = host.toParams();
        expect(params.keyword).toBe('test');
        expect(params.page).toBe(2);
        expect(params.pageSize).toBe(20);
    });

    test('toParams tree 应包含 parentId', () => {
        host.schema = { isTree: true };
        host.search = { keyword: 'test' };
        host.root = 'root1';
        const params = host.toParams();
        expect(params.parentId).toBe('root1');
        expect(params.page).toBeUndefined();
    });

    test('toParams 应跳过空值', () => {
        host.search = { keyword: '', status: null, type: undefined, name: 'ok' };
        const params = host.toParams();
        expect(params.keyword).toBeUndefined();
        expect(params.status).toBeUndefined();
        expect(params.type).toBeUndefined();
        expect(params.name).toBe('ok');
    });

    test('toParams 数组值应用逗号拼接', () => {
        host.search = { ids: [1, 2, 3] };
        const params = host.toParams();
        expect(params.ids).toBe('1,2,3');
    });
});

describe('RemotePagingAbility', () => {
    let host: any;

    beforeEach(() => {
        host = createBaseHost();
        const listAbility = jest.requireActual(
            '@/entity/abilities/remote/FlatRemoteListAbility'
        ).FlatRemoteListAbility;
        const pagingAbility = jest.requireActual(
            '@/entity/abilities/remote/RemotePagingAbility'
        ).RemotePagingAbility;
        bindAbility(host, listAbility);
        bindAbility(host, pagingAbility);
    });

    test('prev 应减少 page 并调用 _internalList', async () => {
        host.page = 2;
        await host.prev();
        expect(host.page).toBe(1);
        expect(host._internalList).toHaveBeenCalled();
    });

    test('prev 在第一页应不调用 _internalList', async () => {
        host.page = 1;
        host.isValidPage.mockReturnValue(false);
        await host.prev();
        expect(host._internalList).not.toHaveBeenCalled();
    });

    test('next 应增加 page 并调用 _internalList', async () => {
        host.page = 1;
        await host.next();
        expect(host.page).toBe(2);
        expect(host._internalList).toHaveBeenCalled();
    });

    test('jump 应设置 page 并调用 _internalList', async () => {
        host.page = 1;
        await host.jump(3);
        expect(host.page).toBe(3);
        expect(host._internalList).toHaveBeenCalled();
    });

    test('jump 无效页应不调用 _internalList', async () => {
        host.page = 1;
        host.isValidPage.mockReturnValue(false);
        await host.jump(999);
        expect(host._internalList).not.toHaveBeenCalled();
    });

    test('changeSize 应设置 pageSize 并调用 _internalList', async () => {
        host.pageSize = 10;
        await host.changeSize(20);
        expect(host.pageSize).toBe(20);
        expect(host.page).toBe(1);
        expect(host._internalList).toHaveBeenCalled();
    });

    test('changeSize 无效 size 在 development 应抛出错误', async () => {
        host.systemConfig.mockReturnValue('development');
        await expect(host.changeSize(999)).rejects.toThrow();
    });

    test('changeSize 无效 size 在 production 应不抛出', async () => {
        host.systemConfig.mockReturnValue('production');
        const result = await host.changeSize(999);
        expect(result).toEqual([]);
    });
});

describe('TreeManagerAbility', () => {
    let host: any;

    beforeEach(() => {
        host = createBaseHost();
        const ability = jest.requireActual(
            '@/entity/abilities/remote/TreeManagerAbility'
        ).TreeManagerAbility;
        bindAbility(host, ability);
    });

    test('expand 已加载节点应 toggleExpand 并 emitEvent', async () => {
        host.isLoaded.mockReturnValue(true);
        await host.expand('node1');
        expect(host.toggleExpand).toHaveBeenCalledWith('node1', true);
        expect(host.emitEvent).toHaveBeenCalledWith(ENTITY_TREE_EVENTS.EXPANDED, { id: 'node1' });
    });

    test('expand 未加载节点应先 refreshChildren', async () => {
        host.isLoaded.mockReturnValue(false);
        host.fetch.mockResolvedValue({ data: { list: [{ id: 'c1' }] } });
        await host.expand('node1');
        expect(host.fetch).toHaveBeenCalled();
        expect(host.toggleExpand).toHaveBeenCalledWith('node1', true);
    });

    test('collapse 应设置展开状态为 false', () => {
        host.collapse('node1');
        expect(host.toggleExpand).toHaveBeenCalledWith('node1', false);
        expect(host.refreshView).toHaveBeenCalled();
        expect(host.emitEvent).toHaveBeenCalledWith(ENTITY_TREE_EVENTS.COLLAPSED, { id: 'node1' });
    });

    test('move 应 fetch 并 moveNode', async () => {
        host.fetch.mockResolvedValue({ data: {} });
        await host.move(1, 2);
        expect(host.fetch).toHaveBeenCalledWith('update', expect.any(Object));
        expect(host.moveNode).toHaveBeenCalledWith(1, 2);
        expect(host.emitEvent).toHaveBeenCalledWith(ENTITY_TREE_EVENTS.MOVED, {
            id: 1,
            targetPid: 2,
        });
    });

    test('refresh 应 debounce 调用 _refreshChildren', async () => {
        host.fetch.mockResolvedValue({ data: { list: [] } });
        await host.refresh(null);
        expect(host.fetch).toHaveBeenCalled();
    });

    test('getSubTree 应调用 getChildren', () => {
        host.getSubTree('p1');
        expect(host.getChildren).toHaveBeenCalledWith('p1');
    });
});

describe('TreeRemoteStateAbility', () => {
    let host: any;

    beforeEach(() => {
        host = createBaseHost();
        const ability = jest.requireActual(
            '@/entity/abilities/remote/TreeRemoteStateAbility'
        ).TreeRemoteStateAbility;
        bindAbility(host, ability);
    });

    test('updateData 应设置 items 和 total', () => {
        host.updateData([{ id: 1 }], 5);
        expect(host.items).toEqual([{ id: 1 }]);
        expect(host.total).toBe(5);
    });

    test('updateData 不传 total 应使用 items.length', () => {
        host.updateData([{ id: 1 }, { id: 2 }]);
        expect(host.total).toBe(2);
    });

    test('refreshView 应浅拷贝 items 并 emitEvent listed', () => {
        host.items = [{ id: 1 }];
        host.refreshView();
        expect(host.items).toEqual([{ id: 1 }]);
        expect(host.items).not.toBe([{ id: 1 }]);
        expect(host.emitEvent).toHaveBeenCalledWith(ENTITY_LIST_EVENTS.LISTED, host.items);
    });
});
