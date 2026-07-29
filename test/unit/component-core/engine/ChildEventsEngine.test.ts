import { ChildEventsEngine } from '@/component-core/engine/ChildEventsEngine';

function makeChild() {
    const listeners: Record<string, Function[]> = {};
    return {
        on: jest.fn((event: string, handler: Function) => {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(handler);
        }),
        off: jest.fn((event: string, handler: Function) => {
            if (listeners[event]) {
                listeners[event] = listeners[event].filter(h => h !== handler);
            }
        }),
        emit: jest.fn((event: string, ...args: any[]) => {
            if (listeners[event]) {
                listeners[event].forEach(h => h(...args));
            }
        }),
    };
}

function makeInstance() {
    const cleanups: (() => void)[] = [];
    const child = makeChild();
    const instance: any = {
        nodeMap: { toolbar: { component: child } },
        onCleanup: jest.fn((fn: () => void) => cleanups.push(fn)),
        emit: jest.fn(),
        bridgeEmit: jest.fn(),
        entityEmit: jest.fn(),
        routerEmit: jest.fn(),
        systemEmit: jest.fn(),
        bridgeKey: 'testBridge',
        entityKey: 'testEntity',
        routeKey: 'testRoute',
        constructor: { name: 'TestComponent' },
        _currentEventContext: undefined,
        _cleanups: cleanups,
    };
    return { instance, child, cleanups };
}

describe('ChildEventsEngine', () => {
    describe('bindChildEvents — 简写格式', () => {
        it('绑定 string[] 简写事件', () => {
            const handler = jest.fn();
            const { instance, child } = makeInstance();
            instance.onToolbarSave = handler;

            ChildEventsEngine.bindChildEvents(instance, { toolbar: ['save'] });
            expect(child.on).toHaveBeenCalledWith('save', expect.any(Function));
        });

        it('方法名自动推导', () => {
            const handler = jest.fn();
            const { instance } = makeInstance();
            instance.onGridRowClick = handler;
            const child2 = makeChild();
            instance.nodeMap.grid = { component: child2 };

            ChildEventsEngine.bindChildEvents(instance, { grid: ['rowClick'] });
            expect(child2.on).toHaveBeenCalledWith('rowClick', expect.any(Function));
        });

        it('方法不存在时 warn', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            const { instance } = makeInstance();

            ChildEventsEngine.bindChildEvents(instance, { toolbar: ['save'] });
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('onToolbarSave'));
            warnSpy.mockRestore();
        });

        it('子组件不存在时 warn', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            const instance: any = { nodeMap: {}, onCleanup: jest.fn() };

            ChildEventsEngine.bindChildEvents(instance, { missing: ['click'] });
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing'));
            warnSpy.mockRestore();
        });

        it('childEvents 为空时跳过', () => {
            const instance: any = { nodeMap: {}, onCleanup: jest.fn() };
            expect(() => ChildEventsEngine.bindChildEvents(instance, {})).not.toThrow();
        });

        it('nodeMap 不存在时跳过', () => {
            const instance: any = { onCleanup: jest.fn() };
            expect(() => ChildEventsEngine.bindChildEvents(instance, { a: ['b'] })).not.toThrow();
        });

        it('注册 onCleanup 回调', () => {
            const handler = jest.fn();
            const { instance } = makeInstance();
            instance.onToolbarSave = handler;

            ChildEventsEngine.bindChildEvents(instance, { toolbar: ['save'] });
            expect(instance.onCleanup).toHaveBeenCalled();
        });
    });

    describe('bindChildEvents — 详细配置格式', () => {
        it('handler: true 调用本地方法', () => {
            const handler = jest.fn();
            const { instance, child } = makeInstance();
            instance.onToolbarSave = handler;

            ChildEventsEngine.bindChildEvents(instance, {
                toolbar: { save: { handler: true } },
            });

            child.emit('save', { data: 1 });
            expect(handler).toHaveBeenCalledWith({ data: 1 });
        });

        it('emits 转发为组件事件', () => {
            const { instance, child } = makeInstance();

            ChildEventsEngine.bindChildEvents(instance, {
                toolbar: { save: { emits: ['save'] } },
            });

            child.emit('save', { id: 1 });
            expect(instance.emit).toHaveBeenCalledWith('save', expect.anything());
        });

        it('bridges 转发为桥接事件', () => {
            const { instance, child } = makeInstance();

            ChildEventsEngine.bindChildEvents(instance, {
                toolbar: { save: { bridges: ['save'] } },
            });

            child.emit('save', { id: 1 });
            expect(instance.bridgeEmit).toHaveBeenCalled();
        });

        it('entities 转发为实体操作', () => {
            const { instance, child } = makeInstance();

            ChildEventsEngine.bindChildEvents(instance, {
                toolbar: { remove: { entities: 'delete' } },
            });

            child.emit('remove', { id: 1 });
            expect(instance.entityEmit).toHaveBeenCalled();
        });

        it('router 转发为路由事件', () => {
            const { instance, child } = makeInstance();

            ChildEventsEngine.bindChildEvents(instance, {
                toolbar: { nav: { router: 'navigate' } },
            });

            child.emit('nav', { path: '/home' });
            expect(instance.routerEmit).toHaveBeenCalled();
        });

        it('system 转发为系统事件', () => {
            const { instance, child } = makeInstance();

            ChildEventsEngine.bindChildEvents(instance, {
                toolbar: { change: { system: ['localeChange'] } },
            });

            child.emit('change', {});
            expect(instance.systemEmit).toHaveBeenCalled();
        });

        it('once: true 只执行一次后自动 off', () => {
            const handler = jest.fn();
            const { instance, child } = makeInstance();
            instance.onToolbarSave = handler;

            ChildEventsEngine.bindChildEvents(instance, {
                toolbar: { save: { handler: true, once: true } },
            });

            child.emit('save', 1);
            child.emit('save', 2);
            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('handler + emits 共存', () => {
            const handler = jest.fn();
            const { instance, child } = makeInstance();
            instance.onToolbarSave = handler;

            ChildEventsEngine.bindChildEvents(instance, {
                toolbar: { save: { handler: true, emits: ['save'] } },
            });

            child.emit('save', { id: 1 });
            expect(handler).toHaveBeenCalledWith({ id: 1 });
            expect(instance.emit).toHaveBeenCalledWith('save', expect.anything());
        });

        it('nodeMap 中无 component 时直接用 nodeMap 值', () => {
            const child = makeChild();
            const instance: any = {
                nodeMap: { toolbar: child },
                onToolbarSave: jest.fn(),
                onCleanup: jest.fn(),
                emit: jest.fn(),
                bridgeEmit: jest.fn(),
                entityEmit: jest.fn(),
                routerEmit: jest.fn(),
                systemEmit: jest.fn(),
                bridgeKey: 'test',
                entityKey: 'test',
                routeKey: 'test',
                constructor: { name: 'Test' },
                _currentEventContext: undefined,
            };

            ChildEventsEngine.bindChildEvents(instance, { toolbar: ['save'] });
            expect(child.on).toHaveBeenCalledWith('save', expect.any(Function));
        });
    });

    describe('extractChildEvents', () => {
        it('从 listens 数组提取 childEvents', () => {
            const result = ChildEventsEngine.extractChildEvents([
                { childEvents: { toolbar: ['save'] } },
            ]);
            expect(result).toEqual({ toolbar: ['save'] });
        });

        it('提取详细配置格式', () => {
            const result = ChildEventsEngine.extractChildEvents([
                { childEvents: { toolbar: { save: { handler: true } } } },
            ]);
            expect(result).toEqual({ toolbar: { save: { handler: true } } });
        });

        it('无 childEvents 时返回 null', () => {
            expect(ChildEventsEngine.extractChildEvents([{ source: 'x', events: {} }])).toBeNull();
        });

        it('空数组返回 null', () => {
            expect(ChildEventsEngine.extractChildEvents([])).toBeNull();
        });

        it('null/undefined 返回 null', () => {
            expect(ChildEventsEngine.extractChildEvents(null as any)).toBeNull();
            expect(ChildEventsEngine.extractChildEvents(undefined as any)).toBeNull();
        });
    });

    describe('onCleanup 自动解绑', () => {
        it('onCleanup 回调执行 child.off', () => {
            const handler = jest.fn();
            const { instance, child, cleanups } = makeInstance();
            instance.onToolbarSave = handler;

            ChildEventsEngine.bindChildEvents(instance, { toolbar: ['save'] });

            expect(cleanups.length).toBeGreaterThan(0);
            for (const cleanup of cleanups) cleanup();
            expect(child.off).toHaveBeenCalled();
        });
    });
});
