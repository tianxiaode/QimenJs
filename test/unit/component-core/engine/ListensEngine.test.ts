import { ListensEngine } from '@/component-core/engine/ListensEngine';
import { ComponentEventBus } from '@/events/ComponentEventBus';
import { EntityEventBus } from '@/events/EntityEventBus';
import { SystemEventBus } from '@/events/SystemEventBus';
import { RouteEventBus } from '@/events/RouteEventBus';
import { EventForwarder } from '@/component-core/engine/EventForwarder';

jest.mock('@/events/ComponentEventBus', () => {
    const mockBus = {
        componentOn: jest.fn(() => jest.fn()),
        componentOnce: jest.fn(),
        getScopeId: jest.fn(() => 'test-scope'),
        dispose: jest.fn(),
    };
    return { ComponentEventBus: { getInstance: jest.fn(() => mockBus) } };
});

jest.mock('@/events/EntityEventBus', () => {
    const mockBus = {
        entityOn: jest.fn(() => jest.fn()),
        entityOnce: jest.fn(),
        getScopeId: jest.fn(() => 'test-scope'),
        dispose: jest.fn(),
    };
    return { EntityEventBus: { getInstance: jest.fn(() => mockBus) } };
});

jest.mock('@/events/SystemEventBus', () => {
    const mockBus = {
        on: jest.fn(() => jest.fn()),
        once: jest.fn(),
        getScopeId: jest.fn(() => 'test-scope'),
        dispose: jest.fn(),
    };
    return { SystemEventBus: { getInstance: jest.fn(() => mockBus) } };
});

jest.mock('@/events/RouteEventBus', () => {
    const mockBus = {
        routeOn: jest.fn(() => jest.fn()),
        routeOnce: jest.fn(),
        getScopeId: jest.fn(() => 'test-scope'),
        dispose: jest.fn(),
    };
    return { RouteEventBus: { getInstance: jest.fn(() => mockBus) } };
});

jest.mock('@/component-core/engine/EventForwarder', () => ({
    EventForwarder: {
        forward: jest.fn(),
        resolveKey: jest.fn((key: any) => {
            if (!key) return undefined;
            if (typeof key === 'string') return key;
            if (typeof key === 'object' && key.key) return key.key;
            return undefined;
        }),
    },
}));

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
        onToolbarSave: jest.fn(),
        _cleanups: cleanups,
        nodeMap: {},
        emit: jest.fn(),
        componentEmit: jest.fn(),
        entityEmit: jest.fn(),
        systemEmit: jest.fn(),
        routerEmit: jest.fn(),
        fileEmit: jest.fn(),
        getCustomEventData: jest.fn(() => ({ custom: 'data' })),
        defaultEventData: { default: 'value' },
        ...overrides,
    };
    return { instance, componentBus, entityEventBus, systemEventBus, routeEventBus, cleanups };
}

describe('ListensEngine', () => {
    describe('bindListens — component (source)', () => {
        it('绑定组件事件', () => {
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

        it('once 模式用 componentOnce', () => {
            const { instance, componentBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: { handler: 'onSave', once: true } } },
            ]);
            expect(componentBus.componentOnce).toHaveBeenCalled();
        });

        it('eventKey 不存在时跳过', () => {
            const { instance, componentBus } = makeInstance({ eventKey: undefined });
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: { save: 'onSave' } },
            ]);
            expect(componentBus.componentOn).not.toHaveBeenCalled();
        });

        it('方法不存在时静默跳过（不报错）', () => {
            const { instance } = makeInstance();
            delete instance.onSave;
            expect(() => {
                ListensEngine.bindListens(instance, [
                    { source: 'formKey', events: { save: 'onSave' } },
                ]);
            }).not.toThrow();
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
    });

    describe('bindNodeEvents — 子组件节点事件', () => {
        it('绑定 node 事件', () => {
            const child = {
                on: jest.fn(),
                off: jest.fn(),
            };
            const { instance } = makeInstance();
            instance.nodeMap = { toolbar: { component: child } };

            ListensEngine.bindNodeEvents(instance, [
                { node: 'toolbar', events: { save: true } },
            ]);
            expect(child.on).toHaveBeenCalledWith('save', expect.any(Function));
        });

        it('handler: true 自动推导方法名', () => {
            const child = { on: jest.fn(), off: jest.fn() };
            const { instance } = makeInstance();
            instance.nodeMap = { toolbar: { component: child } };

            ListensEngine.bindNodeEvents(instance, [
                { node: 'toolbar', events: { save: true } },
            ]);

            const handler = child.on.mock.calls[0][1];
            handler({ data: 'test' });
            expect(instance.onToolbarSave).toHaveBeenCalledWith({ data: 'test' });
        });

        it('handler 为字符串时使用指定方法名', () => {
            const child = { on: jest.fn(), off: jest.fn() };
            const { instance } = makeInstance();
            instance.nodeMap = { toolbar: { component: child } };

            ListensEngine.bindNodeEvents(instance, [
                { node: 'toolbar', events: { save: 'onSave' } },
            ]);

            const handler = child.on.mock.calls[0][1];
            handler({ data: 'test' });
            expect(instance.onSave).toHaveBeenCalledWith({ data: 'test' });
        });

        it('once 模式只执行一次', () => {
            const child = { on: jest.fn(), off: jest.fn() };
            const { instance } = makeInstance();
            instance.nodeMap = { toolbar: { component: child } };

            ListensEngine.bindNodeEvents(instance, [
                { node: 'toolbar', events: { save: { handler: 'onSave', once: true } } },
            ]);

            const handler = child.on.mock.calls[0][1];
            handler({ data: 'first' });
            handler({ data: 'second' });
            expect(instance.onSave).toHaveBeenCalledTimes(1);
        });

        it('nodeMap 为空时跳过', () => {
            const { instance } = makeInstance({ nodeMap: undefined });
            expect(() => {
                ListensEngine.bindNodeEvents(instance, [
                    { node: 'toolbar', events: { save: true } },
                ]);
            }).not.toThrow();
        });
    });

    describe('统一转发 — source 事件转发', () => {
        it('接收桥接事件后转发 emits', () => {
            const { instance, componentBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: {
                    save: { handler: 'onSave', emits: ['saved'] },
                }},
            ]);

            const handler = componentBus.componentOn.mock.calls[0][2];
            handler({ value: 42 });

            expect(instance.onSave).toHaveBeenCalledWith({ value: 42 });
            expect(EventForwarder.forward).toHaveBeenCalledWith(
                instance,
                { emits: ['saved'] },
                { value: 42 },
                undefined,
                'save'
            );
        });

        it('接收桥接事件后转发 bridges（ComponentEventBus）', () => {
            const { instance, componentBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: {
                    save: { handler: 'onSave', bridges: ['confirmed'] },
                }},
            ]);

            const handler = componentBus.componentOn.mock.calls[0][2];
            handler({ value: 42 });

            expect(instance.onSave).toHaveBeenCalledWith({ value: 42 });
            expect(EventForwarder.forward).toHaveBeenCalledWith(
                instance,
                { bridges: ['confirmed'] },
                { value: 42 },
                undefined,
                'save'
            );
        });

        it('纯转发（无 handler）', () => {
            const { instance, componentBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: {
                    save: { bridges: ['confirmed'] },
                }},
            ]);

            const handler = componentBus.componentOn.mock.calls[0][2];
            handler({ value: 42 });

            expect(instance.onSave).not.toHaveBeenCalled();
            expect(EventForwarder.forward).toHaveBeenCalled();
        });
    });

    describe('统一转发 — entity 事件转发', () => {
        it('接收实体事件后转发', () => {
            const { instance, entityEventBus } = makeInstance();
            ListensEngine.bindListens(instance, [
                { entity: true, events: {
                    listed: { handler: 'onSave', emits: ['refreshed'] },
                }},
            ]);

            const handler = entityEventBus.entityOn.mock.calls[0][2];
            handler({ items: [] });

            expect(instance.onSave).toHaveBeenCalledWith({ items: [] });
            expect(EventForwarder.forward).toHaveBeenCalledWith(
                instance,
                { emits: ['refreshed'] },
                { items: [] },
                undefined,
                'listed'
            );
        });
    });

    describe('统一转发 — node 事件转发', () => {
        it('接收子组件事件后转发', () => {
            const child = { on: jest.fn(), off: jest.fn() };
            const { instance } = makeInstance();
            instance.nodeMap = { toolbar: { component: child } };

            ListensEngine.bindNodeEvents(instance, [
                { node: 'toolbar', events: {
                    save: { handler: 'onToolbarSave', emits: ['saved'] },
                }},
            ]);

            const handler = child.on.mock.calls[0][1];
            handler({ data: 'test' });

            expect(instance.onToolbarSave).toHaveBeenCalledWith({ data: 'test' });
            expect(EventForwarder.forward).toHaveBeenCalledWith(
                instance,
                { emits: ['saved'] },
                { data: 'test' },
                undefined,
                'save'
            );
        });
    });

    describe('extractNodeEvents', () => {
        it('提取 node 配置', () => {
            const result = ListensEngine.extractNodeEvents([
                { node: 'toolbar', events: { save: true } },
                { source: 'formKey', events: { save: 'onSave' } },
                { node: 'grid', events: { rowClick: true } },
            ]);
            expect(result).toEqual([
                { node: 'toolbar', events: { save: true } },
                { node: 'grid', events: { rowClick: true } },
            ]);
        });

        it('无 node 时返回空数组', () => {
            const result = ListensEngine.extractNodeEvents([
                { source: 'formKey', events: { save: 'onSave' } },
            ]);
            expect(result).toEqual([]);
        });
    });

    describe('数据传递 — defaultEventData + getCustomEventData', () => {
        it('转发时将收到的数据传给 EventForwarder.forward (合并由 EventForwarder 内部完成)', () => {
            const { instance, componentBus } = makeInstance({
                defaultEventData: { default: 'value' },
                getCustomEventData: jest.fn(() => ({ custom: 'data' })),
            });
            ListensEngine.bindListens(instance, [
                { source: 'formKey', events: {
                    save: { bridges: ['saved'] },
                }},
            ]);

            const handler = componentBus.componentOn.mock.calls[0][2];
            handler({ received: 'data' });

            // EventForwarder.forward 被正确调用，收到原始事件数据
            expect(EventForwarder.forward).toHaveBeenCalledWith(
                instance,
                { bridges: ['saved'] },
                { received: 'data' },  // extraData = 收到的事件数据
                undefined,
                'save'
            );
            // defaultEventData / getCustomEventData 的合并由 EventForwarder.collectEventData 内部完成
        });
    });
});
