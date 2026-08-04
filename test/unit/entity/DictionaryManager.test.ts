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

jest.mock('@/registry', () => {
    const actual = jest.requireActual('@/registry');
    return {
        ...actual,
        RegistryHub: {
            get: jest.fn(),
        },
    };
});

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

jest.mock('@/permission', () => ({
    PermissionRegistrar: {
        getInstance: jest.fn(() => ({
            hasPermission: jest.fn().mockReturnValue(true),
        })),
    },
}));

jest.mock('@/context', () => ({
    RequestContextBuilder: {
        create: jest.fn(() => ({
            withIdentity: jest.fn().mockReturnThis(),
            withRequest: jest.fn().mockReturnThis(),
            withParams: jest.fn().mockReturnThis(),
            withSchema: jest.fn().mockReturnThis(),
            build: jest.fn().mockReturnValue({}),
        })),
    },
    EventContextBuilder: {
        create: jest.fn(() => ({
            withEvent: jest.fn().mockReturnThis(),
            withType: jest.fn().mockReturnThis(),
            withSource: jest.fn().mockReturnThis(),
            withData: jest.fn().mockReturnThis(),
            build: jest.fn().mockReturnValue({}),
        })),
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

jest.mock('@/schema', () => ({
    SchemaRegistrar: {
        getInstance: jest.fn(() => ({
            has: jest.fn().mockReturnValue(true),
            getCompiled: jest.fn().mockReturnValue({
                schema: { name: '_dictionary', idField: 'value', fields: [] },
            }),
            register: jest.fn(),
        })),
    },
}));

import { DictionaryManager } from '@/entity/manager/DictionaryManager';
import type { DictionaryManagerConfig } from '@/entity/manager/DictionaryManager';

describe('DictionaryManager', () => {
    let mgr: DictionaryManager;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        mgr?.dispose();
    });

    describe('构造与默认值', () => {
        it('默认 schema 应使用 value/label/string', () => {
            mgr = new DictionaryManager({ data: [] });
            expect(mgr.schema.idField).toBe('value');
            expect(mgr.schema.idType).toBe('string');
            expect(mgr.schema.nameField).toBe('label');
            expect(mgr.isRemote).toBe(false);
        });

        it('dictConfig 应覆盖 schema 字段', () => {
            mgr = new DictionaryManager({
                data: [],
                valueField: 'code',
                labelField: 'text',
                idType: 'number',
                searchFields: ['text'],
                defaultSort: 'code',
                defaultOrder: 'desc',
            });
            expect(mgr.schema.idField).toBe('code');
            expect(mgr.schema.nameField).toBe('text');
            expect(mgr.schema.idType).toBe('number');
            expect(mgr.schema.searchFields).toEqual(['text']);
            expect(mgr.schema.defaultSort).toBe('code');
            expect(mgr.schema.defaultOrder).toBe('desc');
        });

        it('entityKey 应从 config 获取', () => {
            mgr = new DictionaryManager({ data: [], entityKey: 'statusOptions' });
            expect(mgr.entityKey).toBe('statusOptions');
        });
    });

    describe('loadDictionary', () => {
        it('应按 valueField 填充 sourceData', () => {
            mgr = new DictionaryManager({
                data: [
                    { value: 'active', label: '启用' },
                    { value: 'disabled', label: '禁用' },
                ],
            });
            expect(mgr.sourceData.size).toBe(2);
            expect(mgr.sourceData.get('active')).toEqual({ value: 'active', label: '启用' });
            expect(mgr.sourceData.get('disabled')).toEqual({ value: 'disabled', label: '禁用' });
        });

        it('应支持自定义 valueField', () => {
            mgr = new DictionaryManager({
                data: [
                    { code: 1, text: '选项一' },
                    { code: 2, text: '选项二' },
                ],
                valueField: 'code',
                labelField: 'text',
            });
            expect(mgr.sourceData.size).toBe(2);
            expect(mgr.sourceData.get(1)).toEqual({ code: 1, text: '选项一' });
        });

        it('应跳过 value 为 null/undefined 的项', () => {
            mgr = new DictionaryManager({
                data: [
                    { value: 'a', label: 'A' },
                    { value: null, label: 'B' },
                    { value: undefined, label: 'C' },
                ],
            });
            expect(mgr.sourceData.size).toBe(1);
        });

        it('重复调用应清空旧数据', () => {
            mgr = new DictionaryManager({ data: [{ value: 'old', label: '旧' }] });
            expect(mgr.sourceData.size).toBe(1);
            mgr.loadDictionary([{ value: 'new', label: '新' }]);
            expect(mgr.sourceData.size).toBe(1);
            expect(mgr.sourceData.has('old')).toBe(false);
            expect(mgr.sourceData.get('new')).toEqual({ value: 'new', label: '新' });
        });
    });

    describe('FlatLocalStateAbility 方法', () => {
        beforeEach(() => {
            mgr = new DictionaryManager({
                data: [
                    { value: 'active', label: '启用' },
                    { value: 'disabled', label: '禁用' },
                    { value: 'pending', label: '待审核' },
                ],
                searchFields: ['label'],
            });
        });

        it('filter 应设置 search.keyword', () => {
            mgr.search = {};
            (mgr as any).filter('启');
            expect(mgr.search.keyword).toBe('启');
        });

        it('sort 应设置 search.sortBy 和 sortOrder', () => {
            mgr.search = {};
            (mgr as any).sort('label', 'desc');
            expect((mgr.search as any).sortBy).toBe('label');
            expect((mgr.search as any).sortOrder).toBe('desc');
        });

        it('refreshView 应过滤和排序', async () => {
            mgr.search = { keyword: '启', sortBy: 'label', sortOrder: 'asc' };
            await (mgr as any).refreshView();
            expect(mgr.items.length).toBe(1);
            expect(mgr.items[0].value).toBe('active');
        });

        it('matchKeyword 应按 searchFields 匹配', () => {
            mgr.search = { keyword: '禁' };
            expect((mgr as any).matchKeyword({ value: 'disabled', label: '禁用' })).toBe(true);
            expect((mgr as any).matchKeyword({ value: 'active', label: '启用' })).toBe(false);
        });

        it('isEmpty/total 应反映 items 状态', async () => {
            await (mgr as any).refreshView();
            expect((mgr as any).isEmpty).toBe(false);
            expect((mgr as any).total).toBe(3);
        });
    });
});
