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
            }))
        }
    };
});

import { SchemaAbility } from '@/entity/abilities/manager/SchemaAbility';
import { LocalGetAbility } from '@/entity/abilities/manager/local/LocalGetAbility';
import { RemoteCreateAbility } from '@/entity/abilities/manager/remote/RemoteCreateAbility';
import { ComposableBase } from '@/composable';
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
        static readonly abilities = [SchemaAbility];
        schema = mockSchema;
    }

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
            static readonly abilities = [SchemaAbility];
            schema = mockTreeSchema;
        }

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
// LocalGetAbility 测试
// ============================================

describe('LocalGetAbility', () => {
    class TestLocalGetHost extends ComposableBase {
        static readonly abilities = [LocalGetAbility];
        compiledSchema = { idField: 'id' };
        sourceData = new Map<string | number, any>();
        item = null as any;
        emit = jest.fn();
    }

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
            host.sourceData = new Map([['1', user], ['2', { id: '2', name: 'Jane' }]]);

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

            expect(host.emit).toHaveBeenCalledWith('got', user);
        });

        it('找不到时也应该发射 got 事件（值为 null）', () => {
            host.sourceData = new Map();

            (host as any).get('999');

            expect(host.emit).toHaveBeenCalledWith('got', null);
        });
    });
});

// ============================================
// RemoteCreateAbility 测试
// ============================================

describe('RemoteCreateAbility', () => {
    class TestRemoteCreateHost extends ComposableBase {
        static readonly abilities = [RemoteCreateAbility];
        loading = false;
        item = null as any;
        updateItem = jest.fn();
        buildOptions = jest.fn().mockResolvedValue({});
        fetch = jest.fn();
        emit = jest.fn();
    }

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
            expect(host.emit).toHaveBeenCalledWith('created', createdItem);
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
