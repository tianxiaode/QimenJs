import { DomEventsEngine } from '@/component-core/engine/DomEventsEngine';
import type { DomEventsMap } from '@/component-core/types/tpl-events';

function makeEl() {
    return document.createElement('div');
}

function makeInstance(domEvents?: DomEventsMap) {
    const cleanups: (() => void)[] = [];
    const el = makeEl();
    const btnEl = makeEl();
    el.appendChild(btnEl);
    const instance: any = {
        el,
        domEvents,
        nodeMap: {
            toolbar: {
                component: {
                    el: btnEl,
                    action: 'save',
                    nodeMap: {},
                },
            },
        },
        nodeMapMgr: { getAll: () => instance.nodeMap },
        on: jest.fn(),
        off: jest.fn(),
        bind: jest.fn(),
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
    return { instance, btnEl, cleanups };
}

describe('DomEventsEngine', () => {
    describe('compileDomEvents', () => {
        it('编译三层嵌套为扁平规则', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'toolbar.Button': {
                        save: { handler: true, emits: ['save'] },
                    },
                },
            };
            const rules = DomEventsEngine.compileDomEvents(domEvents);
            expect(rules).toHaveLength(1);
            expect(rules[0].event).toBe('click');
            expect(rules[0].componentPath).toBe('toolbar.Button');
            expect(rules[0].action).toBe('save');
            expect(rules[0].handler).toBe(true);
            expect(rules[0].emits).toEqual(['save']);
        });

        it('多个事件多个路径编译为多条规则', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'toolbar.Button': {
                        save: { handler: true },
                        create: { handler: true },
                    },
                },
                keypress: {
                    'toolbar.Button': {
                        save: { handler: true },
                    },
                },
            };
            const rules = DomEventsEngine.compileDomEvents(domEvents);
            expect(rules).toHaveLength(3);
        });

        it('空 domEvents 返回空数组', () => {
            expect(DomEventsEngine.compileDomEvents({})).toEqual([]);
        });
    });

    describe('bindDomEvents', () => {
        it('无 domEvents 时跳过', () => {
            const { instance } = makeInstance();
            expect(() => DomEventsEngine.bindDomEvents(instance)).not.toThrow();
        });

        it('绑定 DOM 事件并注册 onCleanup', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'toolbar.Button': {
                        save: { handler: true },
                    },
                },
            };
            const { instance, cleanups } = makeInstance(domEvents);

            DomEventsEngine.bindDomEvents(instance);

            expect(instance.bind).toHaveBeenCalled();
            expect(instance.on).toHaveBeenCalled();
            expect(instance.onCleanup).toHaveBeenCalled();
        });

        it('focus/blur 用 capture', () => {
            const domEvents: DomEventsMap = {
                focus: {
                    'toolbar.Button': {
                        save: { handler: true },
                    },
                },
            };
            const { instance } = makeInstance(domEvents);

            DomEventsEngine.bindDomEvents(instance);

            expect(instance.bind).toHaveBeenCalledWith(instance.el, 'focus', {
                capture: true,
                delegated: true,
            });
        });
    });

    describe('handleDelegatedEvent', () => {
        it('匹配路径和 action 时调用 handler', () => {
            const domEvents: DomEventsMap = {
                click: {
                    toolbar: {
                        save: { handler: true },
                    },
                },
            };
            const { instance, btnEl } = makeInstance(domEvents);
            instance.onToolbarSaveClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);

            const domEvt = { type: 'click', target: btnEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.onToolbarSaveClick).toHaveBeenCalled();
        });

        it('target 不在子组件 el 内时不匹配', () => {
            const domEvents: DomEventsMap = {
                click: {
                    toolbar: {
                        save: { handler: true },
                    },
                },
            };
            const { instance } = makeInstance(domEvents);
            instance.onToolbarSaveClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);

            const otherEl = makeEl();
            const domEvt = { type: 'click', target: otherEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.onToolbarSaveClick).not.toHaveBeenCalled();
        });

        it('事件类型不匹配时不触发', () => {
            const domEvents: DomEventsMap = {
                click: {
                    toolbar: {
                        save: { handler: true },
                    },
                },
            };
            const { instance, btnEl } = makeInstance(domEvents);
            instance.onToolbarSaveClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);

            const domEvt = { type: 'keypress', target: btnEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.onToolbarSaveClick).not.toHaveBeenCalled();
        });

        it('无 target 时跳过', () => {
            const { instance } = makeInstance();
            const rules: any[] = [];
            expect(() => DomEventsEngine.handleDelegatedEvent(instance, {}, rules)).not.toThrow();
        });
    });

    describe('_dispatchRule — 转发', () => {
        it('emits 转发通过 EventForwarder', () => {
            const { instance } = makeInstance();
            const rule: any = {
                event: 'click',
                componentPath: 'toolbar.Button',
                action: 'save',
                emits: ['save'],
            };

            DomEventsEngine._dispatchRule(instance, rule, { type: 'click', target: makeEl() });
            expect(instance.emit).toHaveBeenCalledWith('save', expect.anything());
        });

        it('bridges 转发通过 EventForwarder', () => {
            const { instance } = makeInstance();
            const rule: any = {
                event: 'click',
                componentPath: 'toolbar.Button',
                action: 'save',
                bridges: ['save'],
            };

            DomEventsEngine._dispatchRule(instance, rule, { type: 'click', target: makeEl() });
            expect(instance.bridgeEmit).toHaveBeenCalled();
        });

        it('entities 转发通过 EventForwarder', () => {
            const { instance } = makeInstance();
            const rule: any = {
                event: 'click',
                componentPath: 'toolbar.Button',
                action: 'save',
                entities: 'delete',
            };

            DomEventsEngine._dispatchRule(instance, rule, { type: 'click', target: makeEl() });
            expect(instance.entityEmit).toHaveBeenCalled();
        });

        it('无 handler 且无转发时不调用任何方法', () => {
            const { instance } = makeInstance();
            const rule: any = {
                event: 'click',
                componentPath: 'toolbar.Button',
                action: 'save',
            };

            DomEventsEngine._dispatchRule(instance, rule, { type: 'click', target: makeEl() });
            expect(instance.emit).not.toHaveBeenCalled();
        });
    });
});
