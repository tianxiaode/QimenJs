/**
 * Manager 能力单元测试
 *
 * 测试 Manager 层核心能力的逻辑：
 * 1. SchemaAbility: Schema 代理访问、自动注册、属性默认值
 * 2. LocalGetAbility: 本地 ID 查找
 * 3. RemoteCreateAbility: 远程创建 + loading 锁保护
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

import { SchemaAbility } from '@/entity/abilities/SchemaAbility';
import { LocalGetAbility } from '@/entity/abilities/local/LocalGetAbility';
import { RemoteCreateAbility } from '@/entity/abilities/remote/RemoteCreateAbility';
import { ENTITY_CRUD_EVENTS, ENTITY_LIST_EVENTS } from '@/events';
import { ComposableBase, withAbilities } from '@/composable';
import { SchemaRegistrar } from '@/schema';
import type { FlatSchema, TreeSchema } from '@/schema';
import { KernelError, KernelErrorCode } from '@/error';

// ============================================
// 辅助函数：创建带 Ability 的宿主实例
// ============================================

/**
 * 创建一个注入了指定 Ability 的宿主实例
 * 通过 ComposableBase 的能力注入机制，模拟 Manager 上下文
 */
function createHostWithAbility<T extends ComposableBase>(
    HostClass: new (...args: any[]) => T,
    ...args: any[]
): T {
    return new HostClass(...args);
}

// ============================================
// SchemaAbility 测试
// ============================================

describe('SchemaAbility', () => {
    const mockSchema: FlatSchema = {
        name: 'TestEntity',
        domain: 'default',
        idField: 'id',
        isTree: false,
        searchFields: ['name', 'email'],
        fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string', searchable: true },
            { name: 'email', type: 'string', searchable: true },
        ],
    };

    class TestSchemaHost extends ComposableBase {
        schema = mockSchema;
    }
    withAbilities(TestSchemaHost, [SchemaAbility]);

    let host: TestSchemaHost;

    beforeEach(() => {
        host = createHostWithAbility(TestSchemaHost);
    });

    afterEach(() => {
        host.dispose();
    });

    describe('getSchema', () => {
        it('应该返回编译后的 Schema', () => {
            const schema = (host as any).getSchema();
            expect(schema).toBeDefined();
            expect(schema.name).toBe('TestEntity');
            expect(schema.idField).toBe('id');
        });

        it('应该自动注册 Schema 到 SchemaRegistrar', () => {
            const registrar = SchemaRegistrar.getInstance();
            // getSchema() 内部会自动注册
            (host as any).getSchema();
            expect(registrar.has('TestEntity')).toBe(true);
        });
    });

    describe('schemaKeys', () => {
        it('应该返回正确的字段映射键名', () => {
            const keys = (host as any).schemaKeys;
            expect(keys.id).toBe('id');
            expect(keys.label).toBe('name');
            expect(keys.createdAt).toBe('createdAt');
            expect(keys.updatedAt).toBe('updatedAt');
            expect(keys.parentId).toBe('parentId');
            expect(keys.children).toBe('children');
            expect(keys.path).toBe('path');
            expect(keys.leaf).toBe('leaf');
        });
    });

    describe('schemaTree', () => {
        it('非树形 Schema 应该返回 isTree=false', () => {
            const tree = (host as any).schemaTree;
            expect(tree.isTree).toBe(false);
            expect(tree.isLazy).toBe(false);
        });
    });

    describe('schemaSort', () => {
        it('应该返回默认排序配置', () => {
            const sort = (host as any).schemaSort;
            expect(sort.prop).toBe('id');
            expect(sort.order).toBe('desc');
        });
    });

    describe('schemaFilters', () => {
        it('应该返回搜索字段列表', () => {
            const filters = (host as any).schemaFilters;
            expect(filters).toEqual(['name', 'email']);
        });
    });

    describe('树形 Schema', () => {
        const mockTreeSchema: TreeSchema = {
            name: 'TreeEntity',
            domain: 'default',
            idField: 'id',
            isTree: true,
            isLazy: true,
            root: null,
            parentIdField: 'parentId',
            childrenField: 'children',
            pathField: 'path',
            leafField: 'leaf',
            expandedField: 'expanded',
            fields: [
                { name: 'id', type: 'string' },
                { name: 'name', type: 'string' },
                { name: 'parentId', type: 'string' },
            ],
        };

        class TestTreeSchemaHost extends ComposableBase {
            schema = mockTreeSchema;
        }
        withAbilities(TestTreeSchemaHost, [SchemaAbility]);

        it('schemaTree 应该返回正确的树配置', () => {
            const treeHost = createHostWithAbility(TestTreeSchemaHost);
            const tree = (treeHost as any).schemaTree;
            expect(tree.isTree).toBe(true);
            expect(tree.isLazy).toBe(true);
            expect(tree.root).toBe(null);
            treeHost.dispose();
        });

        it('schemaKeys 应该返回树形字段映射', () => {
            const treeHost = createHostWithAbility(TestTreeSchemaHost);
            const keys = (treeHost as any).schemaKeys;
            expect(keys.parentId).toBe('parentId');
            expect(keys.children).toBe('children');
            expect(keys.path).toBe('path');
            expect(keys.leaf).toBe('leaf');
            treeHost.dispose();
        });
    });
});

// ============================================
// SchemaProxyAbility 测试
// ============================================

describe('SchemaProxyAbility', () => {
    const { RemoteCrudEntityManager } = require('@/entity/manager/managers');
    const { SchemaRegistrar } = require('@/schema');
    const { RegistryHub } = require('@/registry/RegistryHub');
    const { DomainRegistrar } = require('@/registry/registrars/DomainRegistrar');

    // 非树形 Schema
    const flatSchema = {
        name: 'SchemaProxyFlat',
        domain: 'schema-proxy-test',
        idField: 'code',
        idType: 'string' as const,
        nameField: 'title',
        defaultSort: 'createdAt',
        defaultOrder: 'desc' as const,
        searchFields: ['title', 'description'],
        isTree: false,
        fields: [
            { name: 'code', type: 'string' },
            { name: 'title', type: 'string' },
        ],
    };

    // 树形 Schema
    const treeSchema = {
        name: 'SchemaProxyTree',
        domain: 'schema-proxy-test',
        idField: 'id',
        isTree: true,
        isLazy: true,
        root: 'root-0',
        parentIdField: 'pid',
        childrenField: 'kids',
        pathField: 'nodePath',
        leafField: 'isLeaf',
        expandedField: 'isOpen',
        useFlat: true,
        fields: [
            { name: 'id', type: 'string' },
            { name: 'pid', type: 'string' },
        ],
    };

    class FlatManager extends RemoteCrudEntityManager {
        static entityType = 'SchemaProxyFlat';
        domain = 'schema-proxy-test';
        entityName = 'SchemaProxyFlat';
        url = '/api/flat';
        schema = flatSchema;
    }

    class TreeManager extends RemoteCrudEntityManager {
        static entityType = 'SchemaProxyTree';
        domain = 'schema-proxy-test';
        entityName = 'SchemaProxyTree';
        url = '/api/tree';
        schema = treeSchema;
    }

    beforeAll(() => {
        const domainRegistrar = RegistryHub.get('domain') as any;
        if (domainRegistrar && !domainRegistrar.get('schema-proxy-test')) {
            domainRegistrar.register('schema-proxy-test', {
                baseUrl: 'http://localhost:9999',
                preset: 'default',
                pageSize: 10,
                pagesizes: [5, 10, 20, 50],
            });
        }
        const schemaRegistrar = SchemaRegistrar.getInstance();
        if (!schemaRegistrar.has('SchemaProxyFlat')) schemaRegistrar.register(flatSchema);
        if (!schemaRegistrar.has('SchemaProxyTree')) schemaRegistrar.register(treeSchema);
    });

    describe('非树形 Schema', () => {
        let manager: FlatManager;

        beforeEach(() => {
            manager = new FlatManager();
        });
        afterEach(() => {
            manager.dispose();
        });

        it('idField 应该从 schema 获取', () => {
            expect(manager.idField).toBe('code');
        });

        it('idType 应该从 schema 获取', () => {
            expect(manager.idType).toBe('string');
        });

        it('nameField 应该从 schema 获取', () => {
            expect(manager.nameField).toBe('title');
        });

        it('defaultSort 应该从 schema 获取', () => {
            expect(manager.defaultSort).toBe('createdAt');
        });

        it('defaultOrder 应该从 schema 获取', () => {
            expect(manager.defaultOrder).toBe('desc');
        });

        it('searchFields 应该从 schema 获取', () => {
            expect(manager.searchFields).toEqual(['title', 'description']);
        });

        it('isTree 应该返回 false', () => {
            expect(manager.isTree).toBe(false);
        });

        it('isLazy 应该返回 false（非树形）', () => {
            expect(manager.isLazy).toBe(false);
        });

        it('root 应该返回空字符串（非树形）', () => {
            expect(manager.root).toBe('');
        });

        it('parentIdField 应该返回空字符串（非树形）', () => {
            expect(manager.parentIdField).toBe('');
        });

        it('childrenField 应该返回空字符串（非树形）', () => {
            expect(manager.childrenField).toBe('');
        });
    });

    describe('树形 Schema', () => {
        let manager: TreeManager;

        beforeEach(() => {
            manager = new TreeManager();
        });
        afterEach(() => {
            manager.dispose();
        });

        it('isTree 应该返回 true', () => {
            expect(manager.isTree).toBe(true);
        });

        it('isLazy 应该从 schema 获取', () => {
            expect(manager.isLazy).toBe(true);
        });

        it('root 应该从 schema 获取', () => {
            expect(manager.root).toBe('root-0');
        });

        it('parentIdField 应该从 schema 获取', () => {
            expect(manager.parentIdField).toBe('pid');
        });

        it('childrenField 应该从 schema 获取', () => {
            expect(manager.childrenField).toBe('kids');
        });

        it('pathField 应该从 schema 获取', () => {
            expect(manager.pathField).toBe('nodePath');
        });

        it('leafField 应该从 schema 获取', () => {
            expect(manager.leafField).toBe('isLeaf');
        });

        it('expandedField 应该从 schema 获取', () => {
            expect(manager.expandedField).toBe('isOpen');
        });

        it('useFlat 应该从 schema 获取', () => {
            expect(manager.useFlat).toBe(true);
        });
    });

    describe('默认值', () => {
        it('schema 缺少 idField 时应该返回默认值 id', () => {
            const minimalSchema = {
                name: 'SchemaProxyMinimal',
                domain: 'schema-proxy-test',
                isTree: false,
                fields: [{ name: 'id', type: 'string' }],
            };

            class MinimalManager extends RemoteCrudEntityManager {
                static entityType = 'SchemaProxyMinimal';
                domain = 'schema-proxy-test';
                entityName = 'SchemaProxyMinimal';
                url = '/api/minimal';
                schema = minimalSchema;
            }

            const schemaRegistrar = SchemaRegistrar.getInstance();
            if (!schemaRegistrar.has('SchemaProxyMinimal')) schemaRegistrar.register(minimalSchema);

            const manager = new MinimalManager();
            expect(manager.idField).toBe('id'); // 默认值
            expect(manager.idType).toBe('number'); // 默认值
            expect(manager.nameField).toBe('name'); // 默认值
            expect(manager.defaultSort).toBe(''); // 默认值
            expect(manager.defaultOrder).toBe('asc'); // 默认值
            expect(manager.searchFields).toEqual([]); // 默认值
            manager.dispose();
        });
    });
});

// ============================================
// LocalGetAbility 测试
// ============================================

describe('LocalGetAbility', () => {
    class TestLocalGetHost extends ComposableBase {
        compiledSchema = { idField: 'id' };
        sourceData = new Map<string | number, any>();
        item = null as any;
        emitEvent = jest.fn();
    }
    withAbilities(TestLocalGetHost, [LocalGetAbility]);

    let host: TestLocalGetHost;

    beforeEach(() => {
        host = createHostWithAbility(TestLocalGetHost);
    });

    afterEach(() => {
        host.dispose();
    });

    describe('get', () => {
        it('应该根据 ID 查找实体', () => {
            const user = { id: '1', name: 'John' };
            host.sourceData = new Map([
                ['1', user],
                ['2', { id: '2', name: 'Jane' }],
            ]);

            const result = (host as any).get('1');

            expect(result).toEqual(user);
            expect(host.item).toEqual(user);
        });

        it('找不到实体时应该返回 null', () => {
            host.sourceData = new Map([['1', { id: '1', name: 'John' }]]);

            const result = (host as any).get('999');

            expect(result).toBeNull();
            expect(host.item).toBeNull();
        });

        it('应该发射 got 事件', () => {
            const user = { id: '1', name: 'John' };
            host.sourceData = new Map([['1', user]]);

            (host as any).get('1');

            expect(host.emitEvent).toHaveBeenCalledWith(ENTITY_LIST_EVENTS.GOT, user);
        });

        it('找不到时也应该发射 got 事件（值为 null）', () => {
            host.sourceData = new Map();

            (host as any).get('999');

            expect(host.emitEvent).toHaveBeenCalledWith(ENTITY_LIST_EVENTS.GOT, null);
        });
    });
});

// ============================================
// RemoteCreateAbility 测试
// ============================================

describe('RemoteCreateAbility', () => {
    class TestRemoteCreateHost extends ComposableBase {
        loading = false;
        item = null as any;
        updateItem = jest.fn();
        buildOptions = jest.fn().mockResolvedValue({});
        fetch = jest.fn();
        emitEvent = jest.fn();
    }
    withAbilities(TestRemoteCreateHost, [RemoteCreateAbility]);

    let host: TestRemoteCreateHost;

    beforeEach(() => {
        host = createHostWithAbility(TestRemoteCreateHost);
    });

    afterEach(() => {
        host.dispose();
    });

    describe('create', () => {
        it('应该成功创建实体', async () => {
            const createdItem = { id: '1', name: 'New User' };
            host.fetch.mockResolvedValue({
                data: { item: createdItem },
            });
            host.updateItem.mockImplementation(async (item: any) => {
                host.item = item;
            });

            const result = await (host as any).create({ name: 'New User' });

            expect(host.buildOptions).toHaveBeenCalledWith('create', {}, { name: 'New User' }, {});
            expect(host.fetch).toHaveBeenCalledWith('create', expect.anything());
            expect(host.updateItem).toHaveBeenCalledWith(createdItem);
            expect(host.emitEvent).toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.CREATED, createdItem);
            expect(result).toEqual(createdItem);
        });

        it('loading 中应该抛出 KernelError', async () => {
            host.loading = true;

            await expect((host as any).create({ name: 'Test' })).rejects.toThrow(KernelError);
            await expect((host as any).create({ name: 'Test' })).rejects.toMatchObject({
                code: KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS,
            });
        });

        it('loading 中不应该发起请求', async () => {
            host.loading = true;

            try {
                await (host as any).create({ name: 'Test' });
            } catch {
                // 预期抛出错误
            }

            expect(host.buildOptions).not.toHaveBeenCalled();
            expect(host.fetch).not.toHaveBeenCalled();
        });
    });
});
