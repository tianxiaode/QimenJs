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
                schema: { name: 'test', idField: 'id', fields: [] },
            }),
            register: jest.fn(),
        })),
    },
}));

import { DataDispatchCenter } from '@/entity/dispatch/DataDispatchCenter';

describe('DataDispatchCenter', () => {
    let center: DataDispatchCenter;

    beforeEach(() => {
        jest.clearAllMocks();
        center = new DataDispatchCenter();
    });

    afterEach(() => {
        center.dispose();
    });

    describe('registerType / unregisterType', () => {
        it('应注册和注销 entityType', () => {
            class MockMgr {
                static entityType = 'test';
                constructor() {}
                dispose() {}
            }
            center.registerType('test', MockMgr as any);
            expect(center.has('test')).toBe(true);
            center.unregisterType('test');
            expect(center.has('test')).toBe(false);
        });
    });

    describe('connect / disconnect', () => {
        class MockMgr {
            static entityType = 'mock';
            entityKey = 'mock';
            dispose = jest.fn();
            constructor(config?: Record<string, any>) {
                if (config?.entityKey) this.entityKey = config.entityKey;
            }
        }

        it('首次 connect 应创建实例', () => {
            center.registerType('mock', MockMgr as any);
            const mgr = center.connect('mock');
            expect(mgr).toBeInstanceOf(MockMgr);
            expect(mgr.entityKey).toBe('mock');
        });

        it('重复 connect 应复用实例并增加 refCount', () => {
            center.registerType('mock', MockMgr as any);
            const mgr1 = center.connect('mock');
            const mgr2 = center.connect('mock');
            expect(mgr1).toBe(mgr2);
        });

        it('带 name 的 entityKey 应正确 resolve entityType', () => {
            center.registerType('mock', MockMgr as any);
            const mgr = center.connect('mock:instance1');
            expect(mgr.entityKey).toBe('mock:instance1');
        });

        it('disconnect 应减少 refCount', () => {
            center.registerType('mock', MockMgr as any);
            center.connect('mock');
            center.connect('mock');
            center.disconnect('mock');
            const mgr = center.getManager('mock');
            expect(mgr).toBeDefined();
        });

        it('refCount 归零应 dispose 实例', () => {
            const mockDispose = jest.fn();
            class DisposableMgr {
                static entityType = 'disp';
                entityKey = 'disp';
                dispose = mockDispose;
            }
            center.registerType('disp', DisposableMgr as any);
            center.connect('disp');
            center.disconnect('disp');
            expect(mockDispose).toHaveBeenCalled();
            expect(center.getManager('disp')).toBeUndefined();
        });

        it('未注册的 entityType 应抛出错误', () => {
            expect(() => center.connect('unknown')).toThrow('not registered');
        });
    });

    describe('registerDict', () => {
        it('应注册词典并可通过 connect 获取实例', () => {
            const data = [
                { value: 'a', label: 'A' },
                { value: 'b', label: 'B' },
            ];
            center.registerDict('statusOptions', data);
            expect(center.has('statusOptions')).toBe(true);
            const mgr = center.connect('statusOptions');
            expect(mgr).toBeDefined();
        });

        it('注册的词典数据应注入到 Manager 的 sourceData', () => {
            const data = [
                { value: 'active', label: '启用' },
                { value: 'disabled', label: '禁用' },
            ];
            center.registerDict('status', data);
            const mgr = center.connect('status') as any;
            expect(mgr.sourceData.size).toBe(2);
            expect(mgr.sourceData.get('active')).toEqual({ value: 'active', label: '启用' });
        });

        it('dictConfig 应传递给 DictionaryManager', () => {
            const data = [
                { code: 1, text: '选项一' },
                { code: 2, text: '选项二' },
            ];
            center.registerDict('priority', data, {
                valueField: 'code',
                labelField: 'text',
                idType: 'number',
            });
            const mgr = center.connect('priority') as any;
            expect(mgr.schema.idField).toBe('code');
            expect(mgr.schema.nameField).toBe('text');
            expect(mgr.schema.idType).toBe('number');
            expect(mgr.sourceData.get(1)).toEqual({ code: 1, text: '选项一' });
        });

        it('unregisterDict 应移除注册', () => {
            center.registerDict('temp', [{ value: 'x', label: 'X' }]);
            expect(center.has('temp')).toBe(true);
            center.unregisterDict('temp');
            expect(center.has('temp')).toBe(false);
        });
    });

    describe('getManager', () => {
        it('已连接时应返回 Manager', () => {
            class MockMgr {
                static entityType = 'm';
                dispose() {}
            }
            center.registerType('m', MockMgr as any);
            const mgr = center.connect('m');
            expect(center.getManager('m')).toBe(mgr);
        });

        it('未连接时应返回 undefined', () => {
            expect(center.getManager('notexist')).toBeUndefined();
        });
    });

    describe('dispose', () => {
        it('应清理所有实例', () => {
            const mockDispose1 = jest.fn();
            const mockDispose2 = jest.fn();
            class Mgr1 {
                static entityType = 'a';
                dispose = mockDispose1;
            }
            class Mgr2 {
                static entityType = 'b';
                dispose = mockDispose2;
            }
            center.registerType('a', Mgr1 as any);
            center.registerType('b', Mgr2 as any);
            center.connect('a');
            center.connect('b');
            center.dispose();
            expect(mockDispose1).toHaveBeenCalled();
            expect(mockDispose2).toHaveBeenCalled();
        });
    });
});
