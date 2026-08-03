import { ListensEngine } from '@/component-core/engine/ListensEngine';
import { ComponentEventBus } from '@/events/ComponentEventBus';
import { EntityEventBus } from '@/events/EntityEventBus';
import { SystemEventBus } from '@/events/SystemEventBus';
import { RouteEventBus } from '@/events/RouteEventBus';

jest.mock('@/events/ComponentEventBus', () => {
    const mockBus = {
        componentOn: jest.fn(() => jest.fn()),
        componentOnce: jest.fn(),
        getScopeId: jest.fn(() => 'test-scope'),
        dispose: jest.fn(),
    };
    return {
        ComponentEventBus: {
            getInstance: jest.fn(() => mockBus),
        },
    };
});

jest.mock('@/events/EntityEventBus', () => {
    const mockBus = {
        entityOn: jest.fn(() => jest.fn()),
        entityOnce: jest.fn(),
        getScopeId: jest.fn(() => 'test-scope'),
        dispose: jest.fn(),
    };
    return {
        EntityEventBus: {
            getInstance: jest.fn(() => mockBus),
        },
    };
});

jest.mock('@/events/SystemEventBus', () => {
    const mockBus = {
        on: jest.fn(() => jest.fn()),
        once: jest.fn(),
        getScopeId: jest.fn(() => 'test-scope'),
        dispose: jest.fn(),
    };
    return {
        SystemEventBus: {
            getInstance: jest.fn(() => mockBus),
        },
    };
});

jest.mock('@/events/RouteEventBus', () => {
    const mockBus = {
        routeOn: jest.fn(() => jest.fn()),
        routeOnce: jest.fn(),
        getScopeId: jest.fn(() => 'test-scope'),
        dispose: jest.fn(),
    };
    return {
        RouteEventBus: {
            getInstance: jest.fn(() => mockBus),
        },
    };
});

function makeInstance(overrides: Record<string, any> = {}) {
    const cleanups: (() => void)[] = [];
    const componentBus = ComponentEventBus.getInstance();
    const entityEventBus = EntityEventBus.getInstance();
    const systemEventBus = SystemEventBus.getInstance();
    const routeEventBus = RouteEventBus.getInstance();

    const instance: any = {
        eventKey: 'testComponent',
        entityKey: 'testEntity',
        routeKey: 'testRoute',
        onCleanup: jest.fn((fn: () => void) => cleanups.push(fn)),
        onSave: jest.fn(),
        onCancel: jest.fn(),
        onLocaleChange: jest.fn(),
        onRouteChange: jest.fn(),
        _cleanups: cleanups,
        ...overrides,
    };
    return { instance, componentBus, entityEventBus, systemEventBus, routeEventBus, cleanups };
}

describe('ListensEngine', () => {
    describe('bindListens — bridge', () => {
        it('绑定桥接事件', () => {
            const { instance, componentBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: 'onSave' } },
            ]);
            expect(componentBus.componentOn).toHaveBeenCalledWith(
                'formKey',
                'save',
                expect.any(Function)
            );
        });

        it('once 模式用 componentBus.componentOnce', () => {
            const { instance, componentBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: { handler: 'onSave', once: true } } },
            ]);
            expect(componentBus.componentOnce).toHaveBeenCalledWith(
                'formKey',
                'save',
                expect.any(Function)
            );
        });

        it('eventKey 不存在时跳过', () => {
            const { instance, componentBus } = makeInstance({ eventKey: undefined });
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: 'onSave' } },
            ]);
            expect(componentBus.componentOn).not.toHaveBeenCalled();
        });

        it('eventKey 为 { key } 格式时解析', () => {
            const { instance, componentBus } = makeInstance({ eventKey: { key: 'resolved' } });
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: 'onSave' } },
            ]);
            expect(componentBus.componentOn).toHaveBeenCalledWith(
                'formKey',
                'save',
                expect.any(Function)
            );
        });

        it('注册 onCleanup 回调', () => {
            const { instance } = makeInstance();
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: 'onSave' } },
            ]);
            expect(instance.onCleanup).toHaveBeenCalled();
        });
    });

    describe('bindListens — entity', () => {
        it('绑定实体事件', () => {
            const { instance, entityEventBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { entity: true, events: { listed: 'onSave' } },
            ]);
            expect(entityEventBus.entityOn).toHaveBeenCalledWith(
                'testEntity',
                'listed',
                expect.any(Function)
            );
        });

        it('entityKey 不存在时跳过', () => {
            const { instance, entityEventBus } = makeInstance({ entityKey: undefined });
            ListensEngine.bindListens(instance, [
                { entity: true, events: { listed: 'onSave' } },
            ]);
            expect(entityEventBus.entityOn).not.toHaveBeenCalled();
        });

        it('once 模式用 entityEventBus.entityOnce', () => {
            const { instance, entityEventBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { entity: true, events: { listed: { handler: 'onSave', once: true } } },
            ]);
            expect(entityEventBus.entityOnce).toHaveBeenCalled();
        });
    });

    describe('bindListens — system', () => {
        it('绑定系统事件', () => {
            const { instance, systemEventBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { system: true, events: { 'i18n:localeChange': 'onLocaleChange' } },
            ]);
            expect(systemEventBus.on).toHaveBeenCalledWith(
                'i18n:localeChange',
                expect.any(Function)
            );
        });

        it('once 模式用 systemEventBus.once', () => {
            const { instance, systemEventBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                {
                    system: true,
                    events: { 'i18n:localeChange': { handler: 'onLocaleChange', once: true } },
                },
            ]);
            expect(systemEventBus.once).toHaveBeenCalled();
        });
    });

    describe('bindListens — route', () => {
        it('绑定路由事件', () => {
            const { instance, routeEventBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { route: 'router', events: { change: 'onRouteChange' } },
            ]);
            expect(routeEventBus.routeOn).toHaveBeenCalledWith(
                'router',
                'change',
                expect.any(Function)
            );
        });

        it('once 模式用 routeEventBus.routeOnce', () => {
            const { instance, routeEventBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { route: 'router', events: { change: { handler: 'onRouteChange', once: true } } },
            ]);
            expect(routeEventBus.routeOnce).toHaveBeenCalled();
        });
    });

    describe('bindListens — 边界', () => {
        it('listens 为空数组时跳过', () => {
            const instance: any = { onCleanup: jest.fn() };
            expect(() => ListensEngine.bindListens(instance, [])).not.toThrow();
        });

        it('listens 为 null/undefined 时跳过', () => {
            const instance: any = { onCleanup: jest.fn() };
            expect(() => ListensEngine.bindListens(instance, null as any)).not.toThrow();
            expect(() => ListensEngine.bindListens(instance, undefined as any)).not.toThrow();
        });

        it('方法不存在时 warn', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            const { instance } = makeInstance();
            delete instance.onSave;

            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: 'onSave' } },
            ]);
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('onSave'));
            warnSpy.mockRestore();
        });

        it('bus 不存在时跳过', () => {
            const instance: any = {
                eventKey: 'test',
                onCleanup: jest.fn(),
                onSave: jest.fn(),
            };
            expect(() =>
                ListensEngine.bindListens(instance, [
                    { source: 'formKey', events: { save: 'onSave' } },
                ])
            ).not.toThrow();
        });
    });

    describe('onCleanup 自动解绑', () => {
        it('dispose 时 onCleanup 回调执行 componentOn 返回的 off', () => {
            const { instance, componentBus, cleanups } = makeInstance();
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: 'onSave' } },
            ]);

            expect(componentBus.componentOn).toHaveBeenCalled();
            expect(cleanups.length).toBeGreaterThan(0);
            for (const cleanup of cleanups) cleanup();
        });
    });
});