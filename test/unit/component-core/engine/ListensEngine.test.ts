import { ListensEngine } from '@/component-core/engine/ListensEngine';

function makeBus() {
    return {
        on: jest.fn(),
        off: jest.fn(),
        once: jest.fn(),
    };
}

function makeInstance(overrides: Record<string, any> = {}) {
    const cleanups: (() => void)[] = [];
    const eventBridge = makeBus();
    const entityEventBus = makeBus();
    const systemEventBus = makeBus();
    const routeEventBus = makeBus();

    const instance: any = {
        bridgeKey: 'testBridge',
        entityKey: 'testEntity',
        routeKey: 'testRoute',
        onCleanup: jest.fn((fn: () => void) => cleanups.push(fn)),
        getEventBridge: jest.fn(() => eventBridge),
        getEntityEventBus: jest.fn(() => entityEventBus),
        getSystemEventBus: jest.fn(() => systemEventBus),
        getRouteEventBus: jest.fn(() => routeEventBus),
        onSave: jest.fn(),
        onCancel: jest.fn(),
        onLocaleChange: jest.fn(),
        onRouteChange: jest.fn(),
        _cleanups: cleanups,
        ...overrides,
    };
    return { instance, eventBridge, entityEventBus, systemEventBus, routeEventBus, cleanups };
}

describe('ListensEngine', () => {
    describe('bindListens — bridge', () => {
        it('绑定桥接事件', () => {
            const { instance, eventBridge } = makeInstance();
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: 'onSave' } },
            ]);
            expect(eventBridge.on).toHaveBeenCalledWith(
                'testBridge',
                'formKey',
                'save',
                expect.any(Function)
            );
        });

        it('once 模式用 eventBridge.once', () => {
            const { instance, eventBridge } = makeInstance();
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: { handler: 'onSave', once: true } } },
            ]);
            expect(eventBridge.once).toHaveBeenCalledWith(
                'testBridge',
                'formKey',
                'save',
                expect.any(Function)
            );
        });

        it('bridgeKey 不存在时跳过', () => {
            const { instance, eventBridge } = makeInstance({ bridgeKey: undefined });
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: 'onSave' } },
            ]);
            expect(eventBridge.on).not.toHaveBeenCalled();
        });

        it('bridgeKey 为 { key } 格式时解析', () => {
            const { instance, eventBridge } = makeInstance({ bridgeKey: { key: 'resolved' } });
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: 'onSave' } },
            ]);
            expect(eventBridge.on).toHaveBeenCalledWith(
                'resolved',
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
                { entity: 'users', events: { listed: 'onSave' } },
            ]);
            expect(entityEventBus.on).toHaveBeenCalledWith(
                'testEntity',
                'users',
                'listed',
                expect.any(Function)
            );
        });

        it('entityKey 不存在时跳过', () => {
            const { instance, entityEventBus } = makeInstance({ entityKey: undefined });
            ListensEngine.bindListens(instance, [
                { entity: 'users', events: { listed: 'onSave' } },
            ]);
            expect(entityEventBus.on).not.toHaveBeenCalled();
        });

        it('once 模式用 entityEventBus.once', () => {
            const { instance, entityEventBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { entity: 'users', events: { listed: { handler: 'onSave', once: true } } },
            ]);
            expect(entityEventBus.once).toHaveBeenCalled();
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
            expect(routeEventBus.on).toHaveBeenCalledWith('router', 'change', expect.any(Function));
        });

        it('once 模式用 routeEventBus.once', () => {
            const { instance, routeEventBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { route: 'router', events: { change: { handler: 'onRouteChange', once: true } } },
            ]);
            expect(routeEventBus.once).toHaveBeenCalled();
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
                bridgeKey: 'test',
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
        it('dispose 时 onCleanup 回调执行 bus.off', () => {
            const { instance, eventBridge, cleanups } = makeInstance();
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: 'onSave' } },
            ]);

            expect(cleanups.length).toBeGreaterThan(0);
            for (const cleanup of cleanups) cleanup();
            expect(eventBridge.off).toHaveBeenCalled();
        });
    });
});
