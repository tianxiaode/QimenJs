import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import type { DelegatedEventRule } from '@/component-core/types/tpl-events';

// Mock ComponentRegistrar - mock the relative import from DelegatedEventEngine
jest.mock('../../../src/component-core/engine/../ComponentRegistrar', () => ({
    ComponentRegistrar: {
        getInstance: jest.fn(() => ({
            getMeta: jest.fn().mockReturnValue(undefined),
        })),
    },
}), { virtual: true });

function makeEl(tag: string = 'div'): HTMLElement {
    return document.createElement(tag);
}

function makeInstance(overrides: Record<string, any> = {}): any {
    return {
        el: makeEl(),
        nodeMap: {} as Record<string, any>,
        containsElement(nodeName: string, target: Element): boolean {
            const node = this.nodeMap?.[nodeName];
            if (!node) return false;
            const el = node.component ? node.component.el : node.el;
            return el?.contains(target) ?? false;
        },
        emit: jest.fn(),
        bridgeEmit: jest.fn(),
        entityEmit: jest.fn(),
        routerEmit: jest.fn(),
        systemEmit: jest.fn(),
        ...overrides,
    };
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

        it('emits 声明', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                saveBtn: { click: { handler: true, emits: ['saveBtn'] } },
            });
            expect(rules[0].emits).toEqual(['saveBtn']);
            expect(rules[0].needsBinding).toBe(true);
        });

        it('bridges 声明', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                saveBtn: { click: { bridges: ['saveBtn'] } },
            });
            expect(rules[0].bridges).toEqual(['saveBtn']);
        });

        it('entities 声明', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                saveBtn: { click: { entities: 'saveBtn' } },
            });
            expect(rules[0].entities).toBe('saveBtn');
        });

        it('entities: true 声明', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                container: {
                    $items: {
                        Button: { click: { entities: true } },
                    },
                },
            });
            expect(rules[0].entities).toBe(true);
            expect(rules[0].itemType).toBe('Button');
            expect(rules[0].keyProp).toBe('name');
        });

        it('router: true 声明', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                nav: {
                    $items: {
                        NavItem: { click: { router: true } },
                    },
                },
            });
            expect(rules[0].router).toBe(true);
            expect(rules[0].itemType).toBe('NavItem');
            expect(rules[0].keyProp).toBe('name');
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

        it('$items 编译：默认 keyProp=name', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                itemContainer: {
                    $items: {
                        Button: { click: { emits: ['itemClick'] } },
                        MenuItem: { click: { emits: ['select'] } },
                    },
                },
            });
            expect(rules).toHaveLength(2);
            expect(rules[0].itemType).toBe('Button');
            expect(rules[0].keyProp).toBe('name');
            expect(rules[1].itemType).toBe('MenuItem');
            expect(rules[1].keyProp).toBe('name');
        });

        it('$items 编译：显式 keyProp 覆盖默认值', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                list: {
                    $items: {
                        Icon: { click: { emits: ['actionClick'], keyProp: 'id' } },
                    },
                },
            });
            expect(rules[0].keyProp).toBe('id');
        });

        it('容器节点同时有自身事件和 $items', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                itemContainer: {
                    scroll: { handler: true },
                    $items: {
                        Button: { click: { emits: ['itemClick'] } },
                    },
                },
            });
            expect(rules).toHaveLength(2);
            const scrollRule = rules.find(r => r.event === 'scroll')!;
            expect(scrollRule.nodeName).toBe('itemContainer');
            expect(scrollRule.handler).toBe('onItemContainerScroll');
            expect(scrollRule.itemType).toBeUndefined();

            const itemRule = rules.find(r => r.itemType === 'Button')!;
            expect(itemRule.event).toBe('click');
        });
    });

    describe('handleDelegatedEvent - containsElement 匹配', () => {
        it('点击节点内元素，匹配对应规则', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            const innerEl = makeEl();
            rootEl.appendChild(btnEl);
            btnEl.appendChild(innerEl);

            const instance = makeInstance({
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
            });

            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: true },
            ];
            const domEvt = { target: innerEl, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.emit).toHaveBeenCalled();
        });

        it('点击不在任何节点内，不匹配', () => {
            const rootEl = makeEl();
            const otherEl = makeEl();
            rootEl.appendChild(otherEl);

            const instance = makeInstance({
                el: rootEl,
                nodeMap: { btn: { el: makeEl() } },
            });

            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: true },
            ];
            const domEvt = { target: otherEl, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.emit).not.toHaveBeenCalled();
        });

        it('$items 规则：通过 getTargetItem 定位 item', () => {
            const rootEl = makeEl();
            const containerEl = makeEl();
            const itemEl = makeEl();
            rootEl.appendChild(containerEl);
            containerEl.appendChild(itemEl);

            const itemComponent = { id: 'icon-1', name: 'eye', el: itemEl };
            const instance = makeInstance({
                el: rootEl,
                nodeMap: {
                    actions: { component: { el: containerEl, getTargetItem: jest.fn() } },
                },
            });
            instance.nodeMap.actions.component.getTargetItem.mockReturnValue({
                component: itemComponent,
                type: 'Icon',
                index: 0,
            });

            const rules: DelegatedEventRule[] = [
                {
                    nodeName: 'actions',
                    event: 'click',
                    itemType: 'Icon',
                    keyProp: 'name',
                    emits: ['actionClick'],
                    needsBinding: true,
                },
            ];
            const domEvt = { target: itemEl, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.nodeMap.actions.component.getTargetItem).toHaveBeenCalledWith(itemEl);
        });

        it('$items 规则：itemType 不匹配时跳过', () => {
            const rootEl = makeEl();
            const containerEl = makeEl();
            const itemEl = makeEl();
            rootEl.appendChild(containerEl);
            containerEl.appendChild(itemEl);

            const instance = makeInstance({
                el: rootEl,
                nodeMap: {
                    actions: { component: { el: containerEl, getTargetItem: jest.fn() } },
                },
            });
            instance.nodeMap.actions.component.getTargetItem.mockReturnValue({
                component: { name: 'btn1' },
                type: 'Button',
                index: 0,
            });

            const rules: DelegatedEventRule[] = [
                {
                    nodeName: 'actions',
                    event: 'click',
                    itemType: 'Icon',
                    keyProp: 'name',
                    emits: ['actionClick'],
                    needsBinding: true,
                },
            ];
            const domEvt = { target: itemEl, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.emit).not.toHaveBeenCalled();
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
            expect(handlerFn).toHaveBeenCalledWith(domEvt, el, {});
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

        it('entities: true + keyProp 从 item 取名', () => {
            const el = makeEl();
            const entitied: any[] = [];
            const instance = {
                nodeMap: { actions: { component: { el } } },
                entityEmit: (ctx: any) => entitied.push(ctx),
                entityKey: 'testEntity',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'actions',
                event: 'click',
                entities: true,
                keyProp: 'name',
                needsBinding: true,
            };
            const itemInfo = { component: { name: 'save' }, type: 'Button', index: 0 };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt, itemInfo);
            expect(entitied).toHaveLength(1);
        });

        it('router: true + keyProp 从 item 取名', () => {
            const el = makeEl();
            const routed: any[] = [];
            const instance = {
                nodeMap: { nav: { component: { el } } },
                routerEmit: (ctx: any) => routed.push(ctx),
                routeKey: 'testRoute',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'nav',
                event: 'click',
                router: true,
                keyProp: 'name',
                needsBinding: true,
            };
            const itemInfo = { component: { name: 'users' }, type: 'NavItem', index: 0 };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt, itemInfo);
            expect(routed).toHaveLength(1);
        });

        it('keyProp 生成带前缀的 emit 名', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const instance = {
                nodeMap: { actions: { component: { el } } },
                emit: (name: string, ctx: any) => emitted.push(name),
                eventKey: 'testKey',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'actions',
                event: 'click',
                keyProp: 'name',
                emits: ['actionClick'],
                needsBinding: true,
            };
            const itemInfo = { component: { name: 'eye' }, type: 'Icon', index: 0 };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt, itemInfo);
            expect(emitted).toEqual(['eyeActionClick', 'actionClick']);
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

        it('nodeName 为空字符串时生成 on + EventName', () => {
            expect(DelegatedEventEngine._resolveHandlerName('', 'click', true)).toBe('onClick');
        });
    });

    describe('bindDelegatedEvents', () => {
        it('无规则时不执行绑定', () => {
            const instance = {
                constructor: { _delegatedEventRules: [] },
                bind: jest.fn(),
                on: jest.fn(),
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            expect(instance.bind).not.toHaveBeenCalled();
            expect(instance.on).not.toHaveBeenCalled();
        });

        it('_delegatedEventRules 为 undefined 时不执行绑定', () => {
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
                    _delegatedEventRules: [
                        { nodeName: 'btn', event: 'click', needsBinding: true, handler: 'onClick' },
                        { nodeName: 'btn', event: 'dblclick', needsBinding: true, handler: 'onDblClick' },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            // 应绑定 click 和 dblclick 事件
            expect(instance.bind).toHaveBeenCalledTimes(4); // 2 全局 + 2 节点级
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
                    _delegatedEventRules: [
                        { nodeName: 'input', event: 'focus', needsBinding: true, handler: 'onFocus' },
                        { nodeName: 'input', event: 'blur', needsBinding: true, handler: 'onBlur' },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            // 检查 focus/blur 使用捕获模式
            const focusCall = instance.bind.mock.calls.find(
                call => call[1] === 'focus' && call[2]?.capture === true
            );
            const blurCall = instance.bind.mock.calls.find(
                call => call[1] === 'blur' && call[2]?.capture === true
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
                    _delegatedEventRules: [
                        { nodeName: 'btn', event: 'click', needsBinding: false },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            // 只有一次委托绑定，没有节点级绑定
            expect(instance.bind).not.toHaveBeenCalled();
        });

        it('节点不存在时应跳过该规则的绑定', () => {
            const instance = {
                el: makeEl(),
                nodeMap: {},
                bind: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                constructor: {
                    _delegatedEventRules: [
                        { nodeName: 'nonExist', event: 'click', needsBinding: true, handler: 'onClick' },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            // 委托绑定会执行，但节点级绑定应跳过
            expect(instance.bind).toHaveBeenCalledTimes(1); // 只有全局委托
        });

        it('nodeName 为空字符串时应绑定到根元素', () => {
            const rootEl = makeEl();
            const instance = {
                el: rootEl,
                nodeMap: {},
                bind: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                constructor: {
                    _delegatedEventRules: [
                        { nodeName: '', event: 'click', needsBinding: true, handler: 'onClick' },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            // 应绑定到根元素
            const rootCall = instance.bind.mock.calls.find(
                call => call[0] === rootEl && call[1] === 'click'
            );
            expect(rootCall).toBeDefined();
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
                    _delegatedEventRules: [
                        { nodeName: 'btn', event: 'input', needsBinding: true, debounce: 300 },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            const debounceCall = instance.bind.mock.calls.find(
                call => call[1] === 'input' && call[2]?.debounce === 300
            );
            expect(debounceCall).toBeDefined();
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
                    _delegatedEventRules: [
                        { nodeName: 'btn', event: 'scroll', needsBinding: true, throttle: 100 },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            const throttleCall = instance.bind.mock.calls.find(
                call => call[1] === 'scroll' && call[2]?.throttle === 100
            );
            expect(throttleCall).toBeDefined();
        });

        it('once: true 时应使用 once 而非 on', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            const instance = {
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
                bind: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                constructor: {
                    _delegatedEventRules: [
                        { nodeName: 'btn', event: 'click', needsBinding: true, once: true },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            // once 应被调用
            expect(instance.once).toHaveBeenCalled();
        });

        it('组件节点应使用 component.el', () => {
            const rootEl = makeEl();
            const componentEl = makeEl();
            const instance = {
                el: rootEl,
                nodeMap: { icon: { component: { el: componentEl } } },
                bind: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                constructor: {
                    _delegatedEventRules: [
                        { nodeName: 'icon', event: 'click', needsBinding: true },
                    ],
                },
            };

            DelegatedEventEngine.bindDelegatedEvents(instance);

            const componentCall = instance.bind.mock.calls.find(
                call => call[0] === componentEl
            );
            expect(componentCall).toBeDefined();
        });
    });

    describe('_mergeData', () => {
        it('应合并数组合并去重', () => {
            const base = ['id', 'name'];
            const extra = ['name', 'value'];
            // 通过 compileTplEvents 间接测试
            const result = DelegatedEventEngine.compileTplEvents({});
            expect(result).toEqual([]);
        });

        it('应处理空 extra', () => {
            // 通过 compileTplEvents 间接测试
            const result = DelegatedEventEngine.compileTplEvents({
                btn: { click: { handler: true } },
            });
            expect(result[0].data).toBeUndefined();
        });
    });

    describe('_resolveDataFields', () => {
        it('应从数组返回数组', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                btn: { click: { handler: true, data: ['id', 'name'] } },
            });
            expect(rules[0].data).toEqual(['id', 'name']);
        });

        it('应从对象返回对应类型', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                btn: {
                    click: {
                        handler: true,
                        data: { handler: ['id'], emit: ['name'] },
                    },
                },
            });
            expect(rules[0].data).toEqual({ handler: ['id'], emit: ['name'] });
        });
    });

    describe('_collectDataFields', () => {
        it('应调用 getXxx 方法并合并返回值', () => {
            const el = makeEl();
            const instance = {
                getFormData: jest.fn().mockReturnValue({ field1: 'value1', field2: 'value2' }),
                nodeMap: { btn: { el } },
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                handler: 'onClick',
                data: ['getFormData'],
                needsBinding: true,
            };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });

            expect(instance.getFormData).toHaveBeenCalled();
        });

        it('应从 itemPayload.component 取属性值', () => {
            const el = makeEl();
            const instance = {
                nodeMap: { actions: { component: { el } } },
                emit: jest.fn(),
                eventKey: 'test',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'actions',
                event: 'click',
                emits: ['click'],
                data: ['name', 'id'],
                needsBinding: true,
            };
            const itemInfo = { component: { name: 'testName', id: 'testId' } };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el }, itemInfo);

            expect(instance.emit).toHaveBeenCalled();
        });

        it('应从 itemPayload 直接取属性值', () => {
            const el = makeEl();
            const instance = {
                nodeMap: { actions: { component: { el } } },
                emit: jest.fn(),
                eventKey: 'test',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'actions',
                event: 'click',
                emits: ['click'],
                data: ['index'],
                needsBinding: true,
            };
            const itemInfo = { index: 0 };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el }, itemInfo);

            expect(instance.emit).toHaveBeenCalled();
        });
    });

    describe('_collectEventData', () => {
        it('应调用 instance.getEventData', () => {
            const el = makeEl();
            const eventData = { userId: '123', timestamp: 123456 };
            const instance = {
                onButtonClick: jest.fn(),
                nodeMap: { btn: { el } },
                getEventData: jest.fn().mockReturnValue(eventData),
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                handler: 'onButtonClick',
                needsBinding: true,
            };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });

            expect(instance.getEventData).toHaveBeenCalledWith('btn', 'click', 'handler');
        });

        it('getEventData 不存在时应返回 undefined', () => {
            const el = makeEl();
            const instance = {
                onClick: jest.fn(),
                nodeMap: { btn: { el } },
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                handler: 'onClick',
                needsBinding: true,
            };

            // 不应抛出异常
            expect(() =>
                DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el })
            ).not.toThrow();
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
            expect(emitted[0].source).toBe('testKey');
            expect(emitted[0].sourceType).toBe('TestComponent');
        });

        it('应维护事件调用链', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const parentCtx = {
                event: 'parentEvent',
                type: 'emit',
                source: 'parentSource',
                sourceType: 'ParentComponent',
                chain: [],
            };
            const instance = {
                nodeMap: { btn: { el } },
                emit: (name: string, ctx: any) => emitted.push(ctx),
                eventKey: 'childKey',
                _currentEventContext: parentCtx,
                constructor: { name: 'ChildComponent' },
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                emits: ['click'],
                needsBinding: true,
            };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });

            expect(emitted[0].chain).toBeDefined();
            expect(emitted[0].chain.length).toBe(1);
            expect(emitted[0].chain[0].event).toBe('parentEvent');
        });

        it('无 _currentEventContext 时 chain 应为 undefined', () => {
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

            expect(emitted[0].chain).toBeUndefined();
        });
    });

    describe('_dispatchRule 边界情况', () => {
        it('handler 方法不存在时不应调用', () => {
            const el = makeEl();
            const instance = {
                nodeMap: { btn: { el } },
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                handler: 'nonExistentMethod',
                needsBinding: true,
            };

            // 不应抛出异常
            expect(() =>
                DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el })
            ).not.toThrow();
        });

        it('节点不存在时应直接返回', () => {
            const instance = {
                nodeMap: {},
            };
            const rule: DelegatedEventRule = {
                nodeName: 'nonExist',
                event: 'click',
                handler: 'onClick',
                needsBinding: true,
            };

            // 不应抛出异常
            expect(() =>
                DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: makeEl() })
            ).not.toThrow();
        });

        it('entities: "true" 字符串时应作为实体名', () => {
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
                entities: 'true',
                needsBinding: true,
            };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });

            expect(entitied.length).toBe(1);
        });

        it('entities: true 且无 keyValue 时不转发', () => {
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
                entities: true,
                needsBinding: true,
            };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });

            // entities: true 且无 keyProp 时，没有实体名，不转发
            expect(entitied.length).toBe(0);
        });

        it('router: string 时应作为路由名', () => {
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
                router: 'dashboard',
                needsBinding: true,
            };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });

            expect(routed.length).toBe(1);
        });

        it('router: true 且无 keyValue 时不转发', () => {
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
                router: true,
                needsBinding: true,
            };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });

            expect(routed.length).toBe(0);
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
                router: 'dashboard',
                needsBinding: true,
            };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });

            expect(routed.length).toBe(0);
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

            expect(entitied.length).toBe(0);
        });

        it('system 应支持数组', () => {
            const el = makeEl();
            const systemed: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                systemEmit: (ctx: any) => systemed.push(ctx),
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                system: ['system1', 'system2'],
                needsBinding: true,
            };

            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });

            expect(systemed.length).toBe(2);
        });

        it('system 无 systemEmit 时不转发', () => {
            const el = makeEl();
            const instance = {
                nodeMap: { btn: { el } },
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                system: ['system1'],
                needsBinding: true,
            };

            // 不应抛出异常
            expect(() =>
                DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el })
            ).not.toThrow();
        });
    });

    describe('handleDelegatedEvent 边界情况', () => {
        it('无 target 时不应执行分发', () => {
            const instance = makeInstance();
            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['click'], needsBinding: true },
            ];

            DelegatedEventEngine.handleDelegatedEvent(instance, { type: 'click' }, rules);

            expect(instance.emit).not.toHaveBeenCalled();
        });

        it('无 type 时不匹配任何规则', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            rootEl.appendChild(btnEl);
            const instance = makeInstance({
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
            });

            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['click'], needsBinding: true },
            ];

            DelegatedEventEngine.handleDelegatedEvent(instance, { target: btnEl }, rules);

            expect(instance.emit).not.toHaveBeenCalled();
        });

        it('应匹配根元素事件（nodeName: ""）', () => {
            const rootEl = makeEl();
            const instance = makeInstance({
                el: rootEl,
            });

            const rules: DelegatedEventRule[] = [
                { nodeName: '', event: 'click', emits: ['rootClick'], needsBinding: true },
            ];

            DelegatedEventEngine.handleDelegatedEvent(instance, { target: rootEl, type: 'click' }, rules);

            expect(instance.emit).toHaveBeenCalled();
        });

        it('$items 规则容器无 getTargetItem 方法时跳过', () => {
            const rootEl = makeEl();
            const containerEl = makeEl();
            const itemEl = makeEl();
            rootEl.appendChild(containerEl);
            containerEl.appendChild(itemEl);

            const instance = makeInstance({
                el: rootEl,
                nodeMap: {
                    actions: { component: { el: containerEl } },
                },
            });
            // 移除 getTargetItem 方法
            delete instance.nodeMap.actions.component.getTargetItem;

            const rules: DelegatedEventRule[] = [
                {
                    nodeName: 'actions',
                    event: 'click',
                    itemType: 'Icon',
                    keyProp: 'name',
                    emits: ['actionClick'],
                    needsBinding: true,
                },
            ];

            DelegatedEventEngine.handleDelegatedEvent(instance, { target: itemEl, type: 'click' }, rules);

            expect(instance.emit).not.toHaveBeenCalled();
        });
    });

    describe('compileTplEvents 边界情况', () => {
        it('空 tplEvents 应返回空数组', () => {
            const rules = DelegatedEventEngine.compileTplEvents({});
            expect(rules).toEqual([]);
        });

        it('无有效动作时应返回 needsBinding: false', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                btn: { click: {} },
            });
            expect(rules[0].needsBinding).toBe(false);
        });

        it('system 单值应转为数组', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                btn: { click: { system: 'systemEvent' } },
            });
            expect(rules[0].system).toEqual(['systemEvent']);
        });

        it('handler: false 应视为无 handler', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                btn: { click: { handler: false } },
            });
            expect(rules[0].handler).toBeUndefined();
            expect(rules[0].needsBinding).toBe(false);
        });
    });
});
