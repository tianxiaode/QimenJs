/**
 * BaseEntityManager 单元测试
 *
 * 覆盖：
 * 1. fetch 错误处理（hasError 分支）
 * 2. buildOptions body 数组映射
 * 3. populateResponseData item 分支
 * 4. processItem / onPrepareField / onPopulateEntity
 * 5. dispose
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

jest.mock('@/http', () => {
    const mockExecute = jest.fn().mockResolvedValue(undefined);
    return {
        HttpExecutor: jest.fn().mockImplementation(() => ({
            execute: mockExecute,
        })),
        __mockExecute: mockExecute,
    };
});

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
                schema: {
                    name: 'TestEntity',
                    idField: 'id',
                    fields: [],
                },
            }),
            register: jest.fn(),
        })),
    },
}));

import { BaseEntityManager } from '@/entity/manager/BaseEntityManager';
import type { HttpRequestOptions } from '@/http/types/http-context';

// ============================================
// 辅助
// ============================================

class TestBaseEntityManager extends BaseEntityManager {
    static entityType = 'TestBase';
    domain = 'test-domain';
    entityName = 'TestEntity';
    url = '/api/test';
    schema: any = { name: 'TestEntity', idField: 'id', fields: [] };
}

function createManager(): TestBaseEntityManager {
    return new TestBaseEntityManager();
}

// ============================================
// 测试
// ============================================

describe('BaseEntityManager', () => {
    let manager: TestBaseEntityManager;

    beforeEach(() => {
        jest.clearAllMocks();
        manager = createManager();
    });

    afterEach(() => {
        manager.dispose();
    });

    describe('fetch', () => {
        it('hasError 为 true 时应抛出错误并触发 error 事件', async () => {
            const mockHttpModule = jest.requireMock('@/http');
            const mockExecute = mockHttpModule.__mockExecute as jest.Mock;

            // 模拟请求成功但 hasError 为 true
            mockExecute.mockImplementationOnce((ctx: any) => {
                ctx.metadata.hasError = true;
                ctx.error = new Error('Server error');
            });

            const emitSpy = jest.spyOn(manager, 'entityEmit');

            await expect(
                manager.fetch('list' as any, { url: '/api/test', method: 'GET' } as any)
            ).rejects.toThrow('Server error');

            expect(emitSpy).toHaveBeenCalledWith('list:error', expect.anything());
            expect(manager.loading).toBe(false);
        });

        it('成功时应触发 success 事件', async () => {
            const mockHttpModule = jest.requireMock('@/http');
            const mockExecute = mockHttpModule.__mockExecute as jest.Mock;

            mockExecute.mockImplementationOnce((ctx: any) => {
                ctx.metadata.hasError = false;
                ctx.data = { list: [] };
            });

            const emitSpy = jest.spyOn(manager, 'entityEmit');

            await manager.fetch('list' as any, { url: '/api/test', method: 'GET' } as any);

            expect(emitSpy).toHaveBeenCalledWith('list:success', expect.anything());
            expect(manager.loading).toBe(false);
        });

        it('无论成功或失败都应重置 loading', async () => {
            const mockHttpModule = jest.requireMock('@/http');
            const mockExecute = mockHttpModule.__mockExecute as jest.Mock;

            mockExecute.mockImplementationOnce((ctx: any) => {
                ctx.metadata.hasError = true;
                ctx.error = new Error('fail');
            });

            try {
                await manager.fetch('list' as any, { url: '/api/test', method: 'GET' } as any);
            } catch {}

            expect(manager.loading).toBe(false);
        });
    });

    describe('buildOptions', () => {
        it('body 为数组时应映射每个 item', async () => {
            const schema = { name: 'TestEntity', idField: 'id', fields: [{ name: 'name' }] };
            manager.schema = schema;

            const options = await manager.buildOptions(
                'create' as any,
                {},
                [{ name: 'item1' }, { name: 'item2' }],
                {}
            );

            expect(Array.isArray(options.body)).toBe(true);
            expect(options.body.length).toBe(2);
        });

        it('body 为对象时应映射单个 item', async () => {
            const schema = { name: 'TestEntity', idField: 'id', fields: [{ name: 'name' }] };
            manager.schema = schema;

            const options = await manager.buildOptions('create' as any, {}, { name: 'item1' }, {});

            expect(options.body).toEqual(expect.objectContaining({ name: 'item1' }));
        });

        it('body 为 null 时不应处理', async () => {
            const options = await manager.buildOptions('list' as any, {}, null, {});

            expect(options.body).toBeNull();
        });
    });

    describe('processItem', () => {
        it('应处理字段并合并结果', () => {
            const fields = [
                { name: 'name' },
                { name: 'age' },
                { name: 'secret', mapping: 'ignore' },
            ];
            const data = { name: 'test', age: 20, extra: 'val' };

            const result = (manager as any).processItem('create', {}, data, fields);

            expect(result.name).toBe('test');
            expect(result.age).toBe(20);
            expect(result.extra).toBe('val');
        });

        it('字段 mapping 为函数时应跳过', () => {
            const fields = [
                { name: 'name' },
                { name: 'computed', mapping: () => 'computed_value' },
            ];
            const data = { name: 'test', computed: 'original' };

            const result = (manager as any).processItem('create', {}, data, fields);

            expect(result.name).toBe('test');
            // mapping 为函数时跳过，不处理该字段
        });

        it('字段 mapping 为字符串时应使用 mapping 作为 key', () => {
            const fields = [{ name: 'userName', mapping: 'user_name' }];
            const data = { userName: 'test' };

            const result = (manager as any).processItem('create', {}, data, fields);

            expect(result.user_name).toBe('test');
        });

        it('processedValue 为 undefined 时不应设置该字段', () => {
            const fields = [{ name: 'name' }, { name: 'missing' }];
            const data = { name: 'test' };

            const result = (manager as any).processItem('create', {}, data, fields);

            expect(result.name).toBe('test');
            expect(result.missing).toBeUndefined();
        });
    });

    describe('populateResponseData', () => {
        it('data.item 存在时应处理单个实体', () => {
            const context: any = {
                data: {
                    item: { id: '1', name: 'test' },
                },
                metadata: { hasError: false },
            };

            (manager as any).populateResponseData(context);

            expect(context.data.item).toEqual({ id: '1', name: 'test' });
        });

        it('data.list 为空数组时不应处理', () => {
            const context: any = {
                data: {
                    list: [],
                },
                metadata: { hasError: false },
            };

            (manager as any).populateResponseData(context);

            expect(context.data.list).toEqual([]);
        });

        it('data.list 有数据时应处理每个实体', () => {
            const context: any = {
                data: {
                    list: [
                        { id: '1', name: 'a' },
                        { id: '2', name: 'b' },
                    ],
                },
                metadata: { hasError: false },
            };

            (manager as any).populateResponseData(context);

            expect(context.data.list.length).toBe(2);
        });
    });

    describe('onPopulateEntity', () => {
        it('应返回原始实体', () => {
            const entity = { id: '1', name: 'test' };
            const result = (manager as any).onPopulateEntity({}, entity);
            expect(result).toBe(entity);
        });
    });

    describe('dispose', () => {
        it('应清理数据字段', () => {
            manager.sourceData.set('1', { id: '1' });
            manager.items = [{ id: '1' }];
            manager.item = { id: '1' };
            manager.loading = true;

            manager.dispose();

            expect(manager.sourceData.size).toBe(0);
            expect(manager.items).toEqual([]);
            expect(manager.item).toBeNull();
            expect(manager.loading).toBe(false);
        });
    });
});
