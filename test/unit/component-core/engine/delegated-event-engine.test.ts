import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import type { DelegatedEventRule } from '@/component-core/types/tpl-events';

function makeEl(tag: string = 'div'): HTMLElement {
    return document.createElement(tag);
}

function makeNodeMap(entries: Record<string, { el?: Element; component?: any }>) {
    return entries;
}

describe('DelegatedEventEngine', () => {
    describe('compileTplEvents', () => {
        it('编译数组声明（纯声明，零绑定）', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                btn: ['click'],
                field: ['input', 'focus'],
            });
            expect(rules).toHaveLength(3);
            expect(rules[0]).toEqual({ nodeName: 'btn', event: 'click', needsBinding: false });
            expect(rules[1]).toEqual({ nodeName: 'field', event: 'input', needsBinding: false });
            expect(rules[2]).toEqual({ nodeName: 'field', event: 'focus', needsBinding: false });
        });

        it('编译对象声明（内部处理）', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                eye: { click: { handler: true } },
                field: { input: { handler: 'onInput', debounce: 300 } },
            });
            expect(rules).toHaveLength(2);
            expect(rules[0].nodeName).toBe('eye');
            expect(rules[0].event).toBe('click');
            expect(rules[0].handler).toBe('onEyeClick');
            expect(rules[0].needsBinding).toBe(true);
            expect(rules[0].debounce).toBeUndefined();

            expect(rules[1].nodeName).toBe('field');
            expect(rules[1].handler).toBe('onInput');
            expect(rules[1].needsBinding).toBe(true);
            expect(rules[1].debounce).toBe(300);
        });

        it('emits 自动用 nodeName', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                saveBtn: { click: { handler: true, emits: ['saveBtn'] } },
            });
            expect(rules[0].emits).toEqual(['saveBtn']);
            expect(rules[0].needsBinding).toBe(true);
        });

        it('bridges 自动用 nodeName', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                saveBtn: { click: { bridges: ['saveBtn'] } },
            });
            expect(rules[0].bridges).toEqual(['saveBtn']);
        });

        it('entities 自动用 nodeName', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                saveBtn: { click: { entities: 'saveBtn' } },
            });
            expect(rules[0].entities).toBe('saveBtn');
        });

        it('纯声明 + 对象混合', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                btn: ['click'],
                eye: { click: { handler: true } },
            });
            expect(rules).toHaveLength(2);
            expect(rules.find(r => r.nodeName === 'btn')!.needsBinding).toBe(false);
            expect(rules.find(r => r.nodeName === 'eye')!.needsBinding).toBe(true);
        });
    });

    describe('buildNodeElMap', () => {
        it('构建 el → nodeName 反向映射', () => {
            const btnEl = makeEl();
            const fieldEl = makeEl();
            const instance = {
                nodeMap: {
                    btn: { el: btnEl },
                    field: { el: fieldEl },
                },
            };
            const map = DelegatedEventEngine.buildNodeElMap(instance);
            expect(map.get(btnEl)).toBe('btn');
            expect(map.get(fieldEl)).toBe('field');
        });

        it('子组件取 component.el', () => {
            const compEl = makeEl();
            const instance = {
                nodeMap: {
                    item: { component: { el: compEl } },
                },
            };
            const map = DelegatedEventEngine.buildNodeElMap(instance);
            expect(map.get(compEl)).toBe('item');
        });
    });

    describe('buildChildEventIndex', () => {
        it('只收集子组件节点', () => {
            const compEl = makeEl();
            const domEl = makeEl();
            const instance = {
                nodeMap: {
                    item: { component: { el: compEl } },
                    label: { el: domEl },
                },
            };
            const index = DelegatedEventEngine.buildChildEventIndex(instance);
            expect(index).toHaveLength(1);
            expect(index[0].nodeName).toBe('item');
            expect(index[0].el).toBe(compEl);
        });

        it('没有子组件时返回空数组', () => {
            const instance = {
                nodeMap: {
                    label: { el: makeEl() },
                },
            };
            const index = DelegatedEventEngine.buildChildEventIndex(instance);
            expect(index).toHaveLength(0);
        });
    });

    describe('handleDelegatedEvent - 子组件委托', () => {
        it('点击子组件内部元素，匹配父组件的 rules', () => {
            const rootEl = makeEl();
            const childEl = makeEl();
            const innerEl = makeEl();
            rootEl.appendChild(childEl);
            childEl.appendChild(innerEl);

            const dispatched: string[] = [];
            const instance = {
                el: rootEl,
                nodeMap: { item: { component: { el: childEl } } },
                emit: (name: string) => dispatched.push(name),
            };

            const rules: DelegatedEventRule[] = [
                { nodeName: 'item', event: 'click', emits: ['itemClick'], needsBinding: true },
            ];
            const nodeElMap = new WeakMap<Element, string>();
            nodeElMap.set(childEl, 'item');
            const childEventIndex = [{ nodeName: 'item', el: childEl, rules: [] }];

            const domEvt = { target: innerEl, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(
                instance,
                domEvt,
                rules,
                nodeElMap,
                childEventIndex
            );

            expect(dispatched).toContain('itemClick');
        });

        it('点击不在任何子组件内，走自身 nodeElMap 查找', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            rootEl.appendChild(btnEl);

            const dispatched: string[] = [];
            const instance = {
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
                emit: (name: string) => dispatched.push(name),
            };

            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: false },
            ];
            const nodeElMap = new WeakMap<Element, string>();
            nodeElMap.set(btnEl, 'btn');
            const childEventIndex: any[] = [];

            const domEvt = { target: btnEl, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(
                instance,
                domEvt,
                rules,
                nodeElMap,
                childEventIndex
            );

            expect(dispatched).toContain('btnClick');
        });

        it('点击子组件内部，不匹配其他子组件', () => {
            const rootEl = makeEl();
            const childA = makeEl();
            const childB = makeEl();
            const innerA = makeEl();
            rootEl.appendChild(childA);
            rootEl.appendChild(childB);
            childA.appendChild(innerA);

            const dispatched: string[] = [];
            const instance = {
                el: rootEl,
                nodeMap: {
                    itemA: { component: { el: childA } },
                    itemB: { component: { el: childB } },
                },
                emit: (name: string) => dispatched.push(name),
            };

            const rules: DelegatedEventRule[] = [
                { nodeName: 'itemA', event: 'click', emits: ['aClick'], needsBinding: true },
                { nodeName: 'itemB', event: 'click', emits: ['bClick'], needsBinding: true },
            ];
            const nodeElMap = new WeakMap<Element, string>();
            const childEventIndex = [
                { nodeName: 'itemA', el: childA, rules: [] },
                { nodeName: 'itemB', el: childB, rules: [] },
            ];

            const domEvt = { target: innerA, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(
                instance,
                domEvt,
                rules,
                nodeElMap,
                childEventIndex
            );

            expect(dispatched).toContain('aClick');
            expect(dispatched).not.toContain('bClick');
        });
    });

    describe('嵌套组件场景', () => {
        it('Parent → A → C: 点击 C 内部，Parent 分发自己的 A 事件，不是 C 的事件', () => {
            const rootEl = makeEl();
            const aEl = makeEl();
            const cEl = makeEl();
            const cInner = makeEl();
            rootEl.appendChild(aEl);
            aEl.appendChild(cEl);
            cEl.appendChild(cInner);

            const parentDispatched: string[] = [];
            const parentInstance = {
                el: rootEl,
                nodeMap: { a: { component: { el: aEl } } },
                emit: (name: string) => parentDispatched.push(name),
            };

            const parentRules: DelegatedEventRule[] = [
                { nodeName: 'a', event: 'click', emits: ['abc1', 'abc2'], needsBinding: true },
            ];
            const parentNodeElMap = new WeakMap<Element, string>();
            parentNodeElMap.set(aEl, 'a');
            const parentChildIndex = [{ nodeName: 'a', el: aEl, rules: [] }];

            const domEvt = { target: cInner, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(
                parentInstance,
                domEvt,
                parentRules,
                parentNodeElMap,
                parentChildIndex
            );

            expect(parentDispatched).toEqual(['abc1', 'abc2']);
            expect(parentDispatched).not.toContain('c1');
        });

        it('C 组件自己也处理事件（DOM 冒泡自然触发）', () => {
            const rootEl = makeEl();
            const cEl = makeEl();
            const cInner = makeEl();
            rootEl.appendChild(cEl);
            cEl.appendChild(cInner);

            const cDispatched: string[] = [];
            const cInstance = {
                el: cEl,
                nodeMap: { icon: { el: cInner } },
                emit: (name: string) => cDispatched.push(name),
            };

            const cRules: DelegatedEventRule[] = [
                { nodeName: 'icon', event: 'click', emits: ['c1', 'c2'], needsBinding: false },
            ];
            const cNodeElMap = new WeakMap<Element, string>();
            cNodeElMap.set(cInner, 'icon');
            const cChildIndex: any[] = [];

            const domEvt = { target: cInner, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(
                cInstance,
                domEvt,
                cRules,
                cNodeElMap,
                cChildIndex
            );

            expect(cDispatched).toEqual(['c1', 'c2']);
        });
    });

    describe('_dispatchRule', () => {
        it('handler 调用', () => {
            const el = makeEl();
            const handlerFn = jest.fn();
            const instance = {
                onEyeClick: handlerFn,
                nodeMap: { eye: { el } },
            };
            const rule: DelegatedEventRule = {
                nodeName: 'eye',
                event: 'click',
                handler: 'onEyeClick',
                needsBinding: true,
            };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            expect(handlerFn).toHaveBeenCalledWith(domEvt, el);
        });

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

        it('entities 转发', () => {
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
    });

    describe('_resolveHandlerName', () => {
        it('handler: true 自动推导', () => {
            expect(DelegatedEventEngine._resolveHandlerName('eye', 'click', true)).toBe(
                'onEyeClick'
            );
            expect(DelegatedEventEngine._resolveHandlerName('field', 'input', true)).toBe(
                'onFieldInput'
            );
        });

        it('handler: string 直接使用', () => {
            expect(DelegatedEventEngine._resolveHandlerName('eye', 'click', 'onToggle')).toBe(
                'onToggle'
            );
        });

        it('handler: undefined 返回 undefined', () => {
            expect(
                DelegatedEventEngine._resolveHandlerName('eye', 'click', undefined)
            ).toBeUndefined();
        });
    });
});
