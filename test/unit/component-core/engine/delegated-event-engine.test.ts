import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import type { DelegatedEventRule } from '@/component-core/types/tpl-events';
import { NODE_EVENT_META, COMPONENT_ROOT } from '@/component-core/constants/event-constants';

jest.mock('@/logger', () => ({
    Logger: {
        for: jest.fn(() => ({
            warn: jest.fn(),
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        })),
    },
}));

function makeEl(tag: string = 'div'): HTMLElement {
    return document.createElement(tag);
}

function makeInstance(overrides: Record<string, any> = {}): any {
    return {
        el: makeEl(),
        nodeMap: {} as Record<string, any>,
        emit: jest.fn(),
        bridgeEmit: jest.fn(),
        entityEmit: jest.fn(),
        routerEmit: jest.fn(),
        systemEmit: jest.fn(),
        ...overrides,
    };
}

describe('DelegatedEventEngine', () => {
    describe('compileNodeEmits', () => {
        it('从 nodeMetas.emits 编译规则', () => {
            const nodeMetas = {
                root: { name: 'root', tag: 'div' },
                btn: { name: 'btn', emits: { click: 'btnClick' } },
                field: { name: 'field', emits: { input: 'fieldInput', focus: 'fieldFocus' } },
            };
            const rules = DelegatedEventEngine.compileNodeEmits(nodeMetas);
            expect(rules).toHaveLength(3);
            expect(rules[0]).toEqual({
                nodeName: 'btn',
                event: 'click',
                emits: ['btnClick'],
                needsBinding: true,
            });
            expect(rules[1].nodeName).toBe('field');
            expect(rules[1].event).toBe('input');
            expect(rules[1].emits).toEqual(['fieldInput']);
            expect(rules[2].event).toBe('focus');
            expect(rules[2].emits).toEqual(['fieldFocus']);
        });

        it('跳过 root 节点', () => {
            const nodeMetas = {
                root: { name: 'root', emits: { click: 'rootClick' } },
            };
            const rules = DelegatedEventEngine.compileNodeEmits(nodeMetas);
            expect(rules).toHaveLength(0);
        });

        it('跳过无 emits 的节点', () => {
            const nodeMetas = {
                root: { name: 'root', tag: 'div' },
                btn: { name: 'btn', tag: 'button' },
            };
            const rules = DelegatedEventEngine.compileNodeEmits(nodeMetas);
            expect(rules).toHaveLength(0);
        });

        it('action 和 data 从 nodeMetas 继承', () => {
            const nodeMetas = {
                root: { name: 'root', tag: 'div' },
                saveBtn: {
                    name: 'saveBtn',
                    emits: { click: 'saveClick' },
                    action: 'save',
                    data: ['name'],
                },
            };
            const rules = DelegatedEventEngine.compileNodeEmits(nodeMetas);
            expect(rules[0].action).toBe('save');
            expect(rules[0].data).toEqual(['name']);
        });

        it('空 nodeMetas 返回空数组', () => {
            const rules = DelegatedEventEngine.compileNodeEmits({});
            expect(rules).toEqual([]);
        });
    });

    describe('handleDelegatedEvent', () => {
        it('无 target 时不执行分发', () => {
            const instance = makeInstance();
            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: true },
            ];
            DelegatedEventEngine.handleDelegatedEvent(instance, { type: 'click' }, rules);
            expect(instance.emit).not.toHaveBeenCalled();
        });

        it('无 type 时不执行分发', () => {
            const instance = makeInstance();
            const el = makeEl();
            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: true },
            ];
            DelegatedEventEngine.handleDelegatedEvent(instance, { target: el }, rules);
            expect(instance.emit).not.toHaveBeenCalled();
        });

        it('通过 NODE_EVENT_META 匹配规则并分发', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            rootEl.appendChild(btnEl);
            (btnEl as any)[NODE_EVENT_META] = {
                nodeName: 'btn',
                eventTypes: new Set(['click']),
            };
            (rootEl as any)[COMPONENT_ROOT] = true;

            const instance = makeInstance({
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
            });

            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: true },
            ];
            DelegatedEventEngine.handleDelegatedEvent(
                instance,
                { target: btnEl, type: 'click' },
                rules
            );
            expect(instance.emit).toHaveBeenCalled();
        });

        it('点击不在任何节点内不匹配', () => {
            const rootEl = makeEl();
            const otherEl = makeEl();
            rootEl.appendChild(otherEl);
            (rootEl as any)[COMPONENT_ROOT] = true;

            const instance = makeInstance({
                el: rootEl,
                nodeMap: { btn: { el: makeEl() } },
            });

            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: true },
            ];
            DelegatedEventEngine.handleDelegatedEvent(
                instance,
                { target: otherEl, type: 'click' },
                rules
            );
            expect(instance.emit).not.toHaveBeenCalled();
        });

        it('碰到 COMPONENT_ROOT 停止遍历', () => {
            const rootEl = makeEl();
            const childEl = makeEl();
            rootEl.appendChild(childEl);
            (rootEl as any)[COMPONENT_ROOT] = true;

            const instance = makeInstance({ el: rootEl });

            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: true },
            ];
            DelegatedEventEngine.handleDelegatedEvent(
                instance,
                { target: childEl, type: 'click' },
                rules
            );
            expect(instance.emit).not.toHaveBeenCalled();
        });

        it('从子元素向上遍历找到父节点 NODE_EVENT_META', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            const innerEl = makeEl();
            rootEl.appendChild(btnEl);
            btnEl.appendChild(innerEl);
            (btnEl as any)[NODE_EVENT_META] = {
                nodeName: 'btn',
                eventTypes: new Set(['click']),
            };
            (rootEl as any)[COMPONENT_ROOT] = true;

            const instance = makeInstance({
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
            });

            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: true },
            ];
            DelegatedEventEngine.handleDelegatedEvent(
                instance,
                { target: innerEl, type: 'click' },
                rules
            );
            expect(instance.emit).toHaveBeenCalled();
        });
    });

    describe('_dispatchRule', () => {
        it('emits 转发', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                emit: (name: string, ctx: any) => emitted.push({ name, ctx }),
                eventKey: 'testKey',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                emits: ['btnClick'],
                needsBinding: true,
            };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            expect(emitted).toHaveLength(1);
            expect(emitted[0].name).toBe('btnClick');
            expect(emitted[0].ctx.domEvent).toBe(domEvt);
        });

        it('bridges 转发', () => {
            const el = makeEl();
            const bridged: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                bridgeEmit: (ctx: any) => bridged.push(ctx),
                eventKey: 'testKey',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                bridges: ['btnClick'],
                needsBinding: true,
            };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            expect(bridged).toHaveLength(1);
        });

        it('bridges 无 eventKey 时不转发', () => {
            const el = makeEl();
            const bridged: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                bridgeEmit: (ctx: any) => bridged.push(ctx),
                eventKey: undefined,
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                bridges: ['btnClick'],
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(bridged).toHaveLength(0);
        });

        it('entities 字符串转发', () => {
            const el = makeEl();
            const entitied: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                entityEmit: (ctx: any) => entitied.push(ctx),
                entityKey: 'testEntity',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                entities: 'save',
                needsBinding: true,
            };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            expect(entitied).toHaveLength(1);
        });

        it('entities 无 entityKey 时不转发', () => {
            const el = makeEl();
            const entitied: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                entityEmit: (ctx: any) => entitied.push(ctx),
                entityKey: undefined,
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                entities: 'save',
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(entitied).toHaveLength(0);
        });

        it('router 字符串转发', () => {
            const el = makeEl();
            const routed: any[] = [];
            const instance = {
                nodeMap: { nav: { el } },
                routerEmit: (ctx: any) => routed.push(ctx),
                routeKey: 'testRoute',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'nav',
                event: 'click',
                router: 'users',
                needsBinding: true,
            };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            expect(routed).toHaveLength(1);
        });

        it('router 无 routeKey 时不转发', () => {
            const el = makeEl();
            const routed: any[] = [];
            const instance = {
                nodeMap: { nav: { el } },
                routerEmit: (ctx: any) => routed.push(ctx),
                routeKey: undefined,
            };
            const rule: DelegatedEventRule = {
                nodeName: 'nav',
                event: 'click',
                router: 'users',
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(routed).toHaveLength(0);
        });

        it('system 转发', () => {
            const el = makeEl();
            const systemed: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                systemEmit: (ctx: any) => systemed.push(ctx),
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                system: ['sysClick'],
                needsBinding: true,
            };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            expect(systemed).toHaveLength(1);
        });

        it('节点不存在且 nodeName 非空时直接返回', () => {
            const instance = {
                nodeMap: {},
                emit: jest.fn(),
            };
            const rule: DelegatedEventRule = {
                nodeName: 'nonExist',
                event: 'click',
                emits: ['click'],
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: makeEl() });
            expect(instance.emit).not.toHaveBeenCalled();
        });

        it('nodeName 为空字符串时使用 instance.el', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const instance = {
                el,
                nodeMap: {},
                emit: (name: string, ctx: any) => emitted.push({ name, ctx }),
                eventKey: 'testKey',
            };
            const rule: DelegatedEventRule = {
                nodeName: '',
                event: 'click',
                emits: ['click'],
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(emitted).toHaveLength(1);
        });
    });

    describe('bindDelegatedEvents', () => {
        it('无规则时不执行绑定', () => {
            const instance = {
                constructor: { _nodeEventRules: [] },
                bind: jest.fn(),
                on: jest.fn(),
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            expect(instance.bind).not.toHaveBeenCalled();
            expect(instance.on).not.toHaveBeenCalled();
        });

        it('_nodeEventRules 为 undefined 时不执行绑定', () => {
            const instance = {
                constructor: {},
                bind: jest.fn(),
                on: jest.fn(),
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            expect(instance.bind).not.toHaveBeenCalled();
        });

        it('应绑定所有需要的事件类型', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            const instance = {
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
                bind: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                constructor: {
                    _nodeEventRules: [
                        { nodeName: 'btn', event: 'click', needsBinding: true },
                        { nodeName: 'btn', event: 'dblclick', needsBinding: true },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            expect(instance.bind).toHaveBeenCalledTimes(2);
            expect(instance.on).toHaveBeenCalled();
        });

        it('focus 和 blur 事件应使用捕获模式', () => {
            const rootEl = makeEl();
            const inputEl = makeEl('input');
            const instance = {
                el: rootEl,
                nodeMap: { input: { el: inputEl } },
                bind: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                constructor: {
                    _nodeEventRules: [
                        { nodeName: 'input', event: 'focus', needsBinding: true },
                        { nodeName: 'input', event: 'blur', needsBinding: true },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            const focusCall = instance.bind.mock.calls.find(
                (call: any[]) => call[1] === 'focus' && call[2]?.capture === true
            );
            const blurCall = instance.bind.mock.calls.find(
                (call: any[]) => call[1] === 'blur' && call[2]?.capture === true
            );
            expect(focusCall).toBeDefined();
            expect(blurCall).toBeDefined();
        });

        it('应跳过 needsBinding: false 的规则', () => {
            const instance = {
                el: makeEl(),
                bind: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                constructor: {
                    _nodeEventRules: [{ nodeName: 'btn', event: 'click', needsBinding: false }],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            expect(instance.bind).not.toHaveBeenCalled();
        });

        it('应支持 debounce 选项', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            const instance = {
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
                bind: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                constructor: {
                    _nodeEventRules: [
                        { nodeName: 'btn', event: 'input', needsBinding: true, debounce: 300 },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            const dispatchers = (instance as any)._delegatedDispatchers;
            expect(dispatchers).toBeDefined();
            expect(dispatchers.has('btn::input')).toBe(true);
        });

        it('应支持 throttle 选项', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            const instance = {
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
                bind: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                constructor: {
                    _nodeEventRules: [
                        { nodeName: 'btn', event: 'scroll', needsBinding: true, throttle: 100 },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            const dispatchers = (instance as any)._delegatedDispatchers;
            expect(dispatchers).toBeDefined();
            expect(dispatchers.has('btn::scroll')).toBe(true);
        });

        it('once: true 时 dispatcher 只执行一次', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            const instance = {
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
                bind: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                constructor: {
                    _nodeEventRules: [
                        { nodeName: 'btn', event: 'click', needsBinding: true, once: true },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            const dispatchers = (instance as any)._delegatedDispatchers;
            expect(dispatchers).toBeDefined();
            expect(dispatchers.has('btn::click')).toBe(true);

            const dispatch = dispatchers.get('btn::click');
            expect(dispatch).toBeDefined();

            const domEvt = { type: 'click', target: btnEl };
            dispatch(domEvt);
            dispatch(domEvt);
            expect(instance.on).toHaveBeenCalledTimes(1);
        });

        it('组件节点事件通过委托分发而非直接绑定', () => {
            const rootEl = makeEl();
            const componentEl = makeEl();
            const instance = {
                el: rootEl,
                nodeMap: { icon: { component: { el: componentEl } } },
                bind: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                constructor: {
                    _nodeEventRules: [{ nodeName: 'icon', event: 'click', needsBinding: true }],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            const componentCall = instance.bind.mock.calls.find(
                (call: any[]) => call[0] === componentEl
            );
            expect(componentCall).toBeUndefined();

            const dispatchers = (instance as any)._delegatedDispatchers;
            expect(dispatchers).toBeDefined();
            expect(dispatchers.has('icon::click')).toBe(true);
        });
    });

    describe('_collectEventData', () => {
        it('应调用 instance.getEventData', () => {
            const eventData = { userId: '123', timestamp: 123456 };
            const instance = {
                getEventData: jest.fn().mockReturnValue(eventData),
            };

            const result = DelegatedEventEngine._collectEventData(instance, 'btn', 'click', 'emit');
            expect(instance.getEventData).toHaveBeenCalledWith('btn', 'click', 'emit');
            expect(result).toEqual(eventData);
        });

        it('getEventData 不存在时应返回 undefined', () => {
            const instance = {};

            const result = DelegatedEventEngine._collectEventData(instance, 'btn', 'click', 'emit');
            expect(result).toBeUndefined();
        });
    });

    describe('_buildForwardContext', () => {
        it('应构建包含正确字段的事件上下文', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                emit: (name: string, ctx: any) => emitted.push(ctx),
                eventKey: 'testKey',
                constructor: { name: 'TestComponent' },
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                emits: ['click'],
                needsBinding: true,
            };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });

            expect(emitted.length).toBe(1);
            expect(emitted[0].event).toBe('click');
        });
    });

    describe('_dispatchRule 边界情况', () => {
        it('entities 为非字符串时不转发', () => {
            const el = makeEl();
            const entitied: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                entityEmit: (ctx: any) => entitied.push(ctx),
                entityKey: 'testEntity',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                entities: '' as any,
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(entitied).toHaveLength(0);
        });

        it('router 为非字符串时不转发', () => {
            const el = makeEl();
            const routed: any[] = [];
            const instance = {
                nodeMap: { nav: { el } },
                routerEmit: (ctx: any) => routed.push(ctx),
                routeKey: 'testRoute',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'nav',
                event: 'click',
                router: '' as any,
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(routed).toHaveLength(0);
        });

        it('无 emits/bridges/entities/router/system 时不执行任何转发', () => {
            const el = makeEl();
            const instance = {
                nodeMap: { btn: { el } },
                emit: jest.fn(),
                bridgeEmit: jest.fn(),
                entityEmit: jest.fn(),
                routerEmit: jest.fn(),
                systemEmit: jest.fn(),
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(instance.emit).not.toHaveBeenCalled();
            expect(instance.bridgeEmit).not.toHaveBeenCalled();
            expect(instance.entityEmit).not.toHaveBeenCalled();
            expect(instance.routerEmit).not.toHaveBeenCalled();
            expect(instance.systemEmit).not.toHaveBeenCalled();
        });
    });

    describe('handleDelegatedEvent 使用 dispatcher', () => {
        it('有 dispatcher 时使用 dispatcher 分发', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            rootEl.appendChild(btnEl);
            (btnEl as any)[NODE_EVENT_META] = {
                nodeName: 'btn',
                eventTypes: new Set(['click']),
            };
            (rootEl as any)[COMPONENT_ROOT] = true;

            const dispatchFn = jest.fn();
            const instance = makeInstance({
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
                _delegatedDispatchers: new Map([['btn::click', dispatchFn]]),
            });

            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: true },
            ];
            const domEvt = { target: btnEl, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(instance, domEvt, rules);
            expect(dispatchFn).toHaveBeenCalledWith(domEvt);
        });
    });

    describe('_resolveDataFields', () => {
        it('dataDecl 为 undefined 时返回 undefined', () => {
            const result = (DelegatedEventEngine as any)._resolveDataFields(undefined, 'emit');
            expect(result).toBeUndefined();
        });

        it('dataDecl 为数组时直接返回', () => {
            const dataDecl = ['name', 'age'];
            const result = (DelegatedEventEngine as any)._resolveDataFields(dataDecl, 'emit');
            expect(result).toEqual(['name', 'age']);
        });

        it('dataDecl 为对象时按 eventType 返回', () => {
            const dataDecl = { emit: ['name'], bridge: ['id'] };
            const result = (DelegatedEventEngine as any)._resolveDataFields(dataDecl, 'emit');
            expect(result).toEqual(['name']);
        });
    });

    describe('_collectDataFields', () => {
        it('getXxx 方法调用并合并结果', () => {
            const instance = {
                getData: jest.fn().mockReturnValue({ name: 'test' }),
            };
            const result = (DelegatedEventEngine as any)._collectDataFields(instance, ['getData']);
            expect(instance.getData).toHaveBeenCalled();
            expect(result).toEqual({ name: 'test' });
        });

        it('直接属性访问', () => {
            const instance = { name: 'test' };
            const result = (DelegatedEventEngine as any)._collectDataFields(instance, ['name']);
            expect(result).toEqual({ name: 'test' });
        });

        it('属性不存在时跳过', () => {
            const instance = {};
            const result = (DelegatedEventEngine as any)._collectDataFields(instance, [
                'nonexistent',
            ]);
            expect(result).toEqual({});
        });

        it('getXxx 非 function 时按属性处理', () => {
            const instance = { getFoo: 'not a function' };
            const result = (DelegatedEventEngine as any)._collectDataFields(instance, ['getFoo']);
            expect(result).toEqual({ getFoo: 'not a function' });
        });
    });

    describe('_dispatchRule with data', () => {
        it('有 data 字段时收集数据', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                emit: (name: string, ctx: any) => emitted.push({ name, ctx }),
                eventKey: 'testKey',
                name: 'test',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                emits: ['btnClick'],
                data: ['name'],
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(emitted).toHaveLength(1);
        });

        it('有 action 时包含 action 数据', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                emit: (name: string, ctx: any) => emitted.push({ name, ctx }),
                eventKey: 'testKey',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                emits: ['btnClick'],
                action: 'save',
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(emitted).toHaveLength(1);
        });

        it('data 为 Record 类型时按 eventType 解析', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                emit: (name: string, ctx: any) => emitted.push({ name, ctx }),
                eventKey: 'testKey',
                name: 'test',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                emits: ['btnClick'],
                data: { emit: ['name'] },
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(emitted).toHaveLength(1);
        });
    });

    describe('bindDelegatedEvents capture 分支', () => {
        it('click 事件不使用捕获模式', () => {
            const rootEl = makeEl();
            const instance = {
                el: rootEl,
                bind: jest.fn(),
                on: jest.fn(),
                constructor: {
                    _nodeEventRules: [{ nodeName: 'btn', event: 'click', needsBinding: true }],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            const clickCall = instance.bind.mock.calls.find((call: any[]) => call[1] === 'click');
            expect(clickCall).toBeDefined();
            expect(clickCall[2]?.capture).toBe(false);
        });
    });

    describe('_dispatchRule with getEventData', () => {
        it('有 getEventData 时合并事件数据', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                emit: (name: string, ctx: any) => emitted.push({ name, ctx }),
                eventKey: 'testKey',
                getEventData: jest.fn().mockReturnValue({ extra: 'data' }),
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                emits: ['btnClick'],
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(emitted).toHaveLength(1);
            expect(instance.getEventData).toHaveBeenCalled();
        });

        it('getEventData 返回 undefined 时使用 action 数据', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                emit: (name: string, ctx: any) => emitted.push({ name, ctx }),
                eventKey: 'testKey',
                getEventData: jest.fn().mockReturnValue(undefined),
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                emits: ['btnClick'],
                action: 'save',
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(emitted).toHaveLength(1);
        });
    });
});
