import { EventForwarder } from '@/component-core/engine/EventForwarder';

function makeInstance(overrides: Record<string, any> = {}) {
    return {
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
        ...overrides,
    };
}

describe('EventForwarder', () => {
    describe('forward — emits', () => {
        it('emits 转发为组件事件', () => {
            const instance = makeInstance();
            EventForwarder.forward(instance, { emits: ['save', 'commit'] }, { id: 1 });
            expect(instance.emit).toHaveBeenCalledTimes(2);
            expect(instance.emit).toHaveBeenCalledWith('save', expect.anything());
            expect(instance.emit).toHaveBeenCalledWith('commit', expect.anything());
        });

        it('emits 为空数组时不转发', () => {
            const instance = makeInstance();
            EventForwarder.forward(instance, { emits: [] });
            expect(instance.emit).not.toHaveBeenCalled();
        });
    });

    describe('forward — bridges', () => {
        it('bridges 转发为桥接事件', () => {
            const instance = makeInstance();
            EventForwarder.forward(instance, { bridges: ['save'] }, { id: 1 });
            expect(instance.bridgeEmit).toHaveBeenCalledWith(expect.anything());
        });

        it('bridgeKey 不存在时不转发', () => {
            const instance = makeInstance({ bridgeKey: undefined });
            EventForwarder.forward(instance, { bridges: ['save'] });
            expect(instance.bridgeEmit).not.toHaveBeenCalled();
        });

        it('bridgeKey 为 { key, fixed } 格式时解析', () => {
            const instance = makeInstance({ bridgeKey: { key: 'fixed', fixed: true } });
            EventForwarder.forward(instance, { bridges: ['save'] });
            expect(instance.bridgeEmit).toHaveBeenCalled();
        });
    });

    describe('forward — entities', () => {
        it('entities 转发为实体操作（具体事件名）', () => {
            const instance = makeInstance();
            EventForwarder.forward(instance, { entities: 'delete' }, { id: 1 });
            expect(instance.entityEmit).toHaveBeenCalledWith(expect.anything());
            expect(instance.entityEmit.mock.calls[0][0].event).toBe('delete');
        });

        it('entities 为 [action] 时用 actualAction 替换', () => {
            const instance = makeInstance();
            EventForwarder.forward(
                instance,
                { entities: '[action]' },
                { id: 1 },
                undefined,
                'remove'
            );
            expect(instance.entityEmit).toHaveBeenCalledWith(expect.anything());
            expect(instance.entityEmit.mock.calls[0][0].event).toBe('remove');
        });

        it('entityKey 不存在时不转发', () => {
            const instance = makeInstance({ entityKey: undefined });
            EventForwarder.forward(instance, { entities: 'delete' });
            expect(instance.entityEmit).not.toHaveBeenCalled();
        });
    });

    describe('forward — router', () => {
        it('router 转发为路由事件', () => {
            const instance = makeInstance();
            EventForwarder.forward(instance, { router: 'navigate' }, { path: '/home' });
            expect(instance.routerEmit).toHaveBeenCalledWith(expect.anything());
        });

        it('无 getForwardFilter 时全放行（含 router）', () => {
            const instance = makeInstance();
            EventForwarder.forward(instance, { router: 'navigate' });
            expect(instance.routerEmit).toHaveBeenCalledWith(expect.anything());
        });

        it('getForwardFilter 不含 router 时不转发', () => {
            const instance = makeInstance({ getForwardFilter: () => ['emit'] });
            EventForwarder.forward(instance, { router: 'navigate' }, { path: '/home' });
            expect(instance.routerEmit).not.toHaveBeenCalled();
        });

        it('getForwardFilter 含 router 时转发', () => {
            const instance = makeInstance({ getForwardFilter: () => ['emit', 'router'] });
            EventForwarder.forward(instance, { router: 'navigate' }, { path: '/home' });
            expect(instance.routerEmit).toHaveBeenCalledWith(expect.anything());
        });
    });

    describe('forward — system', () => {
        it('system 转发为系统事件', () => {
            const instance = makeInstance();
            EventForwarder.forward(instance, { system: ['localeChange', 'themeChange'] });
            expect(instance.systemEmit).toHaveBeenCalledTimes(2);
        });

        it('system 为空数组时不转发', () => {
            const instance = makeInstance();
            EventForwarder.forward(instance, { system: [] });
            expect(instance.systemEmit).not.toHaveBeenCalled();
        });
    });

    describe('forward — 空配置', () => {
        it('所有字段为空时不调用任何方法', () => {
            const instance = makeInstance();
            EventForwarder.forward(instance, {});
            expect(instance.emit).not.toHaveBeenCalled();
            expect(instance.bridgeEmit).not.toHaveBeenCalled();
            expect(instance.entityEmit).not.toHaveBeenCalled();
            expect(instance.routerEmit).not.toHaveBeenCalled();
            expect(instance.systemEmit).not.toHaveBeenCalled();
        });
    });

    describe('forward — domEvent 附加', () => {
        it('emits 时 domEvent 挂到 ctx 上', () => {
            const instance = makeInstance();
            const domEvt = { type: 'click', target: {} };
            EventForwarder.forward(instance, { emits: ['save'] }, {}, domEvt);
            const ctx = instance.emit.mock.calls[0][1];
            expect(ctx.domEvent).toBe(domEvt);
        });
    });

    describe('collectEventData', () => {
        it('合并 defaultEventData + getCustomEventData + extraData', () => {
            const instance = {
                defaultEventData: { formId: 'f1' },
                getCustomEventData: () => ({ userId: 'u1' }),
            };
            const result = EventForwarder.collectEventData(instance, { action: 'save' });
            expect(result).toEqual({ formId: 'f1', userId: 'u1', action: 'save' });
        });

        it('无 defaultEventData 时返回空对象 + extra', () => {
            const instance = {};
            const result = EventForwarder.collectEventData(instance, { x: 1 });
            expect(result).toEqual({ x: 1 });
        });

        it('extraData 为 undefined 时返回基础数据', () => {
            const instance = { defaultEventData: { a: 1 } };
            const result = EventForwarder.collectEventData(instance);
            expect(result).toEqual({ a: 1 });
        });

        it('继承链合并：子类 super.defaultEventData', () => {
            class Base {
                get defaultEventData() {
                    return { base: 1 };
                }
            }
            class Child extends Base {
                get defaultEventData() {
                    return { ...super.defaultEventData, child: 2 };
                }
            }
            const instance = new Child();
            const result = EventForwarder.collectEventData(instance);
            expect(result).toEqual({ base: 1, child: 2 });
        });
    });

    describe('resolveKey', () => {
        it('string 直接返回', () => {
            expect(EventForwarder.resolveKey('myKey')).toBe('myKey');
        });

        it('{ key, fixed } 返回 key', () => {
            expect(EventForwarder.resolveKey({ key: 'myKey', fixed: true })).toBe('myKey');
        });

        it('undefined 返回 undefined', () => {
            expect(EventForwarder.resolveKey(undefined)).toBeUndefined();
        });

        it('null 返回 undefined', () => {
            expect(EventForwarder.resolveKey(null)).toBeUndefined();
        });

        it('空对象返回 undefined', () => {
            expect(EventForwarder.resolveKey({})).toBeUndefined();
        });
    });

    describe('buildContext', () => {
        it('构建 EventContext 含 event/source/sourceType', () => {
            const instance = makeInstance();
            const ctx = EventForwarder.buildContext(
                instance,
                'save',
                { id: 1 },
                'mySource',
                'emit'
            );
            expect(ctx.event).toBe('save');
            expect(ctx.source).toBe('mySource');
            expect(ctx.sourceType).toBe('TestComponent');
        });

        it('有 _currentEventContext 时构建 chain', () => {
            const instance = makeInstance({
                _currentEventContext: {
                    event: 'click',
                    type: 'click',
                    source: 'btn',
                    sourceType: 'Button',
                    chain: [],
                },
            });
            const ctx = EventForwarder.buildContext(instance, 'save', {}, 'src', 'emit');
            expect(ctx.chain).toBeDefined();
            expect(ctx.chain!.length).toBe(1);
            expect(ctx.chain![0].event).toBe('click');
        });

        it('无 _currentEventContext 时 chain 为 undefined', () => {
            const instance = makeInstance();
            const ctx = EventForwarder.buildContext(instance, 'save', {}, 'src', 'emit');
            expect(ctx.chain).toBeUndefined();
        });
    });
});
