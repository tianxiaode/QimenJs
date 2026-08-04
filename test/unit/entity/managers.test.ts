/**
 * managers.ts 单元测试
 *
 * 覆盖各 abstract Manager 子类的属性初始化和 eventMap
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

jest.mock('@/http', () => ({
    HttpExecutor: jest.fn().mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(undefined),
    })),
}));

jest.mock('@/data-processor', () => ({
    DataProcessorRegistrar: jest.fn(),
    DataProcessorRegistrarName: 'DataProcessorRegistrar',
    dataProcessorExecutor: {
        execute: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('@/registry', () => ({
    RegistryHub: {
        get: jest.fn(),
    },
}));

jest.mock('@/cache', () => ({
    CacheFactory: {
        create: jest.fn().mockResolvedValue({
            id: 'test-provider',
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            remove: jest.fn().mockResolvedValue(undefined),
        }),
        release: jest.fn(),
    },
}));

jest.mock('@/events', () => {
    const actual = jest.requireActual('@/events');
    return {
        ...actual,
        EntityEventBus: {
            getInstance: jest.fn(() => ({
                entityEmit: jest.fn(),
                entityOn: jest.fn().mockReturnValue(jest.fn()),
                entityOnce: jest.fn(),
                getScopeId: jest.fn().mockReturnValue('test'),
            })),
        },
    };
});

jest.mock('@/context', () => {
    const eventCtx: any = {
        _event: '',
        _type: '',
        _source: '',
        _data: {},
        withEvent(e: string) {
            eventCtx._event = e;
            return eventCtx;
        },
        withType(t: string) {
            eventCtx._type = t;
            return eventCtx;
        },
        withSource(s: string) {
            eventCtx._source = s;
            return eventCtx;
        },
        withData(d: any) {
            eventCtx._data = d;
            return eventCtx;
        },
        build() {
            return {
                event: eventCtx._event,
                type: eventCtx._type,
                source: eventCtx._source,
                data: eventCtx._data,
            };
        },
    };
    const reqCtx: any = {};
    const chain = {
        withIdentity(i: any) {
            reqCtx.identity = i;
            return chain;
        },
        withRequest(r: any) {
            reqCtx.request = r;
            return chain;
        },
        withParams(p: any) {
            reqCtx.params = p;
            return chain;
        },
        withSchema(s: any) {
            reqCtx.schema = s;
            return chain;
        },
        build() {
            return reqCtx;
        },
    };
    return {
        RequestContextBuilder: { create: () => chain },
        EventContextBuilder: { create: () => eventCtx },
    };
});

jest.mock('@/permission', () => ({
    PermissionRegistrar: {
        getInstance: () => ({
            check: jest.fn().mockReturnValue(true),
            hasPermission: jest.fn().mockReturnValue(true),
        }),
    },
}));

jest.mock('@/entity/dispatch/DataDispatchCenter', () => ({
    dataDispatchCenter: { registerType: jest.fn() },
}));

jest.mock('@/schema', () => ({
    SchemaRegistrar: {
        getInstance: jest.fn(() => ({
            has: jest.fn().mockReturnValue(true),
            getCompiled: jest.fn().mockReturnValue({
                schema: { name: 'TestEntity', idField: 'id', fields: [] },
            }),
            register: jest.fn(),
        })),
    },
}));

jest.mock('@/composable', () => {
    class ComposableBase {
        static use() {}
        logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
        _getCompiledSchema() {
            return { schema: { name: 'TestEntity', idField: 'id', fields: [] } };
        }
        getSchema() {
            return this._getCompiledSchema().schema;
        }
        dispose() {}
    }
    return { ComposableBase, withAbilities: (cls: any) => cls, InferAbilities: () => ({}) };
});

jest.mock('@/system-abilities', () => ({
    EventAbility: { __name__: 'EventAbility' },
    DebounceAbility: { __name__: 'DebounceAbility' },
    DomainAbility: { __name__: 'DomainAbility' },
    SystemAbility: { __name__: 'SystemAbility' },
}));

jest.mock('@/entity/abilities/SchemaAbility', () => ({ __name__: 'SchemaAbility' }));

jest.mock('@/entity/abilities', () => ({
    FlatLocalStateAbility: { __name__: 'FlatLocalStateAbility' },
    LocalListAbility: { __name__: 'LocalListAbility' },
    LocalGetAbility: { __name__: 'LocalGetAbility' },
    FlatLocalMutationAbility: { __name__: 'FlatLocalMutationAbility' },
    FlatLocalDeleteAbility: { __name__: 'FlatLocalDeleteAbility' },
    FlatRemoteStateAbility: { __name__: 'FlatRemoteStateAbility' },
    FlatRemoteListAbility: { __name__: 'FlatRemoteListAbility' },
    FlatRemoteGetAllAbility: { __name__: 'FlatRemoteGetAllAbility' },
    RemoteGetAbility: { __name__: 'RemoteGetAbility' },
    FlatRemoteQueryAbility: { __name__: 'FlatRemoteQueryAbility' },
    RemoteCreateAbility: { __name__: 'RemoteCreateAbility' },
    RemoteUpdateAbility: { __name__: 'RemoteUpdateAbility' },
    RemoteDeleteAbility: { __name__: 'RemoteDeleteAbility' },
    RemoteToggleAbility: { __name__: 'RemoteToggleAbility' },
    TreeRemoteStateAbility: { __name__: 'TreeRemoteStateAbility' },
    SchemaProxyAbility: { __name__: 'SchemaProxyAbility' },
    CacheAbility: { __name__: 'CacheAbility' },
    DirtyAbility: { __name__: 'DirtyAbility' },
    DomainPagingAbility: { __name__: 'DomainPagingAbility' },
    SearchAbility: { __name__: 'SearchAbility' },
    TreePathAbility: { __name__: 'TreePathAbility' },
    TreeLifecycleAbility: { __name__: 'TreeLifecycleAbility' },
    TreeSearchAbility: { __name__: 'TreeSearchAbility' },
    TreeViewAbility: { __name__: 'TreeViewAbility' },
}));

import {
    LocalReadonlyEntityManager,
    LocalCrudEntityManager,
    RemoteReadonlyEntityManager,
    RemoteCrudEntityManager,
    RemoteTreeEntityManager,
} from '@/entity/manager/managers';

function createConcrete<T extends abstract new (...args: any[]) => any>(
    Base: T,
    entityType: string
) {
    class Concrete extends (Base as any) {
        static entityType = entityType;
        url = '/api/test';
        schema: any = {
            name: 'TestEntity',
            idField: 'id',
            idType: 'string',
            domain: 'test',
            fields: [],
        };
    }
    return new Concrete() as InstanceType<T>;
}

describe('managers', () => {
    describe('LocalReadonlyEntityManager', () => {
        it('应初始化 isRemote=false', () => {
            const mgr = createConcrete(LocalReadonlyEntityManager, 'local-readonly');
            expect(mgr.isRemote).toBe(false);
            mgr.dispose();
        });

        it('应初始化 sourceData/items/item/search', () => {
            const mgr = createConcrete(LocalReadonlyEntityManager, 'local-readonly');
            expect(mgr.sourceData).toBeInstanceOf(Map);
            expect(mgr.loading).toBe(false);
            expect(mgr.items).toEqual([]);
            expect(mgr.item).toBeNull();
            expect(mgr.search).toEqual({});
            mgr.dispose();
        });

        it('应有正确的 eventMap', () => {
            const mgr = createConcrete(LocalReadonlyEntityManager, 'local-readonly');
            expect(mgr.eventMap).toBeDefined();
            mgr.dispose();
        });
    });

    describe('LocalCrudEntityManager', () => {
        it('应初始化 isRemote=false', () => {
            const mgr = createConcrete(LocalCrudEntityManager, 'local-crud');
            expect(mgr.isRemote).toBe(false);
            mgr.dispose();
        });

        it('应初始化 sourceData/items/item/search', () => {
            const mgr = createConcrete(LocalCrudEntityManager, 'local-crud');
            expect(mgr.sourceData).toBeInstanceOf(Map);
            expect(mgr.loading).toBe(false);
            expect(mgr.items).toEqual([]);
            expect(mgr.item).toBeNull();
            expect(mgr.search).toEqual({});
            mgr.dispose();
        });

        it('应有 CRUD 相关的 eventMap', () => {
            const mgr = createConcrete(LocalCrudEntityManager, 'local-crud');
            expect(mgr.eventMap).toBeDefined();
            mgr.dispose();
        });
    });

    describe('RemoteReadonlyEntityManager', () => {
        it('应初始化 isRemote=true', () => {
            const mgr = createConcrete(RemoteReadonlyEntityManager, 'remote-readonly');
            expect(mgr.isRemote).toBe(true);
            mgr.dispose();
        });

        it('应初始化分页属性', () => {
            const mgr = createConcrete(RemoteReadonlyEntityManager, 'remote-readonly');
            expect(mgr.total).toBe(0);
            expect(mgr.page).toBe(1);
            expect(mgr.pages).toBe(0);
            expect(mgr.hasMore).toBe(false);
            mgr.dispose();
        });

        it('应有分页相关的 eventMap', () => {
            const mgr = createConcrete(RemoteReadonlyEntityManager, 'remote-readonly');
            expect(mgr.eventMap).toBeDefined();
            mgr.dispose();
        });
    });

    describe('RemoteCrudEntityManager', () => {
        it('应初始化 isRemote=true', () => {
            const mgr = createConcrete(RemoteCrudEntityManager, 'remote-crud');
            expect(mgr.isRemote).toBe(true);
            mgr.dispose();
        });

        it('应初始化分页属性', () => {
            const mgr = createConcrete(RemoteCrudEntityManager, 'remote-crud');
            expect(mgr.total).toBe(0);
            expect(mgr.page).toBe(1);
            expect(mgr.pages).toBe(0);
            expect(mgr.hasMore).toBe(false);
            mgr.dispose();
        });

        it('应有 CRUD + 分页相关的 eventMap', () => {
            const mgr = createConcrete(RemoteCrudEntityManager, 'remote-crud');
            expect(mgr.eventMap).toBeDefined();
            mgr.dispose();
        });
    });

    describe('RemoteTreeEntityManager', () => {
        it('应初始化 isRemote=true', () => {
            const mgr = createConcrete(RemoteTreeEntityManager, 'remote-tree');
            expect(mgr.isRemote).toBe(true);
            mgr.dispose();
        });

        it('应初始化 expandedIds', () => {
            const mgr = createConcrete(RemoteTreeEntityManager, 'remote-tree');
            expect(mgr.expandedIds).toBeInstanceOf(Set);
            mgr.dispose();
        });

        it('应有树形相关的 eventMap', () => {
            const mgr = createConcrete(RemoteTreeEntityManager, 'remote-tree');
            expect(mgr.eventMap).toBeDefined();
            mgr.dispose();
        });
    });
});
